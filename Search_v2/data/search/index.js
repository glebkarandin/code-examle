import CONFIG from 'config';
import moment from 'moment';
import isEmpty from 'lodash/isEmpty';
import {CONSTANTS} from '../../../../constants';
import {SearchService} from '../../../../Services/SearchService';
import {mapSearchData} from '../../../../Services/SearchService/mapSearchData';

// TODO После запуска новой формы избавиться от этих бесконечных мапперов
/**
 * Маппер параметров запроса на сервер
 * @param {object} params - параметры запроса
 * @returns {object} - структурированный объект с параметрами запроса
 */
export function mapRequestParams(params) {
	let {directionCountryTo, directionRegionTo, directionTownTo, dateDelta, dateFrom, childrenAges} = params;
	const {directionFrom, adults, nightsFrom, nightsTo, searchLevel} = params;

	if (!directionCountryTo) directionCountryTo = CONFIG.settings.defaultDestinationCountry;
	if (!directionRegionTo) directionRegionTo = [];
	else if (!Array.isArray(directionRegionTo)) directionRegionTo = [directionRegionTo];
	if (!directionTownTo) directionTownTo = [];
	else if (!Array.isArray(directionTownTo)) directionTownTo = [directionTownTo];

	dateDelta = dateDelta || 0;
	dateFrom = dateFrom || moment().add(dateDelta + 1, 'days');
	const minStartDate = moment(dateFrom).add(-dateDelta, 'days').format('YYYY-MM-DD');
	const maxStartDate = moment(dateFrom).add(dateDelta, 'days').format('YYYY-MM-DD');

	if (!childrenAges) {
		childrenAges = [];
	} else if (!Array.isArray(childrenAges)) {
		childrenAges = [childrenAges];
	}

	return {
		clientId: CONFIG.settings.clientTypeId,
		lang: CONFIG.settings.locale,
		currencyId: CONFIG.settings.defaultCurrencyId,
		departureCountryId: CONFIG.settings.departureCountryId,
		departureCityId: directionFrom || CONFIG.settings.defaultDepartureCityId,
		arrivalCountryId: directionCountryTo,
		arrivalRegionIds: directionRegionTo,
		arrivalCityIds: directionTownTo,
		minStartDate,
		maxStartDate,
		minNightsCount: nightsFrom || 7,
		maxNightsCount: nightsTo || 7,
		adults: adults || 2,
		children: childrenAges || [],
		hotelIds: [],
		searchLevel,
	};
}

/**
 * Маппер ответа сервера
 * @param {object} response - ответ сервера
 * @returns {object} - отформатированный ответ сервера
 */
function mapResponse(response) {
	if (!response || !response.data) return [];
	return mapSearchData(response.data).data.tours;
}

/**
 * Запрашиваем серверные данные
 * @param {object} params - параметры запроса
 * @returns {object} - поисковая выдача
 */
async function requestSearch(params) {
	const methodName = CONSTANTS.URL_SEARCH_TYPE.search;
	const requestParams = mapRequestParams(params);
	const response = await SearchService.getSearchResults(requestParams, methodName);
	return mapResponse(response);
}

export default requestSearch;
