import SEARCH_V2_ACTIONS from './constants';

const initialState = {
	isToursLoading: false,

	isFiltersLoading: false,

	linksGeo: {},

	sorters: [],

	seoText: null,
};

const searchV2Reducer = (state = initialState, action) => {
	const {type, payload} = action;
	switch (type) {
		case SEARCH_V2_ACTIONS.TOURS_REQUESTED:
			return {
				...state,
				isToursLoading: true,
			};
		case SEARCH_V2_ACTIONS.TOURS_SUCCESS:
			return {
				...state,
				isToursLoading: false,
			};
		case SEARCH_V2_ACTIONS.TOURS_FAILED:
			return {
				...state,
				isToursLoading: false,
			};
		case SEARCH_V2_ACTIONS.TOURS_UPDATE:
			return {
				...state,
				isToursLoading: false,
			};
		case SEARCH_V2_ACTIONS.FILTERS_SERVER_REQUESTED:
			return {
				...state,
				isFiltersLoading: true,
			};
		case SEARCH_V2_ACTIONS.FILTERS_SERVER_SUCCESS:
			return {
				...state,
				isFiltersLoading: false,
			};
		case SEARCH_V2_ACTIONS.LINKS_GEO_UPDATE:
			return {
				...state,
				linksGeo: payload,
			};
		case SEARCH_V2_ACTIONS.SEO_TEXT_SUCCESS:
			return {
				...state,
				seoText: payload,
			};
		default:
			return {...state};
	}
};

export default searchV2Reducer;
