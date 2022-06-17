import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Popper from '@material-ui/core/Popper';
import {makeStyles} from '@material-ui/core/styles'

import TextField from '../../TextField';
import {CONSTANTS} from '../../../constants';

import classes from './FieldFrom.module.scss';
import {formParamsPropTypes} from '../../../pages/Search_v2/params/ParamsController';
import {intlShape} from '../../../intl/propTypes';

const FieldFrom = ({filter, onChange, params, loading, intl, isMobile}) => {
	const {URL_SEARCH_PARAMS: {DepartureCityId}} = CONSTANTS;
	const {values: cities} = filter;
	const handleChange = (event, value) => {
		onChange({[DepartureCityId]: value.id});
	};

	const useStyles = makeStyles({
		listbox: {
			maxHeight: isMobile ? '100vh' : '40vh',
		},
	});

	const classesAutocomlete = useStyles();

	if (!cities || !cities.length) {
		return null;
	}
	const currentCity = cities?.filter(
		(city) => city.id === params[DepartureCityId]
	);
	if (!currentCity[0]) {
		return null;
	}

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
		<div className={classes.FieldFrom}>
			<Autocomplete
				classes={{
					listbox: classesAutocomlete.listbox,
				}}
				{...autoCompleteProps}
				renderInput={(inputParams) => (<TextField
					label={intl.formatMessage({id: 'search.from'})}
					{...inputParams}
				/>)}
				options={cities}
				defaultValue={currentCity[0]}
				getOptionLabel={(option) => option.name}
				getOptionSelected={(option, value) => option.id === value.id}
				onChange={handleChange}
				loading={loading}
			/>
		</div>
	);
};

FieldFrom.defaultProps = {
	loading: false,
};

FieldFrom.propTypes = {
	filter: PropTypes.shape({
		label: PropTypes.string,
		name: PropTypes.string,
		values: PropTypes.arrayOf(PropTypes.object),
	}).isRequired,
	onChange: PropTypes.func.isRequired,
	params: formParamsPropTypes.isRequired,
	loading: PropTypes.bool,
	isMobile: PropTypes.bool.isRequired,
	intl: intlShape.isRequired,
};

export default FieldFrom;
