import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {isEqual, parseISO} from 'date-fns';
import {SORT_TYPES} from '../../constants';
import {goToUrl, injectIntl, parsePath, parseQuery, replaceUrl, isPrerender} from '../../utils';
import SearchHotTours from './layouts/SearchHotTours';
import SearchHotels from './layouts/SearchHotels';
import SearchMain from './layouts/Search';
import GTMEvents from '../../Services/AnalyticsService/GTMEvents';
import {sortBy} from '../../components/SortPanel/logic';
import GEOGRAPHY_ACTIONS from '../../Services/GeoService/constants';
import ParamsController from './params/ParamsController';

import '../HotTours/index.styl';
import SEARCH_V2_ACTIONS, {ROUT_MAIN_PAGE, ROUT_SEARCH_HOT_TOURS, ROUT_SEARCH_MAIN, ROUT_SEARCH_HOTELS} from './constants';
import GeoParamsController from '../../Services/GeoService/GeoParamsController';
import FiltersDataService from './data/filters/FiltersDataService';
import SearchDataService from '../../Services/SearchService/SearchDataService';
import MainPageLayout from './layouts/MainPage';
import SearchSettings from './SearchSettings';
import {intlShape} from '../../intl/propTypes';
import mapParamsToItems from './params/mapper';
import {AnalyticsService} from '../../Services/AnalyticsService';

/**
 * Общая логика для всех видов поиска. Общие запросы, обработка параметров и т.п.
 * Компонент получает роут и по роуту определяет тип страницы поиска.
 */

@injectIntl()
@connect(({token, user, searchV2, geography, browser}) => ({
	token,
	user,
	browser,
	searchV2,
	geography,
}), dispatch => ({dispatch}))

class SearchV2 extends React.Component {
	/**
	 * constructor
	 * @property {object} triggers - различные переключатели режимов
	 * @property {object} state - рабочие переменные
	 */
	constructor(...args) {
		super(...args);

		const {browser, match: {path: route}} = this.props;
		const path = parsePath();
		const params = parseQuery();

		this.triggers = {
			isSeoUrl: path.length > 1,
			isRootUrl: path.length === 1 && !params.directionCountryTo,
			isMobile: browser.lessThanOrEqual.tabletHigh,
			isServerSide: isPrerender,
			isResetFilters: false,
		};

		let sortType = null;

		if (params.sortType) {
			sortType = params.sortType;
		} else {
			sortType = SORT_TYPES.price;
		}

		this.state = {
			size: 10,
			byAsc: true,
			sortType,
			isMobileFiltersShown: false,
			isResetFilters: false,
		};
	}

	componentDidMount() {
		const {user} = this.props;
		this.init();
		AnalyticsService.sendPageView(user);
	}

	/**
	 * Инициализация параметров
	 * - получаем серверные данные по фильтрам, гео, поиску
	 */
	init() {
		/** Получаем исходные параметры страницы */
		const {intl, match: {path}} = this.props;
		SearchSettings.init(path);
		const {searchParamsDefault} = SearchSettings.getSettings();
		ParamsController.init(searchParamsDefault);
		FiltersDataService.init(intl);

		/** Запрашиваем серверные данные */
		this.getData();
	}

	/** Запрос, получение и обработка серверных данных */
	getData = updateDataWhenFormChanged => {
		const {dispatch, match: {path}} = this.props;
		const {isSeoUrl} = this.triggers;
		const params = ParamsController.getAllParams();
		GeoParamsController.updateGeoParamsFromUrl(params);

		/** Запрашиваем id гео объектов (если SEO урл на старте) */
		if (isSeoUrl && !updateDataWhenFormChanged) {
			ParamsController.setSeoMonth(GeoParamsController.geoParams.monthId);
			/**
			 * Первым запускается запрос geoIds
			 * В саге на удачное завершение geoIds (GEO_IDS_SUCCESS) подписано обновление параметров (updateParamsWithGeoIds)
			 * На обновление параметров (SEARCH_PARAMS_UPDATE) подписан запрос фильтров (requestFilters)
			 * На удачное завершение запроса фильтров (FILTERS_SERVER_SUCCESS) подписан запрос поиска (requestTours)
			 * Удачный запрос поиска туров (TOURS_SUCCESS) обновляет данных туров в redux store
			 *
			 * Одновременно на FILTERS_SERVER_SUCCESS подписан запрос requestGeoNames
			 *
			 * Одновременно на удачное завершение geoIds (GEO_IDS_SUCCESS) подписан запрос requestGeoGrammar
			 */
			dispatch({type: GEOGRAPHY_ACTIONS.GEO_IDS_REQUEST});
		} else {
			/**
			 * Без первого запроса geoIds нужно запустить запрос на фильтры и geoGrammar
			 * Далее по цепочке указанной выше
			 */
			dispatch({type: SEARCH_V2_ACTIONS.FILTERS_SERVER_REQUESTED, payload: updateDataWhenFormChanged});
			dispatch({type: GEOGRAPHY_ACTIONS.GEO_GRAMMAR_REQUEST});
		}

		if (params.directionCountryTo && path === ROUT_SEARCH_MAIN) {
			// Seo text на текущий момент нужен только для стандартного поиска.
			// Страница поиска должна отличаться от Горящих туров.
			dispatch({type: SEARCH_V2_ACTIONS.SEO_TEXT_REQUEST, payload: params.directionCountryTo});
		}
	};

	/** Запрос отдельно поисковой выдачи */
	getSearchData = () => {
		const {dispatch} = this.props;
		dispatch({type: SEARCH_V2_ACTIONS.TOURS_REQUESTED});
	};

	/** Обновляем параметры, измененные в UI */
	updateParams = params => {
		ParamsController.replaceAllParams(params);
		const urlParams = ParamsController.getParamsForUrl();
		replaceUrl({query: urlParams});
	};

	skipUpdateFilters = (newParams, oldParams) => {
		const MEMBERS = ['adults', 'children'];
		const NIGHTSCOUNT = ['nightsTo', 'nightsFrom'];
		const isMembers = MEMBERS.find(item => newParams[item] !== oldParams[item]);
		const isNightCount = NIGHTSCOUNT.find(item => newParams[item] !== oldParams[item]);
		const isDate = !isEqual(parseISO(newParams.dateFrom), parseISO(oldParams.dateFrom));
		return isMembers || isNightCount || isDate;
	}

	/** При изменении данных в форме поиска - снова запрашиваем пакет вспомогательных данных
	 * Это нужно, например, при выборе другой страны в форме - списки регионов и городов должны обновиться
	 * */
	onFormChange = (newParams) => {
		const params = ParamsController.getAllParams();
		this.updateParams(newParams);
		this.triggers.isResetFilters = true;
		this.getData(this.skipUpdateFilters(newParams, params));
	};

	/** При новом поиске через форму */
	onFormSearch = () => {
		const {match: {path}, history} = this.props;
		this.getSearchData();
		this.triggers.isRootUrl = false;

		// Редирект если запрос осуществленный с главной страницы
		if (path === ROUT_MAIN_PAGE) {
			const urlParams = ParamsController.getParamsForUrl();
			goToUrl({
				...urlParams,
				pathname: '/search/',
			}, history);
		}
	};

	/** При изменении фильтров в UI */
	onFilterChange = (search, paramsNext) => {
		console.log('on filter change ++++++++++++++++++++++ paramsNext ', paramsNext)
		// TODO Постараться вынести фильтрацию и сортировку в сагу
		const {dispatch} = this.props;
		const {sortType, byAsc} = this.state;
		const toursSorted = sortBy(search, sortType, byAsc);
		const params = ParamsController.getAllParams();
		this.updateParams({...params, ...paramsNext});
		dispatch({type: SEARCH_V2_ACTIONS.FILTERS_CLIENTS_UPDATE, payload: toursSorted});
	};

	resetFilters = () => {
		this.triggers.isResetFilters = true;
		this.setState({isResetFilters: true});
	}

	/** При сбросе фильтров */
	onFiltersReset = () => {
		this.triggers.isResetFilters = false;
	};

	/** При клике на кнопку показа фильтров в мобильной верстке */
	onToggleMobileFilters = (p) => {
		let {isMobileFiltersShown} = this.state;
		isMobileFiltersShown = typeof p === 'boolean' ? p : !isMobileFiltersShown;
		this.setState({isMobileFiltersShown});
	};

	/** При клике на сортировку поисковой выдачи */
	onSortResults = (sortType, byAsc) => {
		// TODO Постараться вынести фильтрацию и сортировку в сагу
		const {dispatch} = this.props;
		const tours = SearchDataService.getToursModified();
		const toursSorted = sortBy(tours, sortType, byAsc);

		const params = ParamsController.getAllParams();
		this.updateParams({...params, sortType});

		this.setState({sortType, byAsc}, () => {
			dispatch({type: SEARCH_V2_ACTIONS.FILTERS_CLIENTS_UPDATE, payload: toursSorted});
		});
	};

	/** При клике на "еще результаты" в поисковой выдаче */
	onMoreResults = () => {
		const {size} = this.state;
		const tours = SearchDataService.getToursModified();
		this.setState({size: size + 10});
		new GTMEvents().searchToursMore(tours, size);
	};

	/** При переходе по гео линку */
	onGeoLink = (params, obj, pathname) => {
		ParamsController.updateParamsFromGeoLink(params);
		const url = {
			query: ParamsController.getAllParams(),
			pathname: pathname.toLowerCase(),
		};
		replaceUrl(url);
		this.triggers.isSeoUrl = true;
		this.getData();
	};

	render = () => {
		const {match: {
			path,
		},
		geography: {
			isGeoContentLoading,
		},
		searchV2: {
			linksGeo, isFiltersLoading, isToursLoading, seoText,
		}, intl} = this.props;

		const groupedFilters = FiltersDataService.getGroupedFilters();

		const allParams = ParamsController.getAllParams();
		const geoParams = GeoParamsController.getGeoParams();
		const toursRaw = SearchDataService.getToursRaw();
		const tours = SearchDataService.getToursModified();
		const parameters = {
			params: allParams,
			geoParams,
		};
		const {triggers, state} = this;
		const {
			onFormChange, onFormSearch, onFilterChange,
			onFiltersReset, resetFilters, onToggleMobileFilters,
			onSortResults, onMoreResults, onGeoLink
		} = this;
		const handlers = {
			onFormChange, onFormSearch, onFilterChange,
			onFiltersReset, resetFilters, onToggleMobileFilters,
			onSortResults, onMoreResults, onGeoLink
		};
		const breadCrumbs = mapParamsToItems({geoParams, intl, path});

		let SearchLayout = null;
		switch (path) {
			case ROUT_SEARCH_HOT_TOURS:
				SearchLayout = SearchHotTours;
				break;
			case ROUT_SEARCH_HOTELS:
				SearchLayout = SearchHotels;
				break;
			case ROUT_MAIN_PAGE:
				SearchLayout = MainPageLayout;
				break;
			default:
				SearchLayout = SearchMain;
		}

		return (<SearchLayout
			intl={intl}
			parameters={parameters}
			toursRaw={toursRaw}
			tours={tours}
			linksGeo={linksGeo}
			groupedFilters={groupedFilters}
			triggers={triggers}
			handlers={handlers}
			state={state}
			isFiltersLoading={isFiltersLoading}
			isToursLoading={isToursLoading}
			isGeoContentLoading={isGeoContentLoading}
			seoText={seoText}
			breadCrumbs={breadCrumbs}
		/>);
	}
}

SearchV2.defaultProps = {
	browser: {},
	dispatch: () => {},
	searchV2: null,
	geography: null,
	intl: null,
};

SearchV2.propTypes = {
	searchV2: PropTypes.objectOf(PropTypes.shape),
	geography: PropTypes.objectOf(PropTypes.shape),
	browser: PropTypes.objectOf(PropTypes.object),
	match: PropTypes.objectOf(PropTypes.shape).isRequired,
	history: PropTypes.objectOf(PropTypes.shape).isRequired,
	dispatch: PropTypes.func,
	intl: intlShape,
};

export default SearchV2;
