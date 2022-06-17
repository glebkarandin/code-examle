import CONFIG from 'config';
import moment from 'moment';
import {DATE_FORMAT} from 'utils';
import {CONSTANTS} from '../../../../constants';

/**
 * Вспомогательный конструктор path для урла
 * @function
 * @param {string} departure - название города вылета
 * @param {string} country - название страны назначения
 * @param {string} resort - название региона назначения
 * @param {string} city - название города назначения
 * @param {string} month - название месяца
 * @returns {string} pathname - готовый path
 */
function buildPath({departure, country, resort, city, month}) {
	let pathname = '/allhottours/';

	if (departure) pathname += `${departure}/`;
	if (country) pathname += `country_${country}/`;
	if (resort) pathname += `region_${resort}/`;
	if (city) pathname += `city_${city}/`;
	if (month) pathname += `${month}/`;

	return pathname;
}

/**
 * Вспомогательный маппер гео айдишников в русские и английские гео имена
 * @function
 * @param {number[]} geoIds - массив айдишников геообъектов, исходный материал для маппинга
 * @param {object[]} filterItems - айтемы с одного раздела фильтра, с русскоязычными названиями геообъектов
 * @param {object[]} geoNameItems - айтемы с одного раздела гео имен, с англоязычными названиями геообъектов
 * @returns {object[]} - массив промежуточных объектов формата {id, nameEn, nameRu}
 */
function mapGeoIdsToGeoNames({geoIds, filterItems, geoNameItems}) {
	if (!filterItems || !geoNameItems) return null;

	const items = geoIds.map(id => {
		const geoNameItem = geoNameItems[id];
		const filterValue = filterItems.filter(p => `${p.id}` === `${id}`)[0];
		const nameEn = geoNameItem ? geoNameItem.replace(/.+\//g, '') : null;
		const nameRu = filterValue ? filterValue.name : null;
		return {id, nameEn, nameRu};
	});

	return items.filter(item => item.nameRu && item.nameEn);
}

/**
 * Вспомогательный маппер дат вылета, отдает список месяцев, доступных для вылета
 * @function
 * @param {string[]} departureDates - даты вылета (из серверных фильтров)
 * @returns {number[]} - список месяцев
 */
function mapDepartureDatesToMonths(departureDates = []) {
	const availableMonths = departureDates.filter(
		item => item.name === CONSTANTS.DATES_AVAILABILITY.Available
			|| item.name === CONSTANTS.DATES_AVAILABILITY.AvailableByRequest
	).map(item => moment(item.id, DATE_FORMAT).month());
	return [...new Set(availableMonths)].sort((a, b) => a - b);
}

/**
 * Маппер раздела фильтров в массив айдишников
 * @param {object[]} filterValues - values одного раздела фильтров
 * @returns {number[]} - массив айдишников
 */
export function getFilterIds(filterValues) {
	return (filterValues || []).map(a => a.id);
}


/**
 * Достаем айдишники из серверных фильтров
 * @function
 * @param {object} searchFilters - раздел поисковых фильтров из серверных данных по фильтрам
 * @returns {number[]} departureCityIds - айдишники городов вылета
 * @returns {number[]} arrivalCountryIds - айдишники стран назначения
 * @returns {number[]} arrivalResortIds - айдишники регионов назначения
 */
function getIds({searchFilters}) {
	const departureCityIds = getFilterIds(searchFilters[CONSTANTS.FILTER_NAMES.DepartureTown]);
	const arrivalCountryIds = getFilterIds(searchFilters[CONSTANTS.FILTER_NAMES.ArrivalCountry]);
	const arrivalResortIds = getFilterIds(searchFilters[CONSTANTS.FILTER_NAMES.ArrivalRegion]);

	return {departureCityIds, arrivalCountryIds, arrivalResortIds};
}

/**
 * Достаем из серверных фильтров национальные и латинские наименования гео объектов
 * @function
 * @param {number[]} departureCityIds - айдишники городов вылета
 * @param {number[]} arrivalCountryIds - айдишники стран назначения
 * @param {number[]} arrivalResortIds - айдишники регионов назначения
 * @param {object} searchFilters - раздел поисковых фильтров из серверных данных по фильтрам
 * @param {object} geoNames - серверные данные по именам гео объектов
 * @returns {object[]} departureCityNames - наименования (ru/en) городов вылета
 * @returns {object[]} arrivalCountryNames - наименования (ru/en) стран назначения
 * @returns {object[]} arrivalResortNames - наименования (ru/en) регионов назначения
 */
function getNames({departureCityIds, arrivalCountryIds, arrivalResortIds, searchFilters, geoNames}) {
	const departureCityNames = mapGeoIdsToGeoNames({
		geoIds: departureCityIds,
		filterItems: searchFilters[CONSTANTS.FILTER_NAMES.DepartureTown],
		geoNameItems: geoNames[CONSTANTS.GEO_TYPES.City],
	});
	const arrivalCountryNames = mapGeoIdsToGeoNames({
		geoIds: arrivalCountryIds,
		filterItems: searchFilters[CONSTANTS.FILTER_NAMES.ArrivalCountry],
		geoNameItems: geoNames[CONSTANTS.GEO_TYPES.Country],
	});
	const arrivalResortNames = mapGeoIdsToGeoNames({
		geoIds: arrivalResortIds,
		filterItems: searchFilters[CONSTANTS.FILTER_NAMES.ArrivalRegion],
		geoNameItems: geoNames[CONSTANTS.GEO_TYPES.Region],
	});

	return {departureCityNames, arrivalCountryNames, arrivalResortNames};
}

/**
 * Формируем гео линки на основе сформированных ранее данных
 * @param {object[]} departureCityNames - наименования (ru/en) городов вылета
 * @param {object[]} arrivalCountryNames - наименования (ru/en) стран назначения
 * @param {object[]} arrivalResortNames - наименования (ru/en) регионов назначения
 * @param {number[]} departureMonths - номера месяцев, доступных для вылета
 * @param {object} geoParams - исходные параметры с именами гео объектов
 * @returns {object[]} departureCityLinks - сформированные данные для линков по городам вылета
 * @returns {object[]} arrivalCountryLinks - сформированные данные для линков по странам назначения
 * @returns {object[]} arrivalResortLinks - сформированные данные для линков по регионам назначения
 * @returns {object[]} departureMonthLinks - сформированные данные для линков по доступным месяцам
 * @function
 */
function getLinks({departureCityNames = [], arrivalCountryNames = [], arrivalResortNames = [], departureMonths = [], geoParams = []}) {
	const departureCityLinks = departureCityNames.map(departure => ({
		id: departure.id,
		name: departure.nameRu,
		pathname: buildPath({
			departure: departure.nameEn,
			country: geoParams.arrivalCountry,
			resort: geoParams.arrivalResort,
			month: geoParams.monthName,
		}),
	}));

	const arrivalCountryLinks = arrivalCountryNames.map(country => ({
		id: country.id,
		name: country.nameRu,
		pathname: buildPath({
			country: country.nameEn,
			month: geoParams.monthName,
		}),
	}));

	const arrivalResortLinks = arrivalResortNames.map(resort => ({
		id: resort.id,
		name: resort.nameRu,
		pathname: buildPath({
			country: geoParams.arrivalCountry,
			resort: resort.nameEn,
			month: geoParams.monthName,
		}),
	}));

	const departureMonthLinks = departureMonths.map(m => {
		return {
			id: m,
			name: moment().locale(CONFIG.settings.locale).month(m).format('MMMM'),
			pathname: buildPath({
				departure: geoParams.departureCity,
				country: geoParams.arrivalCountry,
				resort: geoParams.arrivalResort,
				month: moment().locale('en').month(m).format('MMMM').toLowerCase(),
			}),
		};
	});

	return {departureCityLinks, arrivalCountryLinks, arrivalResortLinks, departureMonthLinks};
}

/**
 * Маппер фильтров в гео линки (для десктопных фильтров на странице поиска)
 * @function
 * @param {object} packedFilters - упакованные в объект данные по фильтрам
 * @param {object} geoNames - серверные данные по гео именам
 * @param {object} geoParams - исходные параметры, отформатированные для гео
 * @returns {object[]} departureCityLinks - сформированные данные для линков по городам вылета
 * @returns {object[]} arrivalCountryLinks - сформированные данные для линков по странам назначения
 * @returns {object[]} arrivalResortLinks - сформированные данные для линков по регионам назначения
 * @returns {object[]} departureMonthLinks - сформированные данные для линков по доступным месяцам
 */
export default function mapLinksGeo({packedFilters, geoNames, geoParams}) {
	const {searchFilters} = packedFilters;

	const departureDates = searchFilters[CONSTANTS.FILTER_NAMES.DepartureDate];
	const departureMonths = mapDepartureDatesToMonths(departureDates);

	const {departureCityIds, arrivalCountryIds, arrivalResortIds} = getIds({
		searchFilters,
	});

	const {departureCityNames, arrivalCountryNames, arrivalResortNames} = getNames({
		departureCityIds, arrivalCountryIds, arrivalResortIds, searchFilters, geoNames,
	});

	const {departureCityLinks, arrivalCountryLinks, arrivalResortLinks, departureMonthLinks} = getLinks({
		departureCityNames, arrivalCountryNames, arrivalResortNames, departureMonths, geoParams,
	});

	return {
		departures: departureCityLinks,
		countries: arrivalCountryLinks,
		regions: arrivalResortLinks,
		months: departureMonthLinks,
	};
}
