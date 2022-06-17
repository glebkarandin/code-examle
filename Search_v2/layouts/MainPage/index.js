import React from 'react';
import PropTypes from 'prop-types';

import MainPage from '../../../MainPage';
import SearchBoxV2 from '../../../../components_next/SearchBox_v2';
import {mapFiltersForOldForm} from '../SearchHotTours/mappers';
import {intlShape} from '../../../../intl/propTypes';

const MainPageLayout = (
	{
		intl, parameters, groupedFilters, triggers, handlers, isFiltersLoading,
	}) => {

	const {
		onFormSearch, onFormChange,
	} = handlers;

	const {params} = parameters || {};

	if (!groupedFilters) {
		return null;
	}

	const {searchFilters} = groupedFilters;
	const formFilters = mapFiltersForOldForm(searchFilters);

	const {isMobile} = triggers;
	return (
		<div className="SearchPage__head main">
			<SearchBoxV2
				filters={formFilters}
				params={params}
				onChange={onFormChange}
				intl={intl}
				isFiltersLoading={isFiltersLoading}
				isMobile={isMobile}
				onSearch={onFormSearch}
			/>
			<MainPage />
		</div>
	);
};

MainPageLayout.defaultProps = {
	groupedFilters: null,
	isFiltersLoading: false,
};

MainPageLayout.propTypes = {
	parameters: PropTypes.objectOf(PropTypes.shape).isRequired,
	groupedFilters: PropTypes.objectOf(PropTypes.shape),
	triggers: PropTypes.objectOf(PropTypes.bool).isRequired,
	handlers: PropTypes.objectOf(PropTypes.func).isRequired,
	isFiltersLoading: PropTypes.bool,
	intl: intlShape.isRequired,
};

export default MainPageLayout;
