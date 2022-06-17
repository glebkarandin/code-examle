import {all, put, select, takeLatest} from 'redux-saga/effects';

import GEOGRAPHY_ACTIONS from '../../Services/GeoService/constants';
import GeoDataService from '../../Services/GeoService/GeoDataService';
import GeoParamsController from '../../Services/GeoService/GeoParamsController';
import SearchDataService from '../../Services/SearchService/SearchDataService';
import SEARCH_V2_ACTIONS from './constants';
import {ALERT_ACTIONS} from '../../actions';
import {mapRequestParams} from './data/search';
import ParamsController from './params/ParamsController';
import {SearchService} from '../../Services/SearchService';
import {CONSTANTS} from '../../constants';
import FiltersDataService from './data/filters/FiltersDataService';
import mapLinksGeo from './data/filters/links';
import SearchSettings from './SearchSettings';
import Logger from '../../Services/Logger';
import sortBy from '../../components/SortPanel/logic';
import {AnalyticsService} from '../../Services/AnalyticsService';

function* requestSeoText(action) {
	try {
		const {payload} = action;
		const {data, status} = yield SearchService.getSeoTextById(payload);

		if (status === 200) {
			yield put({type: SEARCH_V2_ACTIONS.SEO_TEXT_SUCCESS, payload: data});
		}
	} catch (e) {
		Logger.log({
			level: 'error',
			message: `error requestSeoText:${e}`,
		});
	}
}

function* requestTours() {
	try {
		const {user} = yield select();
		const params = yield ParamsController.getAllParams();
		const methodName = CONSTANTS.URL_SEARCH_TYPE.search;
		const requestParams = yield mapRequestParams(params);
		AnalyticsService.sendSearchRequestEvent(window.location.pathname, requestParams);
		const {data, status} = yield SearchService.getSearchResults(requestParams, methodName);

		if (status === 200) {
			yield SearchDataService.mapSearchByCountryResponse(data);
			let tours = yield SearchDataService.getToursRaw();
			const searchSettings = SearchSettings.getSettings();
			if (searchSettings.sortType) {
				tours = yield sortBy(tours, searchSettings.sortType);
			}
			yield put({type: SEARCH_V2_ACTIONS.TOURS_SUCCESS});
			SearchDataService.setToursModified(tours);
			AnalyticsService.sendSearchResultsEvent(requestParams, tours, user);
		}
	} catch (e) {

		yield put({
			type: ALERT_ACTIONS.SHOW_ALERT,
			data: {
				error: 'searchError',
				descr: e.data?.errors[0]?.userMessage || 'Unknown error',
			},
		});
		yield put({
			type: SEARCH_V2_ACTIONS.TOURS_FAILED,
		});

		Logger.log({
			level: 'error',
			message: `error requestTours:${e}`,
		});
	}
}

function* triggerRequestTours() {
	const searchSettings = yield SearchSettings.getSettings();
	if (searchSettings.autoSearch) {
		yield requestTours();
	}
}

function* updateTours(action) {
	try {
		const {payload} = action;

		// TODO Вынести сортировку и фильтрацию в сагу.
		// Параметры фильтров и сортировки сохраняются в store.
		// При изменении фильтров или сортировки запускается обновление туров, в стейт кладется finalTours
		// const {searchV2: {filtersClient, sorters, tours}} = select();
		// const filteredTours = yield filterService(tours, filtersClient);
		// const finalTours = yield sortService(filteredTours, sorters);

		yield put({type: SEARCH_V2_ACTIONS.TOURS_UPDATE});
		SearchDataService.setToursModified(payload);
	} catch (e) {
		Logger.log({
			level: 'error',
			message: `error updateTours:${e}`,
		});
	}
}

function* requestFilters(action) {
	const {payload} = action;
	try {
		updateTours({payload: null});
		const params = yield ParamsController.getAllParams();
		const requestParams = yield mapRequestParams(params);
		if (!payload) {
			const {data, status} = yield SearchService.getFilters(requestParams);
			if (status === 200) {
				yield FiltersDataService.mapFiltersResponse(data);
				yield FiltersDataService.groupFilters();
				yield FiltersDataService.packFilters();
				const filters = yield FiltersDataService.getFilters();
				const packedFilters = yield FiltersDataService.getPackedFilters();
				yield ParamsController.updateCheckinDateFromFilters(packedFilters);
				yield GeoParamsController.updateGeoParamsWithLocalGeoNames(packedFilters);
				yield put({type: SEARCH_V2_ACTIONS.FILTERS_SERVER_SUCCESS, payload: {filters, packedFilters}});
			}
		}
	} catch (e) {
		Logger.log({
			level: 'error',
			message: `error requestFilters:${e}`,
		});
	}
}

function* updateParamsWithGeoIds() {
	try {
		const geoIds = yield GeoDataService.getGeoIds();
		const geoParams = yield GeoParamsController.getGeoParams();
		yield ParamsController.updateParamsWithGeoIds(geoIds, geoParams);
		yield put({type: SEARCH_V2_ACTIONS.SEARCH_PARAMS_UPDATE});
	} catch (e) {
		Logger.log({
			level: 'error',
			message: `error updateParamsWithGeoIds:${e}`,
		});
	}
}

function* updateFromGeoNames(action) {
	try {
		const {payload: geoNames} = action;

		const geoParams = GeoParamsController.getGeoParams();
		const packedFilters = FiltersDataService.getPackedFilters();
		const linksGeo = mapLinksGeo({packedFilters, geoNames, geoParams});
		yield put({type: SEARCH_V2_ACTIONS.LINKS_GEO_UPDATE, payload: linksGeo});
	} catch (e) {
		Logger.log({
			level: 'error',
			message: `error updateFromGeoNames:${e}`,
		});
	}
}

function* searchV2Saga() {
	yield all([
		yield takeLatest(SEARCH_V2_ACTIONS.FILTERS_SERVER_SUCCESS, triggerRequestTours),
		yield takeLatest(SEARCH_V2_ACTIONS.TOURS_REQUESTED, requestTours),
		yield takeLatest(GEOGRAPHY_ACTIONS.GEO_IDS_SUCCESS, updateParamsWithGeoIds),
		yield takeLatest(SEARCH_V2_ACTIONS.SEARCH_PARAMS_UPDATE, requestFilters),
		yield takeLatest(SEARCH_V2_ACTIONS.FILTERS_SERVER_REQUESTED, requestFilters),
		yield takeLatest(GEOGRAPHY_ACTIONS.GEO_NAMES_SUCCESS, updateFromGeoNames),
		yield takeLatest(SEARCH_V2_ACTIONS.FILTERS_CLIENTS_UPDATE, updateTours),
		yield takeLatest(SEARCH_V2_ACTIONS.SEO_TEXT_REQUEST, requestSeoText),
	]);
}

export default searchV2Saga;
