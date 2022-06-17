import {CONSTANTS} from '../../../../constants';

/**
 * Хранение и обработка полученных с сервера данных
 */
class FiltersDataServiceClass {
	constructor() {
		this.filters = null;
		this.groupedFilters = null;
		this.packedFilters = null;

		this.intl = null;
	}

	init = (intl) => {
		this.intl = intl;
	};

	getFilters = () => this.filters;

	getGroupedFilters = () => this.groupedFilters;

	getPackedFilters = () => this.packedFilters;

	mapFiltersResponse = (response) => {
		this.filters = response.filters;
	};

	/**
	 * Маппер фильтров в структуру "массив"
	 * searchFilters[], hotelFilters[] - поисковые и отельные фильтры
	 */
	groupFilters = () => {
		const filtered = this.filters.filter(item => item.values.length);
		this.groupedFilters = {
			searchFilters: [
				{
					name: CONSTANTS.FILTER_NAMES.ArrivalCountry,
					label: this.intl.formatMessage({id: 'search.direction'}),
					values: this.mapFilterValues(filtered, CONSTANTS.FILTER_NAMES.ArrivalCountry),
				},
				{
					name: CONSTANTS.FILTER_NAMES.DepartureTown,
					label: this.intl.formatMessage({id: 'search.departurecity'}),
					values: this.mapFilterValues(filtered, CONSTANTS.FILTER_NAMES.DepartureTown),
				},
				{
					name: CONSTANTS.FILTER_NAMES.ArrivalRegion,
					label: this.intl.formatMessage({id: 'search.resort'}),
					values: this.mapFilterValues(filtered, 'ArrivalRegion'),
				},
				{
					name: CONSTANTS.FILTER_NAMES.ArrivalTown,
					label: this.intl.formatMessage({id: 'search.city'}),
					values: this.mapFilterValues(filtered, CONSTANTS.FILTER_NAMES.ArrivalTown),
				},
				{
					name: 'DepartureDate',
					label: this.intl.formatMessage({id: 'search.departuredate'}),
					values: this.mapFilterDepartureDatesValues(filtered, 'DepartureDate'),
				},
				{
					name: 'MinNightsCount',
					label: this.intl.formatMessage({id: 'search.nightsfrom'}),
					values: this.mapFilterValues(filtered, 'MinNightsCount'),
				},
				{
					name: 'MaxNightsCount',
					label: this.intl.formatMessage({id: 'search.nightsto'}),
					values: this.mapFilterValues(filtered, 'MaxNightsCount'),
				},
			],
			hotelFilters: [
				{
					name: 'TourType',
					label: this.intl.formatMessage({id: 'search-filter.text.tour-type'}),
					values: this.mapFilterValues(filtered, 'TourType'),
				},
				{
					name: 'PredefinedFilter',
					label: this.intl.formatMessage({id: 'hotelfilters.important'}),
					values: this.mapFilterValues(filtered, 'PredefinedFilter')
				},
				{
					name: 'HotelRecommendation',
					label: this.intl.formatMessage({id: 'hotelfilters.hotelservices'}),
					values: this.mapFilterValues(filtered, 'HotelRecommendation')
				},
				{
					name: 'ProgramTypeGroup',
					label: '', // это используется?
					values: this.mapFilterValues(filtered, 'ProgramTypeGroup'),
				},
				{
					name: 'HotelCategory',
					label: this.intl.formatMessage({id: 'search-filter.text.hotel-stars'}),
					values: this.mapFilterValues(filtered, 'HotelCategory'),
				},
				{
					name: 'MealTypeGroup',
					label: this.intl.formatMessage({id: 'search-filter.text.type-of-food'}),
					values: this.mapFilterValues(filtered, 'MealTypeGroup'),
				},
				{
					name: 'TripAdvisor',
					label: this.intl.formatMessage({id: 'search-filter.text.tripadvisor'}),
					values: this.mapFilterValues(filtered, 'TripAdvisor'),
				},
				{
					name: 'HotelAttribute',
					label: this.intl.formatMessage({id: 'search-filter.text.hotel-concept'}),
					values: this.mapFilterValues(filtered, 'HotelAttribute'),
				},
				{
					name: 'maxCost',
					label: this.intl.formatMessage({id: 'search-filter.text.and-more'}),
					values: this.mapFilterValues(filtered, 'maxCost'),
				},
				{
					name: 'minCost',
					label: this.intl.formatMessage({id: 'search-filter.label.hotel-price-from'}),
					values: this.mapFilterValues(filtered, 'minCost'),
				},
			],
		};
	};

	/**
	 * Маппер фильтров в структуру "объект"
	 * searchFilters, hotelFilters - поисковые и отельные наборы фильтров в формате {filterName: values}
	 */
	packFilters = () => {
		const searchFilters = {};
		const hotelFilters = {};
		this.groupedFilters.searchFilters.forEach(item => searchFilters[item.name] = item.values);
		this.groupedFilters.hotelFilters.forEach(item => hotelFilters[item.name] = item.values);
		this.packedFilters = {searchFilters, hotelFilters};
	};

	/**
	 * Маппер для всех разделов фильтров
	 * Маппит values из структуры {value, description} в структуру {id, name}
	 * @param {object} filters - сырые фильтры
	 * @param {object} filterName - имя раздела
	 * @returns {object} - отформатированный объект
	 */
	mapFilterValues = (filters, filterName) => {
		const filter = filters.filter(({type}) => type === filterName).pop();
		if (filter) {
			return filter.values.map((item) => {
				const {value: id, description: name} = item;
				if (item.value !== '1::-1') {
					if (filterName === 'PredefinedFilter') {
						return {
							id: Number.isNaN(Number(id)) ? id : Number(id),
							name,
							filterType: item.filterType,
							property: item.property,
						};
					}
				}
				return {
					id: Number.isNaN(Number(id)) ? id : Number(id),
					name,
				};
			});
		}
		return [];
	};

	/**
	 * Маппер для раздела фильтров - даты вылета
	 * Маппит values из структуры {value, property} в структуру {id, name}
	 * @param {object} filters - сырые фильтры
	 * @param {object} filterName - имя раздела
	 * @returns {object[]} - отформатированный объект
	 */
	mapFilterDepartureDatesValues = (filters, filterName) => {
		const filter = filters.filter(({type}) => type === filterName).pop();
		if (filter) {
			return filter.values.map((item) => {
				const {value: id, property: name} = item;
				return {id, name};
			});
		}
		return [];
	}
}

const FiltersDataService = new FiltersDataServiceClass();

export default FiltersDataService;
