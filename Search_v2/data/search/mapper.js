/**
 * Маппер поисковых параметров
 * @param {object} params - поисковые параметры
 * @returns {object} - отформатировааные параметры
 */
export function	mapQueryToSearchParams(params) {
	const newParams = {};
	Object.keys(params).forEach((key) => {
		const value = params[key];
		if (Array.isArray(value)) {
			newParams[key] = value.map(Number);
		} else if (!Number.isNaN(Number(value))) {
			newParams[key] = Number(value);
		} else if (['true', 'false'].includes(value)) {
			newParams[key] = value === 'true';
		} else {
			newParams[key] = value;
		}
	});
	return newParams;
}

/**
 * Маппер отельных параметров
 * @param {object} params - отельные параметры
 * @returns {object} - отформатировааные параметры
 */
export function	mapQueryToHotelParams(params) {
	const newParams = {};
	Object.keys(params).forEach((key) => {
		const value = params[key];
		if ([
			'TripAdvisor',
			'hotelNameQuery',
		].includes(String(key))
		) {
			newParams[key] = String(value);
		} else if ([
			'HotelAttribute',
			'HotelCategory',
			'MealTypeGroup',
			'HotelRecommendation',
			'TourPromo',
			'ProgramTypeGroup',
			'TourType',
			'PredefinedFilter',
			'Region',
			'Resort',
		].includes(String(key))
		) {
			if (Array.isArray(value)) {
				newParams[key] = value.map(Number);
			} else if (value) {
				newParams[key] = [Number(value)];
			}
		}
	});
	return newParams;
}
