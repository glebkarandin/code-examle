import React from 'react';
import PropTypes from 'prop-types';

import FieldFrom from './FieldFrom';
import FieldTo from './FieldTo';
import FieldDate from './FieldDate';
import FieldNights from './FieldNights';
import FieldPaxes from './FieldPaxes';
import ButtonGreen from '../StyleGuides/Buttons/ButtonGreen';
import {formParamsPropTypes} from '../../pages/Search_v2/params/ParamsController';

import classes from './SearchBox_v2.module.scss';
import FieldMealType from './FieldMealType';
import {intlShape} from '../../intl/propTypes';

const SearchBoxV2 = (
	{
		searchType, intl, filters, params, onChange, isFiltersLoading, isMobile, onSearch,
	}) => {

	const {
		directionFrom,
		directionCountryTo,
		directionRegionTo,
		directionTownTo,
		includeFromDates,
		mealTypeGroupIds,
		nightsFrom: {values: nightsFromFilter},
		nightsTo: {values: nightsToFilter},
	} = filters;

	const handleChange = (fieldParams) => {
		const nextParams = {
			...params,
			...fieldParams,
		};
		onChange(nextParams);
	};

	return (
		<div className={classes.SearchBoxV2}>
			<FieldFrom
				onChange={handleChange}
				filter={directionFrom}
				params={params}
				loading={isFiltersLoading}
				intl={intl}
				isMobile={isMobile}
			/>
			{searchType !== 'hotel' ? <FieldTo
				onChange={handleChange}
				filter={{directionCountryTo, directionRegionTo, directionTownTo}}
				params={params}
				loading={isFiltersLoading}
				intl={intl}
				isMobile={isMobile}
			/> : null}
			<FieldDate
				onChange={handleChange}
				filter={includeFromDates}
				params={params}
				isMobile={isMobile}
				intl={intl}
			/>
			<FieldNights
				nightsFromFilter={nightsFromFilter}
				nightsToFilter={nightsToFilter}
				params={params}
				onChange={handleChange}
				isMobile={isMobile}
				intl={intl}
			/>
			{searchType === 'hotel' ? <FieldMealType
				onChange={handleChange}
				filter={mealTypeGroupIds}
				params={params}
				isMobile={isMobile}
				intl={intl}
			/> : null}
			<FieldPaxes
				params={params}
				onChange={handleChange}
				isMobile={isMobile}
				intl={intl}
			/>
			<ButtonGreen onClick={onSearch}>Найти</ButtonGreen>
		</div>
	);
};

SearchBoxV2.defaultProps = {
	searchType: 'country',
	isFiltersLoading: false,
};

SearchBoxV2.propTypes = {
	params: formParamsPropTypes.isRequired,
	filters: PropTypes.objectOf(PropTypes.shape).isRequired,
	searchType: PropTypes.string,
	intl: intlShape.isRequired,
	onChange: PropTypes.func.isRequired,
	isFiltersLoading: PropTypes.bool,
	isMobile: PropTypes.bool.isRequired,
	onSearch: PropTypes.func.isRequired,
};

export default SearchBoxV2;
