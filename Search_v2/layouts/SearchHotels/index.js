import React from 'react';
import Grid from 'components_next/Grid';
import {SearchResults} from 'components/SearchResults';
import {SearchBox} from 'components/SearchBox';
import SearchFilters from 'components/SearchFilters';

function SearchHotels() {
	return (
		<div className="searchHotelsLayout">
			<Grid container direction="column" spacing={1}>
				<Grid item>
					<h3>Layout поиска по отелям</h3>
				</Grid>
				<Grid container item>
					<Grid item>
						<Grid item>
							{/*<SearchBox />*/}
						</Grid>
						<Grid item>
							{/*<SearchFilters />*/}
						</Grid>
						<Grid item>
							{/*<SearchResults />*/}
						</Grid>
					</Grid>
					<Grid item>
						Карта с отелями
					</Grid>
				</Grid>
			</Grid>
		</div>
	);
}

export default SearchHotels;
