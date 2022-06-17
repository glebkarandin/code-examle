import {shape, string, number, arrayOf} from 'prop-types';
import moment from 'moment';
import {isEmpty, pick} from 'lodash';
import {CONSTANTS} from '../../../constants';
import {parseQuery} from '../../../utils';
import {LocalStorageService} from '../../../Services/LocalStorageService';
import {calculateCheckinDates} from '../../../utils/dateUtils';
import {mapQueryToHotelParams, mapQueryToSearchParams} from '../data/search/mapper';

export const START_DAY_TRADING_SHIFT = 1; // Корректировка текущей даты к возможной дате старта продаж на сайте

const SEARCH_REQUEST_PARAMS = {
	CLIENT_ID: 'clientId',
	LANG: 'lang',
	DEPARTURE_CITY_ID: 'departureCityId',
	ARRIVAL_COUNTRY_ID: 'arrivalCountryId',
	ARRIVAL_REGIONS_IDS: 'arrivalRegionIds',
	ARRIVAL_CITY_IDS: 'arrivalCityIds',
	ADULTS: 'adults',
	CHILDREN: 'children',
	MIN_START_DATE: 'minStartDate',
	MAX_START_DATE: 'maxStartDate',
	MIN_NIGHTS_COUNT: 'minNightsCount',
	MAX_NIGHTS_COUNT: 'maxNightsCount',
	CURRENCY_ID: 'currencyId',
	HOTEL_IDS: 'hotelIds',
	SUBSCRIPTIONS: 'subscriptions',
	SEARCH_LEVEL: 'searchLevel',
};

export const formParamsPropTypes = shape({
	directionFrom: number,
	dateFrom: string, // "2021-02-04T00:00:00+03:00"
	dateDelta: number,
	adults: number,
	children: number,
	childrenAges: arrayOf(number),
	nightFrom: number,
	nightsTo: number,
});

/**
 * Класс для управления и хранения параметрами запроса, формы поиска, урла...
 * Часть параметров, например, параметры формы должны обнавляться в redux store для обновления компонентов
 */
class ParamsControllerClass {
	constructor() {
		const {
			CLIENT_ID, LANG, DEPARTURE_CITY_ID, ARRIVAL_COUNTRY_ID, ARRIVAL_REGIONS_IDS,
			ARRIVAL_CITY_IDS, ADULTS, CHILDREN, MIN_START_DATE, MAX_START_DATE,
			MIN_NIGHTS_COUNT, MAX_NIGHTS_COUNT, CURRENCY_ID, HOTEL_IDS, SUBSCRIPTIONS, SEARCH_LEVEL,
		} = SEARCH_REQUEST_PARAMS;

		this.searchParams = {
			[CLIENT_ID]: '',
			[LANG]: '',
			[DEPARTURE_CITY_ID]: 0,
			[ARRIVAL_COUNTRY_ID]: 0,
			[ARRIVAL_REGIONS_IDS]: [],
			[ARRIVAL_CITY_IDS]: [],
			[ADULTS]: 0,
			[CHILDREN]: [],
			[MIN_START_DATE]: '',
			[MAX_START_DATE]: '',
			[MIN_NIGHTS_COUNT]: 0,
			[MAX_NIGHTS_COUNT]: 0,
			[CURRENCY_ID]: 0,
			[HOTEL_IDS]: [],
			[SUBSCRIPTIONS]: {},
			[SEARCH_LEVEL]: null, // null - пожелание бэка
		};

		const {URL_SEARCH_PARAMS: {
			DepartureCityId, ArrivalCountryId, ArrivalRegionId, ArrivalCityId, DepartureDate,
			MinNightsCount, MaxNightsCount, AdultsCount, ChildrenCount, ChildrenAges, Newbies,
			HotelNameQuery, HotelAttribute, HotelCategory, MealTypeGroup, HotelRecommendation,
			TourPromo, ProgramTypeGroup, TourType, PredefinedFilter, Region, Resort, MinCost, MaxCost,
			SortType, SearchLevel, DateDelta,
		}} = CONSTANTS;

		// Настраиваемый массив параметров отображаемых в url
		this.urlParams = [
			DepartureDate,
			DepartureCityId,
			ArrivalCountryId,
			ArrivalRegionId,
			ArrivalCityId,
			MinNightsCount,
			MaxNightsCount,
			AdultsCount,
			ChildrenCount,
			ChildrenAges,
			Newbies, // TODO Нужен?
			HotelNameQuery,
			HotelAttribute,
			HotelCategory,
			MealTypeGroup,
			HotelRecommendation,
			TourPromo,
			ProgramTypeGroup,
			TourType,
			PredefinedFilter,
			Region,
			Resort,
			MinCost,
			MaxCost,
			SortType,
			DateDelta,
		];

		this.allParams = {
			[DepartureCityId]: '',
			[ArrivalCountryId]: '',
			[ArrivalRegionId]: '',
			[ArrivalCityId]: '',
			[DepartureDate]: '',
			[MinNightsCount]: '',
			[MaxNightsCount]: '',
			[AdultsCount]: '',
			[ChildrenCount]: '',
			[ChildrenAges]: [],
			[Newbies]: '',
			[HotelNameQuery]: '',
			[HotelAttribute]: '',
			[HotelCategory]: '',
			[MealTypeGroup]: '',
			[HotelRecommendation]: '',
			[TourPromo]: '',
			[ProgramTypeGroup]: '',
			[TourType]: '',
			[PredefinedFilter]: '',
			[Region]: '',
			[Resort]: '',
			[MinCost]: '',
			[MaxCost]: '',
			[SortType]: '',
			[SearchLevel]: null,
			[DateDelta]: 0,
		};

		this.searchParamsDefault = null;
	}

	init = (searchParamsDefault) => {
		this.searchParamsDefault = searchParamsDefault;

		/** Низкий приоритет - дефолтные параметры */
		this.updateParamsFromDefaultSettings();

		/** Средний приоритет - параметры из локал сториджа (перекрывают дефолтные) */
		this.updateParamsFromLocalStorage();

		/** Высокий приоритет - параметры из query урла (перекрывают всех остальные) */
		this.updateParamsFromUrl();

		/** В параметрах ссылки или в локалсторедже может лежать прошедшая дата */
		this.fixBeginCheckinDates();
	};

	getAllParams = () => this.allParams;

	/**
	 * Дополняет текущие параметры параметрами из урла
	 */
	updateParamsFromUrl = () => {
		const params = parseQuery();

		const {
			DepartureDate, DepartureCityId, ArrivalCountryId, ArrivalRegionId, ArrivalCityId,
			MinNightsCount, MaxNightsCount, AdultsCount, ChildrenCount, ChildrenAges, Newbies,
			HotelNameQuery, HotelAttribute, HotelCategory, MealTypeGroup, HotelRecommendation,
			TourPromo, ProgramTypeGroup, TourType, PredefinedFilter, Region, Resort, MinCost, MaxCost,
			SortType, DateDelta,
		} = CONSTANTS.URL_SEARCH_PARAMS;

		if (params[ArrivalRegionId] && !Array.isArray(params[ArrivalRegionId])) {
			params[ArrivalRegionId] = [params[ArrivalRegionId]];
		}
		if (params[ArrivalCityId] && !Array.isArray(params[ArrivalCityId])) {
			params[ArrivalCityId] = [params[ArrivalCityId]];
		}

		// TODO Как-то надо оптимизировать всю эту простыню...
		this.allParams[DepartureDate] = params[DepartureDate] || this.allParams[DepartureDate];
		this.allParams[DepartureCityId] = params[DepartureCityId] || this.allParams[DepartureCityId];
		if (params[ArrivalCountryId]) {
			this.allParams[ArrivalCountryId] = params[ArrivalCountryId];
			this.allParams[ArrivalRegionId] = params[ArrivalRegionId] || [];
			this.allParams[ArrivalCityId] = params[ArrivalCityId] || [];
		}
		this.allParams[MinNightsCount] = params[MinNightsCount] || this.allParams[MinNightsCount];
		this.allParams[MaxNightsCount] = params[MaxNightsCount] || this.allParams[MaxNightsCount];
		this.allParams[AdultsCount] = params[AdultsCount] || this.allParams[AdultsCount];
		this.allParams[ChildrenCount] = params[ChildrenCount] || this.allParams[ChildrenCount];
		this.allParams[ChildrenAges] = params[ChildrenAges] || this.allParams[ChildrenAges];
		this.allParams[Newbies] = params[Newbies] || this.allParams[Newbies];
		this.allParams[HotelNameQuery] = params[HotelNameQuery] || this.allParams[HotelNameQuery] || '';
		this.allParams[HotelAttribute] = params[HotelAttribute] || this.allParams[HotelAttribute];
		this.allParams[HotelCategory] = params[HotelCategory] || this.allParams[HotelCategory];
		this.allParams[MealTypeGroup] = params[MealTypeGroup] || this.allParams[MealTypeGroup];
		this.allParams[HotelRecommendation] = params[HotelRecommendation] || this.allParams[HotelRecommendation];
		this.allParams[TourPromo] = params[TourPromo] || this.allParams[TourPromo];
		this.allParams[ProgramTypeGroup] = params[ProgramTypeGroup] || this.allParams[ProgramTypeGroup];
		this.allParams[TourType] = params[TourType] || this.allParams[TourType];
		this.allParams[PredefinedFilter] = params[PredefinedFilter] || this.allParams[PredefinedFilter];
		this.allParams[Region] = params[Region] || this.allParams[Region];
		this.allParams[Resort] = params[Resort] || this.allParams[Resort];
		this.allParams[MinCost] = params[MinCost] || this.allParams[MinCost];
		this.allParams[MaxCost] = params[MaxCost] || this.allParams[MaxCost];
		this.allParams[SortType] = params[SortType] || this.allParams[SortType];
		this.allParams[DateDelta] = params[DateDelta] || this.allParams[DateDelta];
	};

	/**
	 * Дополняет текущие параметры параметрами из локал сториджа
	 */
	updateParamsFromLocalStorage = () => {
		const params = new LocalStorageService('SearchParams').get() || {};

		const {DepartureDate, DepartureCityId, ArrivalCountryId, ArrivalRegionId, ArrivalCityId,
			MinNightsCount, MaxNightsCount, AdultsCount, ChildrenCount} = CONSTANTS.URL_SEARCH_PARAMS;

		this.allParams[DepartureDate] = params[DepartureDate] || this.allParams[DepartureDate];
		this.allParams[DepartureCityId] = params[DepartureCityId] || this.allParams[DepartureCityId];
		if (params[ArrivalCountryId]) {
			this.allParams[ArrivalCountryId] = params[ArrivalCountryId];
			this.allParams[ArrivalRegionId] = params[ArrivalRegionId] || [];
			this.allParams[ArrivalCityId] = params[ArrivalCityId] || [];
		}
		this.allParams[MinNightsCount] = params[MinNightsCount] || this.allParams[MinNightsCount];
		this.allParams[MaxNightsCount] = params[MaxNightsCount] || this.allParams[MaxNightsCount];
		this.allParams[AdultsCount] = params[AdultsCount] || this.allParams[AdultsCount];
		this.allParams[ChildrenCount] = params[ChildrenCount] || this.allParams[ChildrenCount];
	};

	/**
	 * Инициализирует текущие параметры дефолтными параметрами
	 */
	updateParamsFromDefaultSettings = () => {
		const {
			dateShift, departureTownId, arrivalCountryId, minNightsCount,
			maxNightsCount, adultsCount, searchLevel,
		} = this.searchParamsDefault;

		const {
			DepartureDate, DepartureCityId, ArrivalCountryId, ArrivalRegionId, ArrivalCityId,
			MinNightsCount, MaxNightsCount, AdultsCount, ChildrenCount, DateShift, SearchLevel,
		} = CONSTANTS.URL_SEARCH_PARAMS;

		this.allParams[DepartureDate] = moment().add(dateShift, 'days').format('YYYY-MM-DD');
		this.allParams[DepartureCityId] = departureTownId;
		this.allParams[ArrivalCountryId] = arrivalCountryId;
		this.allParams[ArrivalRegionId] = [];
		this.allParams[ArrivalCityId] = [];
		this.allParams[MinNightsCount] = minNightsCount;
		this.allParams[MaxNightsCount] = maxNightsCount;
		this.allParams[AdultsCount] = adultsCount;
		this.allParams[ChildrenCount] = 0;
		this.allParams[DateShift] = dateShift;
		this.allParams[SearchLevel] = searchLevel;
	};

	getParamsForUrl = () => pick(this.allParams, this.urlParams);

	/**
	 *
	 * @param packedFilters Object
	 * @returns {moment.Moment}
	 */
	updateCheckinDateFromFilters = (packedFilters) => {
		const {URL_SEARCH_PARAMS} = CONSTANTS;
		const {DateShift} = CONSTANTS.URL_SEARCH_PARAMS;
		const {searchFilters: {DepartureDate}} = packedFilters;
		const today = moment();

		if (!Array.isArray(DepartureDate) || !DepartureDate.length) {
			this.allParams[URL_SEARCH_PARAMS.DepartureDate] = this.allParams[URL_SEARCH_PARAMS.DepartureDate] || today
				.add(START_DAY_TRADING_SHIFT, 'days')
				.format('YYYY-MM-DD');
		} else {
			const targetDate = this.allParams[URL_SEARCH_PARAMS.DepartureDate] || today
				.add(this.allParams[DateShift], 'days')
				.format('YYYY-MM-DD');
		 	const departureDate = DepartureDate
				.find(({id}) => {
					const date = id.split('.').reverse().join('-');
					return moment(date).isSameOrAfter(targetDate);
				});
			this.allParams[URL_SEARCH_PARAMS.DepartureDate] = departureDate
				? departureDate.id.split('.').reverse().join('-')
				: DepartureDate[DepartureDate.length - 1].id.split('.').reverse().join('-');
		}
	};

	fixBeginCheckinDates = () => {
		const {DepartureDate} = CONSTANTS.URL_SEARCH_PARAMS;
		const {beginCheckinDate} = calculateCheckinDates(this.allParams[DepartureDate]);
		this.allParams[DepartureDate] = beginCheckinDate.format('YYYY-MM-DD');
	};

	/**
	 * Обогащает параметры айдишниками гео объектов
	 * @param {object} geoParams - исходные параметры, с наименованиями гео объектов
	 * @param {object} geoIds - серверные данные по гео айдишникам
	 */
	updateParamsWithGeoIds = (geoIds, geoParams) => {
		if (isEmpty(geoIds)) {
			return;
		}
		const {URL_SEARCH_PARAMS} = CONSTANTS;
		const {departureCountryName} = this.searchParamsDefault;

		const departureCityId = geoIds[CONSTANTS.GEO_TYPES.City][`${departureCountryName}/${geoParams.departureCity}/${geoParams.departureCity}`];
		const arrivalCountryId = geoIds[CONSTANTS.GEO_TYPES.Country][`${geoParams.arrivalCountry}`];
		const arrivalResortId = geoIds[CONSTANTS.GEO_TYPES.Region][`${geoParams.arrivalCountry}/${geoParams.arrivalResort}`];
		const arrivalCityId = geoIds[CONSTANTS.GEO_TYPES.City][`${geoParams.arrivalCountry}/${geoParams.arrivalResort}/${geoParams.arrivalCity}`];

		this.allParams[URL_SEARCH_PARAMS.DepartureCityId] = departureCityId || this.allParams[URL_SEARCH_PARAMS.DepartureCityId];
		this.allParams[URL_SEARCH_PARAMS.ArrivalCountryId] = arrivalCountryId || this.allParams[URL_SEARCH_PARAMS.ArrivalCountryId];
		this.allParams[URL_SEARCH_PARAMS.ArrivalRegionId] = arrivalResortId ? [arrivalResortId] : this.allParams[URL_SEARCH_PARAMS.ArrivalRegionId];
		this.allParams[URL_SEARCH_PARAMS.ArrivalCityId] = arrivalCityId ? [arrivalCityId] : this.allParams[URL_SEARCH_PARAMS.ArrivalCityId];
	};

	updateParamsFromGeoLink = (linkParams) => {
		const {URL_SEARCH_PARAMS} = CONSTANTS;
		this.allParams[URL_SEARCH_PARAMS.DepartureCityId] = linkParams[URL_SEARCH_PARAMS.DepartureCityId];
		this.allParams[URL_SEARCH_PARAMS.ArrivalCountryId] = linkParams[URL_SEARCH_PARAMS.ArrivalCountryId];
		this.allParams[URL_SEARCH_PARAMS.ArrivalRegionId] = linkParams[URL_SEARCH_PARAMS.ArrivalRegionId] || [];
	}

	// TODO Переосмыслить необходимость функции
	replaceAllParams = (allParams) => {
		this.allParams = allParams;
	};

	/**
	 * Маппер исходных параметров страницы, группирующий их в структуру {searchParams, hotelParams}
	 * searchParams - поисковые параметры (гео, даты, паксы)
	 * hotelParams - параметры для фильтрации поисковой выдачи
	 * @returns {object} - структурированный объект
	 */
	groupParams = () => {
		const searchParams = mapQueryToSearchParams(this.allParams);
		const hotelParams = mapQueryToHotelParams(this.allParams);

		return {searchParams, hotelParams};
	};

	/**
	 * Устанавливает принудительно месяц в дату вылета (для seo-урлов)
	 * @param {object} monthId - id месяца из урла
	 */
	setSeoMonth = (monthId) => {
		if (monthId >= 0) {
			const {DepartureDate} = CONSTANTS.URL_SEARCH_PARAMS;
			const seoDate = moment(this.allParams[DepartureDate]).month(monthId);
			const {beginCheckinDate} = calculateCheckinDates(seoDate);
			this.allParams[DepartureDate] = beginCheckinDate.format('YYYY-MM-DD');
		}
	}
}

const ParamsController = new ParamsControllerClass();

export default ParamsController;
