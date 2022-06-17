import {SORT_TYPES} from '../../../constants';

/**
 * Возвращает текстовый лейбл сортировки
 * @param {object} intl
 */
export function getSortBy(intl) {
	return intl.formatMessage({id: 'sort.by'});
}

/**
 * Возвращает текстовые лейблы кнопок сортировки
 * @param {object} intl
 */
export function getSortButtons(intl, page) {
	const sortButton = [{
		id: 0,
		sortType: SORT_TYPES.tuiRecommend,
		name: intl.formatMessage({id: 'sort.byrecommend'}),
		ascSort: false,
		enableSort: false,
	}, {
		id: 1,
		sortType: SORT_TYPES.price,
		name: intl.formatMessage({id: 'sort.byprice'}),
		ascSort: true,
		enableSort: true,
	}, {
		id: 2,
		sortType: SORT_TYPES.tripAdvisor,
		name: intl.formatMessage({id: 'sort.byrating'}),
		ascSort: false,
		enableSort: false,
	}];

	if (page === 'allhottours') {
		return [sortButton[1], sortButton[2]];
	}

	return sortButton;
}

/**
 * Возвращает текстовые лейблы мобильных кнопок сортировки
 * @param {object} intl
 */
export function getSortButtonsMobile(intl, page) {
	const sortButtonMobile = [{
		id: 0,
		sortType: SORT_TYPES.tuiRecommend,
		name: intl.formatMessage({id: 'sort.byrecommend'}),
		ascSort: false,
		class: 'sortDesc',
	},
	{
		id: 1,
		sortType: SORT_TYPES.price,
		name: intl.formatMessage({id: 'sort.byprice.less'}),
		ascSort: true,
		class: 'sortAsc',
	},
	{
		id: 2,
		sortType: SORT_TYPES.price,
		name: intl.formatMessage({id: 'sort.byprice.more'}),
		ascSort: false,
		class: 'sortDesc',
	},
	{
		id: 3,
		sortType: SORT_TYPES.tripAdvisor,
		name: intl.formatMessage({id: 'sort.byrating.mobile'}),
		ascSort: false,
		class: 'sortDesc',
	}];

	if (page === 'allhottours') {
		return [sortButtonMobile[1], sortButtonMobile[2]];
	}

	return sortButtonMobile;
}
