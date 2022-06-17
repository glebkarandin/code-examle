import {parse} from 'date-fns';

import {CONSTANTS} from '../../../../constants';

/**
 * Маппер фильтров для старой формы поиска
 * @param {object} searchFilters - часть фильтров, касающаяся поиска
 * @returns {object} - структурированный объект с параметрами
 */
export function mapFiltersForOldForm(searchFilters) {
	if (!searchFilters) return null;

	const directionFrom = searchFilters.filter(f => f.name === CONSTANTS.FILTER_NAMES.DepartureTown).pop();

	const directionCountryTo = searchFilters.filter(f => f.name === CONSTANTS.FILTER_NAMES.ArrivalCountry).pop();
	const directionRegionTo = searchFilters.filter(f => f.name === CONSTANTS.FILTER_NAMES.ArrivalRegion).pop();
	const directionTownTo = searchFilters.filter(f => f.name === CONSTANTS.FILTER_NAMES.ArrivalTown).pop();

	const nightsFrom = searchFilters.filter(f => f.name === 'MinNightsCount').pop();
	const nightsTo = searchFilters.filter(f => f.name === 'MaxNightsCount').pop();

	const departureDates = searchFilters.filter(f => f.name === 'DepartureDate').pop();
	const includeFromDates = departureDates ? departureDates.values.map(d => parse(d.id, 'dd.MM.yyyy', new Date())) : [];

	return {
		directionFrom,
		directionCountryTo,
		directionRegionTo,
		directionTownTo,
		nightsFrom,
		nightsTo,
		includeFromDates,
	};
}

// TODO После запуска новой формы избавиться от этих бесконечных мапперов
/**
 * Маппер параметров, получаемых из старой формы поиска через хендлер onSearch (убираем дишнее, оставляем нужное)
 * @param {object} params - параметры формы
 * @returns {object} - новый объект с параметрами
 */
export function mapSearchParams(params) {
	const {
		directionFrom,
		directionCountryTo,
		directionRegionTo,
		directionTownTo,
		dateFrom,
		dateDelta,
		nightsFrom,
		nightsTo,
		adults,
		children,
		newbies,
		childrenAges,
		searchLevel,
	} = params;
	return {
		directionFrom,
		directionCountryTo,
		directionRegionTo,
		directionTownTo,
		dateFrom,
		dateDelta,
		nightsFrom,
		nightsTo,
		adults,
		children,
		newbies,
		childrenAges,
		searchLevel,
	};
}
