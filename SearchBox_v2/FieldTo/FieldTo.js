import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Popper from '@material-ui/core/Popper';
import {makeStyles} from '@material-ui/core/styles';

import TextField from '../../TextField';

import {CONSTANTS} from '../../../constants';

import classes from './FieldTo.module.scss';
import {formParamsPropTypes} from '../../../pages/Search_v2/params/ParamsController';
import {intlShape} from '../../../intl/propTypes';

const FieldTo = ({filter, onChange, params, loading, intl, isMobile}) => {
	const {URL_SEARCH_PARAMS: {ArrivalCountryId}} = CONSTANTS;
	const {directionCountryTo} = filter;
	const {values: countries} = directionCountryTo;

	const useStyles = makeStyles({
		listbox: {
			maxHeight: isMobile ? '100vh' : '40vh',
		},
	});

	const classesAutocomlete = useStyles();

	const countryDefault = countries?.filter(
		(country) => country.id === params[ArrivalCountryId]
	);

	const handleChange = (event, value) => {
		onChange({[ArrivalCountryId]: value.id});
	};

	const autoCompleteProps = {};
	if (isMobile) {
		autoCompleteProps.PopperComponent = (popperProps) => (<Popper
			{...popperProps}
			style={{
				width: '100%',
				height: '100%',
			}}
			modifiers={
				{applyStyle: {
					enabled: false,
				}}
			}
		/>);
	} else {
		autoCompleteProps.disablePortal = true;
	}

	return (
		<div className={classes.FieldTo}>
			<Autocomplete
				classes={{
					listbox: classesAutocomlete.listbox,
				}}
				{...autoCompleteProps}
				renderInput={(inputParams) => (<TextField
					label={intl.formatMessage({id: 'search.to'})}
					{...inputParams}
				/>)}
				options={countries}
				defaultValue={countryDefault[0]}
				onChange={handleChange}
				getOptionLabel={(option) => option.name}
				getOptionSelected={(option, value) => option.id === value.id}
			/>
		</div>
	);
};

FieldTo.defaultProps = {
	loading: false,
}

FieldTo.propTypes = {
	filter: PropTypes.objectOf(PropTypes.shape({
		label: PropTypes.string,
		name: PropTypes.string,
		values: PropTypes.arrayOf(PropTypes.object),
	})).isRequired,
	onChange: PropTypes.func.isRequired,
	params: formParamsPropTypes.isRequired,
	loading: PropTypes.bool,
	isMobile: PropTypes.bool.isRequired,
	intl: intlShape.isRequired,
};

export default FieldTo;
