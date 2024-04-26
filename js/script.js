const API_KEY = 'f05cbc294b98d07862d062acb8218cb5';

// Function to fetch data from the API
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Function to display movies or persons
function displayItems(items, containerId, itemType, showType = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('item');

        const image = document.createElement('img');
        if (itemType === 'person') {
            if (item.profile_path) {
                image.src = `https://image.tmdb.org/t/p/w500${item.profile_path}`;
            } else {
                image.src = 'img/default-person-image.jpg'; 
            }
            image.alt = item.name;
        } else {
            image.src = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
            image.alt = item.title || item.name;
        }

        itemElement.appendChild(image);

        // Append title for all items
        const title = document.createElement('h3');
        title.textContent = item.title || item.name;
        itemElement.appendChild(title);

        // Append type for movies and TV series if showType is true
        if (showType && (itemType === 'movie' || itemType === 'tv')) {
            const mediaType = document.createElement('p');
            mediaType.textContent = `Type: ${item.media_type === 'tv' ? 'TV Series' : 'Movie'}`;
            itemElement.appendChild(mediaType);
        }

        // Append details based on item type
        const details = document.createElement('p');
        if (itemType === 'movie') {
            details.textContent = `Release Date: ${item.release_date}`;
        } else if (itemType === 'person') {
            details.textContent = `Known For: ${item.known_for_department}`;
        } else if (itemType === 'tv') {
            if (item.first_air_date) {
                details.textContent = `First Air Date: ${item.first_air_date}`;
            } else {
                details.textContent = 'Release Date: Not Available';
            }
        }

        itemElement.appendChild(details);

        // Append overview text only for movies and when searching for movies
        if (itemType === 'movie' && showType && item.overview) {
            const overview = document.createElement('p');
            overview.textContent = `Overview: ${item.overview}`;
            itemElement.appendChild(overview);
        }

        itemElement.addEventListener('click', () => {
            if (itemType === 'movie') {
                fetchMovieDetails(item.id);
            } else if (itemType === 'person') {
                fetchPersonMovies(item.id);
            } else if (itemType === 'tv') {
                // Handle click for TV series
                fetchTVSeriesDetails(item.id);
            }
        });

        container.appendChild(itemElement);
    });
}


// Function to fetch top rated movies
async function fetchTopRatedMovies() {
    const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=en-US&page=1`;
    try {
        const data = await fetchData(url);
        displayItems(data.results.slice(0, 10), 'top-rated-container', 'movie');
    } catch (error) {
        console.error('Error fetching top rated movies:', error);
    }
}

// Function to fetch popular movies
async function fetchPopularMovies() {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
    try {
        const data = await fetchData(url);
        displayItems(data.results.slice(0, 10), 'popular-container', 'movie');
    } catch (error) {
        console.error('Error fetching popular movies:', error);
    }
}

// Function to search for movies or TV series
async function searchMovies() {
    const query = document.getElementById('movie-query').value;
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${query}`;
    try {
        const data = await fetchData(url);
        // Filter out only movies and TV series from the search results
        const filteredResults = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
        if (filteredResults.length === 0) {
            document.getElementById('search-results-container').innerHTML = 'Error: Nothing found.';
        } else {
            displayItems(filteredResults, 'search-results-container', 'movie', true, true);
        }
    } catch (error) {
        console.error('Error searching for movies/TV series:', error);
    }
}

// Function to search for persons
async function searchPersons() {
    const query = document.getElementById('person-query').value;
    const url = `https://api.themoviedb.org/3/search/person?api_key=${API_KEY}&query=${query}`;
    try {
        const data = await fetchData(url);
        const filteredResults = data.results.filter(item => item.media_type !== 'tv');
        if (filteredResults.length === 0) {
            document.getElementById('search-results-container').innerHTML = 'Error: Nothing found.';
        } else {
            displayItems(filteredResults, 'search-results-container', 'person', true, true);
        }
    } catch (error) {
        console.error('Error searching for persons:', error);
    }
}
// Function to fetch movie details
async function fetchMovieDetails(movieId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`;
    try {
        const movieDetails = await fetchData(url);
        displayMovieDetails(movieDetails);
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

// Function to fetch movies of a person
async function fetchPersonMovies(personId) {
    const url = `https://api.themoviedb.org/3/person/${personId}/combined_credits?api_key=${API_KEY}`;
    try {
        const data = await fetchData(url);
        const combinedCredits = [...data.cast, ...data.crew];
        displayItems(combinedCredits, 'search-results-container', 'movie', true); 
    } catch (error) {
        console.error('Error fetching person movies:', error);
    }
}

// Function to initialize the app
function init() {
    document.getElementById('top-rated-button').addEventListener('click', fetchTopRatedMovies);
    document.getElementById('popular-button').addEventListener('click', fetchPopularMovies);
    document.getElementById('movie-search-button').addEventListener('click', searchMovies);
    document.getElementById('person-search-button').addEventListener('click', searchPersons);
}

init();
