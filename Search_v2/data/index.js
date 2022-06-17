import requestFilters from './filters';
import requestSearch from './search';
import requestGeoIds from './geo/ids';
import requestGeoNames from './geo/names';
import requestGeoGrammar from './geo/grammar';

/**
 * Здесь запрашиваем с сервера вспомогательные пакеты данных (filters, geonames, geoids etc.)
 * @param {object} params - стандартные поисковые параметры
 * @returns {object} - пакет серверных данных
 */
export async function getSupportData(params) {
	const filters = await requestFilters(params);
	const geoNames = await requestGeoNames(filters);
	const geoGrammar = await requestGeoGrammar(params);
	const geoIds = await requestGeoIds(params);
	return {filters, geoNames, geoGrammar, geoIds};
}

/**
 * Здесь запрашиваем с сервера результаты поиска
 * @param {object} params - стандартные поисковые параметры
 * @returns {object} - поисковая выдача
 */
export async function getSearchData(params) {
	return requestSearch(params);
}
