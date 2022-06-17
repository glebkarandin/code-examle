import {ROUTES} from '../../../constants';
import {ROUT_SEARCH_HOT_TOURS} from '../constants';

const ROUTE_PREFIXES = {
	DEPARTURE: 'from_',
	COUNTRY: 'country_',
	RESORT: 'region_',
	CITY: 'city_',
};

/**
 * Маппер исходных параметров страницы в относительные пути для хлебных крошек
 * @param {string} path
 * @param {object} departureCity - id города отправления
 * @param {object} arrivalCountry - id страны прибытия
 * @param {object} arrivalResort - id региона прибытия
 * @param {object} arrivalCity - id города прибытия
 * @param {object} monthName - наименование месяца (используется в хлебных крошках и урле для SEO)
 * @returns {string} - путь
 */
function mapParamsToPath({path, departureCity, arrivalCountry, arrivalResort, arrivalCity, monthName}) {
	const defaultCities = ['moscow', 'kiev'];

	let pathname = null;
	switch (path) {
		case ROUT_SEARCH_HOT_TOURS:
			pathname = `/${ROUTES.AllHotTours}/`;
			break;
		default:
			pathname = `/${ROUTES.Search}/`;
	}
	if (departureCity && !defaultCities.includes(departureCity)) pathname += `${departureCity}/`;
	if (arrivalCountry) pathname += `${ROUTE_PREFIXES.COUNTRY}${arrivalCountry}/`;
	if (arrivalResort) pathname += `${ROUTE_PREFIXES.RESORT}${arrivalResort}/`;
	if (arrivalCity) pathname += `${ROUTE_PREFIXES.CITY}${arrivalCity}/`;
	if (monthName) pathname += `${monthName}/`;
	return pathname;
}

/**
 * Маппер исходных параметров страницы в хлебные крошки
 * @param {object} geoParams - исходные параметры, отформатированные для гео
 * @param {object} intl
 * @param {string} path
 * @returns {object} - хлебные крошки
 */
export default function mapParamsToItems({geoParams, intl, path}) {
	const {departureCity} = geoParams || {};
	const {arrivalCountry, arrivalCountryLoc} = geoParams || {};
	const {arrivalResort, arrivalResortLoc} = geoParams || {};
	const {arrivalCity, arrivalCityLoc} = geoParams || {};
	const {monthName, monthNameLoc} = geoParams || {};
	const items = [];
	let needMonth = false;

	switch (path) {
		case ROUT_SEARCH_HOT_TOURS:
			needMonth = true;
			items.push({
				href: mapParamsToPath({path}),
				name: intl.formatMessage({id: 'hots'}),
			});
			break;
		default:
			items.push({
				href: mapParamsToPath({path}),
				name: intl.formatMessage({id: 'main.topmenu.tours'}),
			});
	}
	if (arrivalCountry) {
		items.push({
			href: arrivalResort || arrivalCity || (monthName && needMonth) ? mapParamsToPath({path, departureCity, arrivalCountry}) : null,
			name: arrivalCountryLoc,
		});
	}
	if (arrivalResort) {
		items.push({
			href: arrivalCity || (monthName && needMonth) ? mapParamsToPath({path, departureCity, arrivalCountry, arrivalResort}): null,
			name: arrivalResortLoc,
		});
	}
	if (arrivalCity) {
		items.push({
			href: monthName && needMonth ? mapParamsToPath({path, departureCity, arrivalCountry, arrivalResort, arrivalCity}): null,
			name: arrivalCityLoc,
		});
	}
	if (monthName && needMonth) {
		items.push({
			name: monthNameLoc,
		});
	}

	return items;
}
