import React from 'react';

import Skeleton from 'components_next/StyleGuides/Skeleton/Skeleton';
import {pluralTranslations} from '../../../../utils';

/**
 * Блок с указанием количества найденных результатов
 * @component
 * @param {object[]} search - отфильтрованная поисковая выдача
 * @param {object} intl
 */
const SearchResultsCount = ({isToursLoading, tours, intl}) => {
	if (isToursLoading) {
		return <Skeleton with={200}/>;
	} if (!tours || !tours.length) {
		return null;
	}
	return (
		<div className="search-result-count">
			{`${pluralTranslations(tours.length, intl.formatMessage({
				id: 'plural.hotTour-search',
			}))} ${tours.length} ${pluralTranslations(tours.length, intl.formatMessage({
				id: 'plural.hotTour-cheap',
			}))} ${pluralTranslations(tours.length, intl.formatMessage({
				id: 'plural.hotTour-hot',
			}))} ${pluralTranslations(tours.length, intl.formatMessage({
				id: 'plural.tour',
			}))}`}
		</div>
	);
};

export default SearchResultsCount;
