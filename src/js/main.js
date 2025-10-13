// Main JS entry point
// Sets up event listeners, initializes components, and manages state for the application.
import Menu from '../components/Menu.mjs';
import Footer from '../components/Footer.mjs';
import { renderNewsList, renderRecommendations, renderUpcomingReleases, getRecommendations, fillGenresFilter, getCacheByType } from '../lib/utils.js'; 

// Initializations
const menu = new Menu('home');
const footer = new Footer();
const animeResultsList = document.getElementById('anime-recommendations-list');
const mangaResultsList = document.getElementById('manga-recommendations-list');
const animeNewsList = document.getElementById('anime-news-list');
const mangaNewsList = document.getElementById('manga-news-list');
const upcomingReleasesList = document.getElementById('upcoming-releases-list');
const popup = document.getElementById('details-popup');
const closePopupBtn = document.getElementById('close-popup');
const animeGenreFilter = document.getElementById('anime-genre-filter');
const animeSortFilter = document.getElementById('anime-sort-filter');
const animeMoreBtn = document.getElementById('anime-more-btn');
const mangaGenreFilter = document.getElementById('manga-genre-filter');
const mangaSortFilter = document.getElementById('manga-sort-filter');
const mangaMoreBtn = document.getElementById('manga-more-btn');
const animeRcPage = 20;
const mangaRcPage = 20;

// Initialize menu and footer
menu.init();
footer.init();

// Load initial data and set up event listeners
window.addEventListener('DOMContentLoaded', async () => {
	let animeRecommendations = {};
	let mangaRecommendations = {};

	// Load recommendations, news, genres, and upcoming releases
	animeRecommendations = await getRecommendations('anime');
	mangaRecommendations = await getRecommendations('manga');
	renderRecommendations(animeRecommendations, animeResultsList);
	renderRecommendations(mangaRecommendations, mangaResultsList);

	await fillGenresFilter('anime', animeGenreFilter);
	await fillGenresFilter('manga', mangaGenreFilter);
	await renderNewsList('anime', animeNewsList);
	await renderNewsList('manga', mangaNewsList);
	await renderUpcomingReleases(upcomingReleasesList);

});

	// Adapt button labels based on viewport: 'More' on small screens, 'See more' otherwise
	function updateMoreButtonsLabel() {
		const isSmall = window.matchMedia('(max-width: 400px)').matches;
		const animeBtn = document.getElementById('anime-more-btn');
		const mangaBtn = document.getElementById('manga-more-btn');
		if (animeBtn) animeBtn.textContent = isSmall ? 'More' : 'See more';
		if (mangaBtn) mangaBtn.textContent = isSmall ? 'More' : 'See more';
	}

	// Initial label set and on resize
	updateMoreButtonsLabel();
	window.addEventListener('resize', updateMoreButtonsLabel);

// Set initial pagination state
sessionStorage.setItem('animeRcPage', animeRcPage);
sessionStorage.setItem('mangaRcPage', mangaRcPage);

animeGenreFilter.addEventListener('change', (e) => {
	const genre = e.target.value;

	// Retrieve pagination and cached data
	const recSize = sessionStorage.getItem('animeRcPage') ? Number(sessionStorage.getItem('animeRcPage')) : animeRcPage;
	const cachedAnimeObj = getCacheByType('anime');
	const animeRecommendations = sessionStorage.getItem('animeRecommendations') ? JSON.parse(sessionStorage.getItem('animeRecommendations')) : [];

	// Clean up filtered anime list
	let filteredAnime = [];

	// Clear sort filter when genre changes
	animeSortFilter.value = 'sortby';

	// If 'all' is selected, show all recommendations up to recSize
	// Otherwise, filter recommendations by selected genre
	if (genre === 'all') {
		filteredAnime = animeRecommendations.slice(0, recSize);
	} else {
		const searchList = cachedAnimeObj.filter(anime => anime.genres[0]?.mal_id == genre);
		filteredAnime = animeRecommendations.slice(0, recSize).filter(anime => searchList.some(s => s.mal_id === anime.entry.mal_id));
	}

	// Save filtered list to session for sorting
	sessionStorage.setItem('filteredAnime', JSON.stringify(filteredAnime));

	// Render the filtered recommendations
	renderRecommendations(filteredAnime, animeResultsList);
});

animeSortFilter.addEventListener('change', (e) => {
	const sortBy = e.target.value;

	// Retrieve cached data and filtered list
	const cachedAnimeObj = getCacheByType('anime');
	const filteredAnime = sessionStorage.getItem('filteredAnime') ? JSON.parse(sessionStorage.getItem('filteredAnime')) : [];
	const animeRecommendations = sessionStorage.getItem('animeRecommendations') ? JSON.parse(sessionStorage.getItem('animeRecommendations')) : [];

	// Sort the filtered list based on selected criteria
	let sortedAnime = [...cachedAnimeObj.filter(a => filteredAnime.some(f => f.entry.mal_id === a.mal_id))];
	let sortedRec = [];
	
	// Apply sorting
	if (sortBy === 'score') {
		sortedAnime.sort((a, b) => (b.score || 0) - (a.score || 0));
	} else if (sortBy === 'year') {
		sortedAnime.sort((a, b) => (b.aired.prop.from.year || 0) - (a.aired.prop.from.year || 0));
	} else if (sortBy === 'title') {
		sortedAnime.sort((a, b) => a.title.localeCompare(b.title));
	}

	// Map sorted anime back to recommendation format
	sortedRec = sortedAnime.map(sa => animeRecommendations.find(ar => ar.entry.mal_id === sa.mal_id)).filter(Boolean);

	// Render the sorted recommendations
	renderRecommendations(sortedRec, animeResultsList);
});

animeMoreBtn.addEventListener('click', () => {
	// Increase recommendation size and reset filters
	let recSize = sessionStorage.getItem('animeRcPage') ? Number(sessionStorage.getItem('animeRcPage')) : animeRcPage;
	recSize += 20;
	animeGenreFilter.value = 'all';
	animeSortFilter.value = 'sortby';

	// Update pagination state
	sessionStorage.setItem('animeRcPage', recSize);

	// Retrieve recommendations and update filtered list
	const animeRecommendations = sessionStorage.getItem('animeRecommendations') ? JSON.parse(sessionStorage.getItem('animeRecommendations')) : [];
	sessionStorage.setItem('filteredAnime', JSON.stringify(animeRecommendations.slice(0, recSize)));

	// Render the updated recommendations
	renderRecommendations(animeRecommendations.slice(0, recSize), animeResultsList);

	// Disable button if max of 60 recommendations reached
	if (recSize >= 60) {
		animeMoreBtn.disabled = true;
		animeMoreBtn.classList.add('btn-disabled');
	}
});

mangaGenreFilter.addEventListener('change', (e) => {
	const genre = e.target.value;

	// Retrieve pagination and cached data
	const recSize = sessionStorage.getItem('mangaRcPage') ? Number(sessionStorage.getItem('mangaRcPage')) : 20;
	const cachedMangaObj = getCacheByType('manga');
	const mangaRecommendations = sessionStorage.getItem('mangaRecommendations') ? JSON.parse(sessionStorage.getItem('mangaRecommendations')) : [];
	let filteredManga = [];

	// Clear sort filter when genre changes
	mangaSortFilter.value = 'sortby';

	// If 'all' is selected, show all recommendations up to recSize
	// Otherwise, filter recommendations by selected genre
	if (genre === 'all') {
		filteredManga = mangaRecommendations.slice(0, recSize);
	} else {
		const searchList = cachedMangaObj.filter(manga => manga.genres[0]?.mal_id == genre);
		filteredManga = mangaRecommendations.slice(0, recSize).filter(manga => searchList.some(s => s.mal_id === manga.entry.mal_id));
	}

	// Save filtered list to session for sorting
	sessionStorage.setItem('filteredManga', JSON.stringify(filteredManga));

	// Render the filtered recommendations
	renderRecommendations(filteredManga, mangaResultsList);
});

mangaSortFilter.addEventListener('change', (e) => {
	const sortBy = e.target.value;

	// Retrieve cached data and filtered list
	const cachedMangaObj = getCacheByType('manga');
	const filteredManga = sessionStorage.getItem('filteredManga') ? JSON.parse(sessionStorage.getItem('filteredManga')) : [];
	const mangaRecommendations = sessionStorage.getItem('mangaRecommendations') ? JSON.parse(sessionStorage.getItem('mangaRecommendations')) : [];
	
	// Sort the filtered list based on selected criteria
	let sortedManga = [...cachedMangaObj.filter(m => filteredManga.some(f => f.entry.mal_id === m.mal_id))];
	let sortedRec = [];
	
	// Apply sorting
	if (sortBy === 'score') {
		sortedManga.sort((a, b) => (b.score || 0) - (a.score || 0));
	} else if (sortBy === 'year') {
		sortedManga.sort((a, b) => (b.published?.prop?.from?.year || 0) - (a.published?.prop?.from?.year || 0));
	} else if (sortBy === 'title') {
		sortedManga.sort((a, b) => a.title.localeCompare(b.title));
	}

	// Map sorted manga back to recommendation format
	sortedRec = sortedManga.map(sm => mangaRecommendations.find(mr => mr.entry.mal_id === sm.mal_id)).filter(Boolean);

	// Render the sorted recommendations
	renderRecommendations(sortedRec, mangaResultsList);
});

mangaMoreBtn.addEventListener('click', () => {
	// Increase recommendation size and reset filters
	let recSize = sessionStorage.getItem('mangaRcPage') ? Number(sessionStorage.getItem('mangaRcPage')) : 20;
	recSize += 20;
	mangaGenreFilter.value = 'all';
	mangaSortFilter.value = 'sortby';

	// Update pagination state
	sessionStorage.setItem('mangaRcPage', recSize);

	// Retrieve recommendations and update filtered list
	const mangaRecommendations = sessionStorage.getItem('mangaRecommendations') ? JSON.parse(sessionStorage.getItem('mangaRecommendations')) : [];
	sessionStorage.setItem('filteredManga', JSON.stringify(mangaRecommendations.slice(0, recSize)));

	// Render the updated recommendations
	renderRecommendations(mangaRecommendations.slice(0, recSize), mangaResultsList);
	if (recSize >= 60) {
		mangaMoreBtn.disabled = true;
		mangaMoreBtn.classList.add('btn-disabled');
	}
});

// Details popup close handlers
closePopupBtn.addEventListener('click', () => {
	popup.style.display = 'none';
});

// Close popup when clicking outside of it
popup.addEventListener('click', (e) => {
	if (e.target === popup) popup.style.display = 'none';
});