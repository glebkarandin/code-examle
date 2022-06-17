import React from 'react';
import {getHotelIdsJoinDepartureTownId} from '../../../../utils';
import RTBHouse from '../../../../components_next/RTBHouse';

/**
 * Компонент для рендера RTB (маркетинговый инструмент)
 * @component
 * @param {object} params - сырые исходные параметры страницы
 * @param {object} tours - сырая поисковая выдача
 */
const RTBHouseRenderer = ({params, tours}) => {
	if (!params || !tours) {
		return null;
	}

	const {directionFrom} = params;
	const goodsIdsForRTB = getHotelIdsJoinDepartureTownId({
		tours,
		directionFrom,
	});

	return (
		<>
			{params.directionCountryTo && <RTBHouse src={`_category2_${params.directionCountryTo}`} />}
			{goodsIdsForRTB && <RTBHouse src={`_listing_${goodsIdsForRTB}`} />}
		</>
	);
};

export default React.memo(RTBHouseRenderer);
