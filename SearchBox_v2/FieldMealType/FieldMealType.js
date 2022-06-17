import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {FormControl, FormControlLabel, FormGroup} from '@material-ui/core';

import Dropdown from '../../Dropdown';
import TextField from '../../TextField';
import Checkbox from '../../StyleGuides/Checkboxes/Checkbox';
import {intlShape} from '../../../intl/propTypes';

const FieldMealType = ({filter, onChange, intl, isMobile}) => {
	const [checkedMealTypes, setMealTypes] = useState([]);

	if (!filter || !filter.length) {
		return null;
	}
	const label = intl.formatMessage({id: 'hotel-page.label.meal-type'});

	const handleChange = ({target: {value, checked}}) => {
		let nextTypes;
		if (checked) {
			nextTypes = [...checkedMealTypes, Number(value)];
		} else {
			nextTypes = checkedMealTypes.filter(id => id !== Number(value));
		}
		setMealTypes(nextTypes);
		onChange({'mealType': nextTypes});
	};

	let fieldValue = intl.formatMessage({id: 'hotel-page.placeholder.any-meal'});
	if (checkedMealTypes.length) {
		fieldValue = filter
			.filter((type) => checkedMealTypes.includes(type.id))
			.map((type) => type.name)
			.join(', ');
	}

	return (
		<Dropdown
			isMobile={isMobile}
			ClickedComponent={
				<TextField
					label={label}
					value={fieldValue}
				/>
			}
			DownedComponent={
				<div>
					<FormControl component="fieldset">
						<FormGroup>
							{filter.map((mealType) => {
								const checked = checkedMealTypes.includes(mealType.id);
								return (<FormControlLabel
									control={
										<Checkbox
											checked={checked}
											onChange={handleChange}
											value={mealType.id}
										/>
									}
									label={mealType.name}
									key={mealType.id}
								/>);
							})}
						</FormGroup>
					</FormControl>
				</div>
			}
		/>);
};

FieldMealType.propTypes = {
	filter: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.number,
		name: PropTypes.string,
	})).isRequired,
	onChange: PropTypes.func.isRequired,
	intl: intlShape.isRequired,
	isMobile: PropTypes.bool.isRequired,
};

export default FieldMealType;
