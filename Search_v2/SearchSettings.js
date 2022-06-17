import CONFIG from 'config';
import {ROUT_MAIN_PAGE, ROUT_SEARCH_MAIN, ROUT_SEARCH_HOT_TOURS} from './constants';
import {CONSTANTS, SORT_TYPES} from '../../constants';

const settingsDefault = {
	autoSearch: false,
	shownItems: 10,
	sortType: SORT_TYPES.price,
};

const hotTours = {
	autoSearch: true,
	shownItems: null,

};

const searchMain = {
	autoSearch: true,
	shownItems: 10,
	sortType: SORT_TYPES.price,
};

const mainPage = {
	autoSearch: false,
};

class SearchSettings {
	constructor() {
		this.settings = {};
	}

	init = (page) => {
		// TODO Нужны разные конфиги для разных поисков. Желательно редактируемые в CMS.
		const {searchParamsDefault} = CONFIG.settings;

		const {DateShift} = CONSTANTS.URL_SEARCH_PARAMS;

		switch (page) {
			case ROUT_SEARCH_HOT_TOURS:
				this.settings = {
					searchParamsDefault: {
						...searchParamsDefault,
						[DateShift]: 0, // Нужен отдельный конфиг для Горящих туров. Смотри TODO выще.
					},
					...settingsDefault,
					...hotTours,
				};
				break;
			case ROUT_SEARCH_MAIN:
				this.settings = {
					searchParamsDefault,
					...settingsDefault,
					...searchMain,
				};
				break;
			case ROUT_MAIN_PAGE:
				this.settings = {
					searchParamsDefault,
					...settingsDefault,
					...mainPage,
				};
				break;
			default:
				this.settings = {
					searchParamsDefault,
					...settingsDefault,
				};
		}
	};

	getSettings = () => this.settings;
}

export default new SearchSettings();
