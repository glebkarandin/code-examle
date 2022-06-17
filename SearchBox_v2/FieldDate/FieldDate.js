import React from 'react';
import PropTypes from 'prop-types';
import {format, parseISO, formatISO} from 'date-fns';
import ru from 'date-fns/locale/ru';
import {FormattedMessage} from 'react-intl';
import {FormControlLabel} from '@material-ui/core';

import DatePicker, {registerLocale} from 'react-datepicker';
import './DatePicker.styl';

import {CONSTANTS} from '../../../constants';
import {formParamsPropTypes} from '../../../pages/Search_v2/params/ParamsController';
import {intlShape} from '../../../intl/propTypes';

import Dropdown from '../../Dropdown';
import TextField from '../../TextField';
import Checkbox from '../../StyleGuides/Checkboxes/Checkbox';

import classes from './FieldDate.module.scss';

// TODO Русифицировать глобально
registerLocale('ru_RU', ru);

const FieldDate = ({filter, params, onChange, isMobile, intl}) => {
	const {URL_SEARCH_PARAMS: {DepartureDate, DateDelta}} = CONSTANTS;
	const {dateFrom, dateDelta} = params;

	if (!dateFrom) {
		return null;
	}

	// TODO Парсить формат даты корректно
	const dateForDayPicker = new Date(dateFrom);
	const dateString = format(parseISO(dateFrom), 'dd.MM.yyyy');

	const handleOnSelect = (nextDate) => {
		const nextParam = {[DepartureDate]: formatISO(nextDate, {representation: 'date'})};
		onChange(nextParam);
	};

	const handleChangeDelta = ({target}) => {
		// TODO вынести 3 в настройки
		onChange({[DateDelta]: target.checked ? 3 : null});
	};

	return (
		<Dropdown
			isMobile={isMobile}
			ClickedComponent={
				<TextField
					label={intl.formatMessage({id: 'search.departuredate'})}
					value={dateString}
				/>
			}
			DownedComponent={
				<div className={classes.FieldDate}>
					<DatePicker
						inline
						selected={dateForDayPicker}
						onSelect={handleOnSelect}
						includeDates={filter}
						monthsShown={2}
						calendarClassName="tuiDatePicker"
						locale="ru_RU"
					/>
					<div className={classes.FieldDate_dateDelta}>
						<FormControlLabel
							control={<Checkbox checked={!!dateDelta} name="name" onChange={handleChangeDelta} />}
							label={<FormattedMessage id="datepicker.threedays" defaultMessage="± 3 дня" />}
						/>
					</div>
				</div>
			}
		/>
	);
};

FieldDate.propTypes = {
	filter: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
	params: formParamsPropTypes.isRequired,
	onChange: PropTypes.func.isRequired,
	isMobile: PropTypes.bool.isRequired,
	intl: intlShape.isRequired,
};

export default FieldDate;
