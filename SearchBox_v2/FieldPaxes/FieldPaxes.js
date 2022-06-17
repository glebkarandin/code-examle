import React from 'react';
import PropTapes from 'prop-types';

import Dropdown from '../../Dropdown';
import TextField from '../../TextField';
import PaxControlTour from '../../PaxControl';
import {pluralTranslations} from '../../../utils';
import {intlShape} from '../../../intl/propTypes';
import {formParamsPropTypes} from '../../../pages/Search_v2/params/ParamsController';

const FieldPaxes = ({intl, params, onChange, isMobile}) => {
	const {adults, children, childrenAges} = params;

	const PAXesString = `${adults + children} ${pluralTranslations(adults + children, intl.formatMessage({id: 'plural.tourists'}))}`;

	return (
		<Dropdown
			isMobile={isMobile}
			ClickedComponent={
				<TextField
					label={intl.formatMessage({id: 'search.tourists'})}
					value={PAXesString}
				/>
			}
			DownedComponent={
				<div>
					<PaxControlTour
						intl={intl}
						onChangePAX={onChange}
						selectedPAXes={{adults, children, childrenAges}}
						isMobile={isMobile}
					/>
				</div>
			}
		/>
	);
};

FieldPaxes.propTypes = {
	intl: intlShape.isRequired,
	params: formParamsPropTypes.isRequired,
	onChange: PropTapes.func.isRequired,
	isMobile: PropTapes.bool.isRequired,
};

export default FieldPaxes;
