import React, {useState} from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';
import clsx from 'clsx';
import htmlParse from 'html-react-parser';
import CONFIG from 'config';
import SubscriptionForm from '../../../../components_next/SubscriptionForm';

import {intlShape} from '../../../../intl/propTypes';
import {SearchResults} from '../../../../components/SearchResults';
import {SearchBox} from '../../../../components/SearchBox';
import SearchBoxV2 from '../../../../components_next/SearchBox_v2';
import SearchFilters from '../../../../components/SearchFilters';

import Meta from '../../../../components/shared/Meta';
import {FloctoryCategoryComponent} from '../../../../components/Floctory';
import {BreadCrumbs} from '../../../../components/BreadCrumbs';
import GTMEvents from '../../../../Services/AnalyticsService/GTMEvents';
import {isPrerender, pluralTranslations, SearchProvider} from '../../../../utils';
import {mapFiltersForOldForm, mapSearchParams} from '../SearchHotTours/mappers';
import {getSortButtons, getSortButtonsMobile, getSortBy} from '../sortButtons';
import {CONSTANTS} from '../../../../constants';
import {SortPanel} from '../../../../components/SortPanel';
import MobileFilterButton from '../SearchHotTours/MobileFilterButton';
import RTBHouseRenderer from '../SearchHotTours/rtb';
import {AnalyticsService} from '../../../../Services/AnalyticsService';
import {HotelsGoogleMap} from '../../../../components/GoogleMap';
import Logger from '../../../../Services/Logger';

import '../../../Search/index.styl';
import {MindboxPopmechanic} from '../../../../components_next/MindboxPopmechanic';

const gtmEvents = new GTMEvents();
const isUA = CONFIG.settings.clientTypeId === 'b2c:ua';

const SearchMain = (
	{
		intl, parameters, toursRaw, tours,
		groupedFilters, triggers, handlers, state,
		isToursLoading, isGeoContentLoading, seoText,
		breadCrumbs,
	}) => {

	const {size, sortType, isMobileFiltersShown} = state;
	const {
		onFormSearch, onFormChange, onSortResults, onFilterChange,
		onFiltersReset, resetFilters, onToggleMobileFilters, onMoreResults,
	} = handlers;

	const [isMapShow, setMapShow] = useState(false);

	const sortBy = getSortBy(intl);
	const sortButtons = getSortButtons(intl);
	const sortButtonsMobile = getSortButtonsMobile(intl);

	const {params, geoParams} = parameters || {};
	const {hotelFilters} = groupedFilters || {};

	if (!groupedFilters) {
		return null;
	}

	const {searchFilters} = groupedFilters;
	const formFilters = mapFiltersForOldForm(searchFilters);

	const {isMobile, isServerSide, isResetFilters} = triggers;

	const searchType = CONSTANTS.URL_SEARCH_TYPE.hotTours;
	const flocktoryObj = {
		dateFrom: params.dateFrom,
		dateDelta: params.dateDelta || 0,
		nightsFrom: params.nightsFrom,
		nightsTo: params.nightsTo,
		adults: params.adults,
		children: params.children,
		newbies: params.newbies,
		childrenAges: params.childrenAges,
	};

	const metas = SearchProvider.buildSearchPageMetaTags(geoParams.grammar, window.location, intl);

	const handleMapView = () => {
		setMapShow(!isMapShow);
		if (!isMapShow) {
			AnalyticsService.sendEvent('OpenMapOnSearch', 'Map', 'OpenMap');
		}
	};

	const average = (value) => {
		if (value.length === 0) {
			return;
		}
		let sum = 0;
		for (const i in value) {
			sum += value[i];
		}
		return sum / (value.length);
	};

	const renderMap = () => {
		if (!tours || !tours.length) {
			return null;
		}

		try {
			const allHotels = tours.map(item => item.hotels[0]);
			const geoCoordinates = allHotels.map(i => i.geoCoordinates);

			const defLng = average(geoCoordinates.map(i => i.longitude)
				.filter(r => r !== undefined));
			const defLat = average(geoCoordinates.map(i => i.latitude)
				.filter(r => r !== undefined));
			return (
				<HotelsGoogleMap
					places={tours}
					defLng={defLng}
					defLat={defLat}
					location={window.location}
				/>
			);
		} catch (e) {
			Logger.log({
				level: 'error',
				message: `Cannot render the map ${e}`,
			});
			return null;
		}
	};

	const renderSearchTopFilters = () => {
		if (!tours) {
			return null;
		}

		const buttonText = isMapShow
			? intl.formatMessage({id: 'search.closeMap'})
			: intl.formatMessage({id: 'search.onMap'});

		const classNameButton = clsx('g-map__button',
			{
				'_show': isMapShow,
				'_hide': !isMapShow,
			});

		return (
			<div className="search-top-filters">
				<div className="search-result-count">
					{!!tours.length && (
						<h2 className="search-result-count__title">
							{intl.formatMessage({id: 'search-page.text.search-result-count'},
								{totalSearchCount: tours.length})
							+ pluralTranslations(tours.length, intl.formatMessage({id: 'plural.hotel'}))}
						</h2>
					)
					}
					{!isMobile && !!tours.length
					&& (
						<button
							className={classNameButton}
							onClick={handleMapView}
						>
							{buttonText}
						</button>
					)
					}
				</div>
				{!!tours.length && <SortPanel
					isTours={!!(tours && tours.length)}
					label={sortBy.toString()}
					sortButtons={sortButtons}
					sortButtonsMobile={sortButtonsMobile}
					onSort={onSortResults}
					isMobile={isMobile}
					currentSortType={sortType}
					showAscSelector
					intl={intl}
				/>}
				{!isMobile && isMapShow && !isPrerender && renderMap()}
			</div>
		);
	};

	return (
		<div>
			<div className="SearchPage">
				<Meta metaObject={metas} />
				{params.departureCityId && <FloctoryCategoryComponent countryId={`${params.departureCityId}_${params.directionCountryTo}`} />}
				<div className="SearchPage__head">
					{isMobile && (
						<div className="HotToursPage-breadcrumbs-container">
							<BreadCrumbs items={breadCrumbs} />
						</div>
					)}
					<SearchBoxV2
						filters={formFilters}
						params={params}
						onChange={onFormChange}
						intl={intl}
						isMobile={isMobile}
						onSearch={onFormSearch}
					/>
					{/* <SearchBox
						isEdit
						isChangeViewEnabled={isMobile}
						page={0}
						values={cloneDeep(params)}	// форма поиска меняет params напрямую и это трудно отследить, поэтому cloneDeep
						filters={formFilters}
						isMobile={isMobile}
						isTablet={isMobile}
						onSearch={params => onFormSearch(mapSearchParams(params))}
						onChange={onFormChange}
						error={null}
						checkParams={['Region', 'ArrivalTown']}
						autoRunFirstSearch={false}
						autoCloseDatepickerOnChange
					/> */}
					{!isMobile && (
						<div className="HotToursPage-breadcrumbs-container">
							<BreadCrumbs items={breadCrumbs} />
						</div>
					)}
				</div>
				<div className="SearchPage__body">
					<div className="SearchPage-filters">
						<SearchFilters
							isFiltersLoading={isGeoContentLoading}
							filters={hotelFilters}
							allParams={params}
							searchResults={toursRaw}
							shownResults={tours}
							onChange={onFilterChange}
							onClose={onToggleMobileFilters}
							isMobile={isMobile}
							isOpen={isMobileFiltersShown}
							isServerSide={isServerSide}
							totalCount={(toursRaw || {}).length}
							shownCount={(tours || {}).length}
							isResetFilters={isResetFilters}
							onResetFilters={onFiltersReset}
						/>
					</div>
					<div className="SearchPage-content">
						{isUA && <h1>{metas.h1}</h1>}
						<div className="content-results">
							{renderSearchTopFilters()}
							<SearchResults
								isToursLoading={isToursLoading}
								searchType={searchType}
								searchResults={tours}
								size={size}
								isMobile={isMobile}
								location={window.location}
								flocktoryObj={flocktoryObj}
								onMore={onMoreResults}
								onHotelClickGTM={gtmEvents.hotelClick}
								resetFilters={resetFilters}
							/>
							{seoText && <p className="content-results__seo-text">{htmlParse(seoText)}</p>}
						</div>
					</div>
					<MobileFilterButton {...{isMobile, onToggleMobileFilters, isMobileFiltersShown}} />
				</div>
			</div>
			<MindboxPopmechanic
				categoryId={`${params.directionFrom}${params.directionCountryTo}`}
				personalRecommendations
				popularHotels
				update
			/>
			<SubscriptionForm />
			<RTBHouseRenderer {...{params, tours}} />
		</div>
	);
};

SearchMain.defaultProps = {
	tours: null,
	groupedFilters: null,
	seoText: null,
};

SearchMain.propTypes = {
	state: PropTypes.shape({
		size: PropTypes.number,
		sortType: PropTypes.number,
		isMobileFiltersShown: PropTypes.bool,
	}).isRequired,
	intl: intlShape.isRequired,
	parameters: PropTypes.objectOf(PropTypes.shape).isRequired,
	toursRaw: PropTypes.arrayOf(PropTypes.shape).isRequired,
	tours: PropTypes.arrayOf(PropTypes.shape),
	groupedFilters: PropTypes.objectOf(PropTypes.shape),
	triggers: PropTypes.objectOf(PropTypes.bool).isRequired,
	handlers: PropTypes.objectOf(PropTypes.func).isRequired,
	isToursLoading: PropTypes.bool.isRequired,
	isGeoContentLoading: PropTypes.bool.isRequired,
	seoText: PropTypes.string,
	breadCrumbs: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SearchMain;
