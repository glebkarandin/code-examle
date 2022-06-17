import SEARCH_V2_ACTIONS from './constants';

export const requestTours = (payload) => ({
	type: SEARCH_V2_ACTIONS.TOURS_REQUESTED,
	payload,
});

export const updateFiltersClient = (payload) => ({
	type: SEARCH_V2_ACTIONS.FILTERS_CLIENTS_UPDATE,
	payload,
});
