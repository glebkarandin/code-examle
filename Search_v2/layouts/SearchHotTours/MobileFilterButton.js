import React from 'react';
import classnames from 'classnames';
import {FormattedMessage} from 'react-intl';

/**
 * Компонент для рендера кнопки мобильных фильтров
 * @component
 * @property {object} triggers - различные переключатели режимов
 */
export default function MobileFilterButton({isMobile, onToggleMobileFilters, isMobileFiltersShown}) {
	if (!isMobile || isMobileFiltersShown) {
		return null;
	}

	return (
		<div className="HotToursPage__mobile-filters">
			<button
				type="button"
				className={classnames('btn__mobile', 'btn__mobile-blue')}
				onClick={onToggleMobileFilters}
			>
				<FormattedMessage id="filters" />
			</button>
		</div>
	);
}
