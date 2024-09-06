const API_KEY = '706c4947'; 
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';  
const API_URL = 'https://www.omdbapi.com/';
const TMDB_API_URL = 'https://api.themoviedb.org/3/movie/popular';
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const backToHomeButton = document.getElementById('back-to-home');
const homepageSection = document.getElementById('homepage');
const searchResultsSection = document.getElementById('search-results');
const popularMovieGrid = document.getElementById('popular-movie-grid');
const genreMovieGrid = document.getElementById('genre-movie-grid');
const genreButtons = document.querySelectorAll('.genre');
const resultContainer = document.getElementById('result');
const movieDetailsSection = document.getElementById('movie-details');
let popularPage = 1;
let genrePage = 1;
let searchPage = 1;
let currentGenre = 'Action';
window.addEventListener('load', () => {
    fetchPopularMovies();
    fetchGenreMovies('Action');  
});
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        switchToSearchResults(query);
    }
});
searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            switchToSearchResults(query);
        }
    }
});
backToHomeButton.addEventListener('click', () => {
    searchResultsSection.style.display = 'none';
    movieDetailsSection.style.display = 'none';
    homepageSection.style.display = 'block';
    backToHomeButton.style.display = 'none';
});
genreButtons.forEach(button => {
    button.addEventListener('click', () => {
        const genre = button.getAttribute('data-genre');
        genrePage = 1;  
        fetchGenreMovies(genre);
    });
});
function switchToSearchResults(query) {
    homepageSection.style.display = 'none';
    searchResultsSection.style.display = 'block';
    backToHomeButton.style.display = 'inline-block';
    movieDetailsSection.style.display = 'none';
    searchPage = 1;  
    fetchMovieData(query);
}
async function fetchPopularMovies() {
  try {
      const response = await fetch(`${API_URL}?s=movie&apikey=${API_KEY}&page=${popularPage}`);
      const data = await response.json();

      if (data.Response === 'True') {
          displayMovies(data.Search, popularMovieGrid);
          popularPage++;  
      } else {
          popularMovieGrid.innerHTML = `<p class="error-message">${data.Error}</p>`;
      }
  } catch (error) {
      console.error('Error fetching popular movies:', error);
      popularMovieGrid.innerHTML = `<p class="error-message">Failed to load popular movies.</p>`;
  }
}
async function fetchGenreMovies(genre) {
  try {
      const response = await fetch(`${API_URL}?s=${encodeURIComponent(genre)}&type=movie&apikey=${API_KEY}&page=${genrePage}`);
      const data = await response.json();

      if (data.Response === 'True') {
          const detailedPromises = data.Search.map(movie => fetch(`${API_URL}?i=${movie.imdbID}&apikey=${API_KEY}`));
          const detailedResponses = await Promise.all(detailedPromises);
          const detailedData = await Promise.all(detailedResponses.map(res => res.json()));

          const filteredMovies = detailedData.filter(movie => movie.Genre && movie.Genre.includes(genre));

          if (filteredMovies.length > 0) {
              displayMovies(filteredMovies, genreMovieGrid);
          } else {
              genreMovieGrid.innerHTML = `<p class="error-message">No movies found for the genre "${genre}".</p>`;
          }
          genrePage++;  
      } else {
          genreMovieGrid.innerHTML = `<p class="error-message">${data.Error}</p>`;
      }
  } catch (error) {
      console.error('Error fetching genre movies:', error);
      genreMovieGrid.innerHTML = `<p class="error-message">Failed to load genre movies.</p>`;
  }
}
async function fetchMovieData(query) {
  try {
      const response = await fetch(`${API_URL}?s=${encodeURIComponent(query)}&type=movie&apikey=${API_KEY}&page=${searchPage}`);
      const data = await response.json();

      if (data.Response === 'True') {
          displayMovies(data.Search, resultContainer);
      } else {
          resultContainer.innerHTML = `<p class="error-message">${data.Error}</p>`;
      }
      searchPage++;  
  } catch (error) {
      console.error('Error fetching data:', error);
      resultContainer.innerHTML = `<p class="error-message">Something went wrong. Please try again later.</p>`;
  }
}
function displayMovies(movies, container) {
  container.innerHTML = ''; 
  movies.forEach(movie => {
      if (movie.Poster && movie.Poster !== 'N/A') {  
          const movieItem = document.createElement('div');
          movieItem.classList.add('movie-item');
          movieItem.innerHTML = `
              <img src="${movie.Poster}" alt="${movie.Title} Poster" />
              <div class="movie-details">
                  <h2>${movie.Title}</h2>
                  <p>Year: ${movie.Year}</p>
              </div>
          `;
          movieItem.addEventListener('click', () => {
              fetchMovieDetails(movie.imdbID);
          });
          container.appendChild(movieItem);
      }
  });
  if (container.innerHTML.trim() === '') {
      container.innerHTML = `<p class="error-message">No movies found.</p>`;
  }
}
async function fetchMovieDetails(imdbID) {
    try {
        const response = await fetch(`${API_URL}?i=${imdbID}&apikey=${API_KEY}&plot=full`);
        const movieDetails = await response.json();

        if (movieDetails.Response === 'True') {
            displayMovieDetails(movieDetails);
        } else {
            console.error(movieDetails.Error);
            movieDetailsSection.innerHTML = `<p class="error-message">${movieDetails.Error}</p>`;
            movieDetailsSection.style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching movie details:', error);
        movieDetailsSection.innerHTML = `<p class="error-message">Failed to load movie details.</p>`;
        movieDetailsSection.style.display = 'block';
    }
}
function displayMovieDetails(movie) {
    movieDetailsSection.innerHTML = `
        <div class="movie-details-container">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'placeholder.jpg'}" alt="${movie.Title} Poster" />
            <div class="movie-info">
                <h2>${movie.Title} (${movie.Year})</h2>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Actors:</strong> ${movie.Actors}</p>
                <p><strong>Plot:</strong> ${movie.Plot}</p>
                <p><strong>IMDB Rating:</strong> ${movie.imdbRating}</p>
            </div>
        </div>
    `;
    homepageSection.style.display = 'none';
    searchResultsSection.style.display = 'none';
    movieDetailsSection.style.display = 'flex';
    backToHomeButton.style.display = 'inline-block';
}
const fetchMovies = async (page = 1) => {
    const response = await fetch(`${TMDB_API_URL}?api_key=${TMDB_API_KEY}&page=${page}`);
    const data = await response.json();
    return data.results;
}
const loadMorePopular = async () => {
    const movies = await fetchMovies(popularPage);
    renderMovies(movies);
    popularPage++;  
}
const renderMovies = (movies) => {
  const homepageMovieGrid = document.getElementById('homepage-movie-grid');
  homepageMovieGrid.innerHTML = ''; 
  movies.forEach(movie => {
      if (movie.poster_path) {  
          const movieItem = document.createElement('div');
          movieItem.classList.add('movie-item');
          movieItem.innerHTML = `
              <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} Poster" />
              <div class="movie-details">
                  <h2>${movie.title}</h2>
                  <p>Release Date: ${movie.release_date}</p>
              </div>
          `;
          movieItem.addEventListener('click', () => {
              fetchMovieDetails(movie.id);  
          });

          homepageMovieGrid.appendChild(movieItem);
      }
  });
  if (homepageMovieGrid.innerHTML.trim() === '') {
      homepageMovieGrid.innerHTML = `<p class="error-message">No movies found.</p>`;
  }
}
loadMorePopular().then((movies) => {
  renderMovies(movies);
});
