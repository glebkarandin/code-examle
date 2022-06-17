import React from 'react';
import PropTypes from 'prop-types';

import Dropdown from '../../Dropdown';
import TextField from '../../TextField';
import NightsCounter from '../../NightsCounter';
import {pluralTranslations} from '../../../utils';
import {intlShape} from '../../../intl/propTypes';
import {formParamsPropTypes} from '../../../pages/Search_v2/params/ParamsController';

const FieldNights = ({nightsFromFilter, nightsToFilter, params, onChange, intl, isMobile}) => {
	const handleChange = (paramsNext) => {
		onChange(paramsNext);
	};

	const {nightsFrom, nightsTo} = params;
	const value = nightsFrom !== nightsTo ? `${nightsFrom} - ${nightsTo} ${pluralTranslations(nightsTo, intl.formatMessage({
		id: 'plural.nights',
		defaultMessage:'7;ночей;ночь;ночи;ночей',
	}))}`
		: `${nightsFrom} ${pluralTranslations(nightsFrom, intl.formatMessage({
			id: 'plural.nights',
			defaultMessage:'7;ночей;ночь;ночи;ночей',
		}))}`;

	return (
		<Dropdown
			isMobile={isMobile}
			ClickedComponent={
				<TextField
					label={intl.formatMessage({id: 'search.nightscount'})}
					value={value}
				/>
			}
			DownedComponent={
				<NightsCounter
					nightsFromFilter={nightsFromFilter}
					nightsToFilter={nightsToFilter}
					params={params}
					onChange={handleChange}
					isMobile={isMobile}
				/>
			}
		/>
	);
};

FieldNights.propTypes = {
	nightsFromFilter: PropTypes.arrayOf(PropTypes.shape).isRequired,
	nightsToFilter: PropTypes.arrayOf(PropTypes.shape).isRequired,
	intl: intlShape.isRequired,
	params: formParamsPropTypes.isRequired,
	onChange: PropTypes.func.isRequired,
	isMobile: PropTypes.bool.isRequired,
};

export default FieldNights;
