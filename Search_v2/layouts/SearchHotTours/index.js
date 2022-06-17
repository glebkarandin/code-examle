import React from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';

import SubscriptionForm from '../../../../components_next/SubscriptionForm';
import SkeletonH1 from '../../../../components_next/StyleGuides/Skeleton/SkeletonH1';
import Meta from '../../../../components/shared/Meta';
import RTBHouseRenderer from './rtb';
import {WithMinPriceOffersComponent} from '../../../../components/WithMinPriceOffers';
import {OfferTilesComponent} from '../../../../components/OfferTiles';
import GTMEvents from '../../../../Services/AnalyticsService/GTMEvents';
import {CONSTANTS} from '../../../../constants';
import {SearchResults} from '../../../../components/SearchResults';
import {SearchBox} from '../../../../components/SearchBox';
import SearchFilters from '../../../../components/SearchFilters';
import {SortPanel} from '../../../../components/SortPanel';
import {mapFiltersForOldForm, mapSearchParams} from './mappers';
import MobileFilterButton from './MobileFilterButton';
import {getSortBy, getSortButtons, getSortButtonsMobile} from '../sortButtons';
import SearchResultsCount from './SearchResultsCount';
import {SearchProvider} from '../../../../utils';
import {BreadCrumbs} from '../../../../components/BreadCrumbs';
import {intlShape} from '../../../../intl/propTypes';
import {MindboxPopmechanic} from '../../../../components_next/MindboxPopmechanic';

const OffersMinPricesBlock = WithMinPriceOffersComponent(OfferTilesComponent);
const gtmEvents = new GTMEvents();

/**
 * Основной компонент рендера для страницы горящих туров
 * @component
 * @param {object} intl
 * @param {array} toursRaw - все пришедшие туры с сервера без изменений
 * @param {array} tours - отфильтрованные туры
 * @param {object} linksGeo - блок сео-ссылок в фильтрах
 * @param {object} groupedFilters
 * @param {object} isToursLoading - состояние запроса search by name
 * @param {object} isGeoContentLoading - состояние цепочки запросов гео-контента
 * @param {object} parameters - пакеты исходных параметров страницы
 * @param {object} triggers - различные переключатели режимов
 * @param {object} handlers - обработчики событий UI
 * @param {object} state - рабочие переменные
 * @param {array} breadCrumbs - список пар: имя ссылки, ссылка.
 */
const SearchHotTours = (
	{
		intl, parameters, toursRaw, tours, linksGeo,
		groupedFilters, triggers, handlers, state,
		isToursLoading, isGeoContentLoading,
		breadCrumbs,
	}) => {

	const {size, sortType, isMobileFiltersShown} = state;
	const {
		onFormSearch, onFormChange, onSortResults, onFilterChange,
		onFiltersReset, resetFilters, onToggleMobileFilters, onGeoLink, onMoreResults,
	} = handlers;

	const sortBy = getSortBy(intl);
	const sortButtons = getSortButtons(intl, 'allhottours');
	const sortButtonsMobile = getSortButtonsMobile(intl, 'allhottours');

	const {params, geoParams} = parameters || {};
	const {hotelFilters} = groupedFilters || {};

	if (!groupedFilters) {
		return null;
	}

	const {searchFilters} = groupedFilters;
	const formFilters = mapFiltersForOldForm(searchFilters);

	const {isRootUrl, isMobile, isServerSide, isResetFilters} = triggers;

	// TODO выяснить зачем IF
	if (!params) {
		return null;
	}

	const searchType = CONSTANTS.URL_SEARCH_TYPE.hotTours;
	const flocktoryObj = {
		dateFrom: params.dateFrom,
		dateDelta: params.dateDelta || 0,
		nightsFrom: params.nightsFrom,
		nightsTo: params.nightsTo,
		adults: params.adults,
		children: params.children,
		newbies: params.newbies,
		childrenAges: params.childrenAges,
	};

	const meta = SearchProvider.buildHotToursMetaTags(geoParams, 0, tours, intl, isRootUrl);

	return (
		<div>
			<Meta metaObject={meta} />
			<div className="SearchPage__head">
				{isMobile
					? <div className="HotToursPage-breadcrumbs-container">
						<BreadCrumbs items={breadCrumbs} />
					</div>
					: null
				}
				<SearchBox
					isEdit
					isChangeViewEnabled={isMobile}
					page={0}
					values={cloneDeep(params)}	// форма поиска меняет params напрямую и это трудно отследить, поэтому cloneDeep
					filters={formFilters}
					isMobile={isMobile}
					isTablet={isMobile}
					onSearch={params => onFormSearch(mapSearchParams(params))}
					onChange={onFormChange}
					error={null}
					checkParams={['Region', 'ArrivalTown']}
					autoRunFirstSearch={false}
					autoCloseDatepickerOnChange
				/>
				{!isMobile
					? <div className="HotToursPage-breadcrumbs-container">
						<BreadCrumbs items={breadCrumbs} />
					</div>
					: null
				}
			</div>
			<div className="HotToursPage clearfix">
				<div className="HotToursPage-filters">
					<SearchFilters
						isFiltersLoading={isGeoContentLoading}
						filters={hotelFilters}
						allParams={params}
						searchResults={toursRaw}
						shownResults={tours}
						onChange={onFilterChange}
						onClose={onToggleMobileFilters}
						isMobile={isMobile}
						isOpen={isMobileFiltersShown}
						isServerSide={isServerSide}
						totalCount={(toursRaw || {}).length}
						shownCount={(tours || {}).length}
						isResetFilters={isResetFilters}
						onResetFilters={onFiltersReset}
						geoLinks={linksGeo}
						onGeoLink={onGeoLink}
					/>
				</div>
				<div className="HotToursPage-content">
					<div className="content-results">
						<div className="search-top-filters">
							{isGeoContentLoading
								? <SkeletonH1 />
								: <h1>{meta.h1}</h1>}
							{
								// TODO если запрос на поиск при первоначальной загрузки не нужне, убрать isRootUrl
								!isRootUrl && (
									<>
										<SearchResultsCount {...{isToursLoading, tours, intl}} />
										<SortPanel
											isToursLoading={isToursLoading}
											isTours={!!(tours && tours.length)}
											sortButtons={sortButtons}
											sortButtonsMobile={sortButtonsMobile}
											label={sortBy}
											onSort={onSortResults}
											isMobile={isMobile}
											currentSortType={sortType}
											showAscSelector
										/>
									</>
								)
							}
						</div>
						{
							isRootUrl
								? <OffersMinPricesBlock
									searchType={searchType}
									id="hottours"
								/>
								: <SearchResults
									isToursLoading={isToursLoading}
									searchType={searchType}
									searchResults={tours}
									size={size}
									isMobile={isMobile}
									location={window.location}
									flocktoryObj={flocktoryObj}
									onMore={onMoreResults}
									onHotelClickGTM={gtmEvents.hotelClick}
									resetFilters={resetFilters}
								/>
						}
					</div>
				</div>
				<MobileFilterButton {...{isMobile, onToggleMobileFilters, isMobileFiltersShown}} />
			</div>
			<MindboxPopmechanic
				categoryId={`${params.directionFrom}${params.directionCountryTo}`}
				personalRecommendations
				popularHotels
				update
			/>
			<SubscriptionForm />
			<RTBHouseRenderer {...{params, tours}} />
		</div>
	);
};

SearchHotTours.defaultProps = {
	tours: null,
	groupedFilters: null,
	seoText: null,
};

SearchHotTours.propTypes = {
	state: PropTypes.shape({
		size: PropTypes.number,
		sortType: PropTypes.number,
		isMobileFiltersShown: PropTypes.bool,
	}).isRequired,
	intl: intlShape.isRequired,
	parameters: PropTypes.objectOf(PropTypes.shape).isRequired,
	toursRaw: PropTypes.arrayOf(PropTypes.shape).isRequired,
	tours: PropTypes.arrayOf(PropTypes.shape),
	groupedFilters: PropTypes.objectOf(PropTypes.shape),
	linksGeo: PropTypes.objectOf(PropTypes.shape).isRequired,
	triggers: PropTypes.objectOf(PropTypes.bool).isRequired,
	handlers: PropTypes.objectOf(PropTypes.func).isRequired,
	isToursLoading: PropTypes.bool.isRequired,
	isGeoContentLoading: PropTypes.bool.isRequired,
	seoText: PropTypes.string,
	breadCrumbs: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SearchHotTours;
