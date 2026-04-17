// State management
let currentUser = null;
let currentPage = 'auth';

// API — même origine que la page (fonctionne quel que soit le port)
const API_BASE_URL = '/api';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let searchResultsCache = [];
let favoritesResultsCache = [];

// DOM Elements
const authPage = document.getElementById('authPage');
const searchPage = document.getElementById('searchPage');
const favoritesPage = document.getElementById('favoritesPage');
const navLinks = document.getElementById('navLinks');
const navToggle = document.getElementById('navToggle');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const favoritesList = document.getElementById('favoritesList');
const movieModal = document.getElementById('movieModal');
const modalPoster = document.getElementById('modalPoster');
const modalTitle = document.getElementById('modalTitle');
const modalYear = document.getElementById('modalYear');
const modalDescription = document.getElementById('modalDescription');
const movieRating = document.getElementById('movieRating');
const movieNotes = document.getElementById('movieNotes');
const saveToFavorites = document.getElementById('saveToFavorites');

function apiErrorMessage(data) {
    if (data && data.message) return data.message;
    if (data && Array.isArray(data.errors)) {
        return data.errors.map((e) => e.msg || e.message || String(e)).join(' ');
    }
    return 'Request failed';
}

function authHeaders(jsonBody) {
    const token = localStorage.getItem('token');
    const h = {};
    if (token) h.Authorization = `Bearer ${token}`;
    if (jsonBody) h['Content-Type'] = 'application/json';
    return h;
}

// Authentication functions
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            currentUser = data;
            localStorage.setItem('token', data.token);
            showPage('search');
        } else {
            alert(apiErrorMessage(data));
        }
    } catch (error) {
        alert('Error during login');
    }
}

async function register(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            currentUser = data;
            localStorage.setItem('token', data.token);
            showPage('search');
        } else {
            alert(apiErrorMessage(data));
        }
    } catch (error) {
        alert('Error during registration');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('token');
    showPage('auth');
}

// Movie functions
async function searchMovies(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/search?query=${encodeURIComponent(query)}`, {
            headers: authHeaders()
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(apiErrorMessage(data));
            return;
        }
        displaySearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
        alert('Error searching movies');
    }
}

async function getFavorites() {
    try {
        const response = await fetch(`${API_BASE_URL}/movies`, {
            headers: authHeaders()
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(apiErrorMessage(data));
            return;
        }
        displayFavorites(Array.isArray(data) ? data : []);
    } catch (error) {
        alert('Error fetching favorites');
    }
}

async function addToFavorites(movieData) {
    const tmdbId = movieData.tmdbId != null ? Number(movieData.tmdbId) : NaN;
    const payload = {
        tmdbId: Number.isFinite(tmdbId) ? tmdbId : null,
        personalNote: movieData.personalNote || '',
        rating: movieData.rating != null ? Number(movieData.rating) : 0
    };
    if (payload.tmdbId == null || payload.tmdbId < 1) {
        alert('Identifiant TMDB invalide. Rouvrez le film depuis la recherche.');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/movies`, {
            method: 'POST',
            headers: authHeaders(true),
            body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
            alert('Movie added to favorites!');
            closeModal();
            if (currentPage === 'favorites') getFavorites();
        } else {
            alert(apiErrorMessage(data));
        }
    } catch (error) {
        alert('Error adding to favorites');
    }
}

async function updateFavorite(movieId, updates) {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
            method: 'PUT',
            headers: authHeaders(true),
            body: JSON.stringify(updates)
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
            alert('Movie updated successfully!');
            closeModal();
            getFavorites();
        } else {
            alert(apiErrorMessage(data));
        }
    } catch (error) {
        alert('Error updating movie');
    }
}

async function removeFavorite(movieId) {
    if (!confirm('Are you sure you want to remove this movie from favorites?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok) {
            getFavorites();
        } else {
            alert(apiErrorMessage(data));
        }
    } catch (error) {
        alert('Error removing from favorites');
    }
}

// UI functions
async function getPopularMovies() {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/search?query=popular`, {
            headers: authHeaders()
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(apiErrorMessage(data));
            return;
        }
        displaySearchResults(Array.isArray(data) ? data : []);
    } catch (error) {
        alert('Error fetching popular movies');
    }
}

function showPage(pageName) {
    currentPage = pageName;
    [authPage, searchPage, favoritesPage].forEach(page => {
        page.classList.add('hidden');
    });
    closeMobileNav();

    if (pageName === 'auth') {
        authPage.classList.remove('hidden');
        navLinks.classList.add('hidden');
        navToggle.classList.add('hidden');
    } else {
        document.getElementById(`${pageName}Page`).classList.remove('hidden');
        navLinks.classList.remove('hidden');
        navToggle.classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageName);
        });

        if (pageName === 'favorites') {
            getFavorites();
        } else if (pageName === 'search') {
            getPopularMovies();
        }
    }
}

function setMobileNavOpen(isOpen) {
    navLinks.classList.toggle('nav-links-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
}

function closeMobileNav() {
    setMobileNavOpen(false);
}

function showAuthForm(formName) {
    const forms = {
        login: loginForm,
        register: registerForm
    };
    Object.values(forms).forEach(form => form.classList.add('hidden'));
    forms[formName].classList.remove('hidden');
    
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.form === formName);
    });
}

function displaySearchResults(movies) {
    searchResultsCache = movies;
    searchResults.innerHTML = movies.map((movie, index) => {
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '—';
        const safeTitle = String(movie.title || '').replace(/</g, '&lt;');
        return `
        <div class="movie-card" data-movie-index="${index}" role="button" tabindex="0">
            <img src="${movie.poster_path ? TMDB_IMAGE_BASE_URL + movie.poster_path : '/placeholder.jpg'}" alt="${safeTitle}">
            <div class="movie-card-info">
                <h3 class="movie-card-title">${safeTitle}</h3>
                <p class="movie-card-year">${year}</p>
            </div>
        </div>`;
    }).join('');
}

function displayFavorites(favorites) {
    favoritesResultsCache = favorites;
    favoritesList.innerHTML = favorites.map((movie, index) => {
        const safeTitle = String(movie.title || '').replace(/</g, '&lt;');
        const id = String(movie._id || '');
        return `
        <div class="movie-card" data-fav-index="${index}">
            <div class="movie-card-body">
                <img src="${movie.posterPath ? TMDB_IMAGE_BASE_URL + movie.posterPath : '/placeholder.jpg'}" alt="${safeTitle}">
                <div class="movie-card-info">
                    <h3 class="movie-card-title">${safeTitle}</h3>
                    <p class="movie-card-year">${movie.releaseYear ?? '—'}</p>
                    <p>Rating: ${movie.rating || 'Not rated'}</p>
                    <p>Notes: ${movie.personalNote || 'No notes'}</p>
                </div>
            </div>
            <button type="button" class="delete-btn" data-movie-id="${id}">Delete</button>
        </div>`;
    }).join('');
}

function showMovieDetails(movie, isFavorite = false) {
    modalPoster.src = movie.poster_path ?
        TMDB_IMAGE_BASE_URL + movie.poster_path :
        (movie.posterPath ? TMDB_IMAGE_BASE_URL + movie.posterPath : '/placeholder.jpg');
    modalTitle.textContent = movie.title;
    const y = movie.releaseYear != null ? movie.releaseYear : (movie.release_date ? new Date(movie.release_date).getFullYear() : '—');
    modalYear.textContent = y;
    modalDescription.textContent = movie.description || movie.overview || '';
    movieRating.value = String(movie.rating != null && movie.rating !== '' ? movie.rating : '5');
    movieNotes.value = movie.personalNote || '';

    saveToFavorites.onclick = () => {
        const rawId = movie.tmdbId != null ? movie.tmdbId : movie.id;
        const movieData = {
            tmdbId: rawId != null ? Number(rawId) : NaN,
            title: movie.title,
            posterPath: movie.poster_path || movie.posterPath,
            description: movie.overview || movie.description,
            releaseYear: movie.releaseYear != null ? movie.releaseYear : (movie.release_date ? new Date(movie.release_date).getFullYear() : null),
            rating: parseInt(movieRating.value, 10),
            personalNote: movieNotes.value
        };
        
        if (isFavorite) {
            updateFavorite(movie._id, { rating: movieData.rating, personalNote: movieData.personalNote });
        } else {
            addToFavorites(movieData);
        }
    };
    
    movieModal.classList.remove('hidden');
}

function closeModal() {
    movieModal.classList.add('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
        currentUser = { token };
        showPage('search');
    } else {
        showPage('auth');
    }

    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => showAuthForm(tab.dataset.form));
    });

    // Auth forms
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const [email, password] = [e.target[0].value, e.target[1].value];
        login(email, password);
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const [email, password, confirmPassword] = [e.target[0].value, e.target[1].value, e.target[2].value];
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        register(email, password);
    });

    // Navigation
    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.contains('nav-links-open');
        setMobileNavOpen(!isOpen);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.id === 'logoutBtn') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                closeMobileNav();
                logout();
            });
        } else {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                closeMobileNav();
                showPage(link.dataset.page);
            });
        }
    });

    // Search
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) searchMovies(query);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) searchMovies(query);
        }
    });

    // Modal
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === movieModal) closeModal();
    });

    // Cartes films — évite onclick + JSON.stringify (cassait les titres avec guillemets / id TMDB)
    searchResults.addEventListener('click', (e) => {
        const card = e.target.closest('.movie-card');
        if (!card || card.dataset.movieIndex === undefined) return;
        const movie = searchResultsCache[parseInt(card.dataset.movieIndex, 10)];
        if (movie) showMovieDetails(movie, false);
    });
    searchResults.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('.movie-card');
        if (!card || card.dataset.movieIndex === undefined) return;
        e.preventDefault();
        const movie = searchResultsCache[parseInt(card.dataset.movieIndex, 10)];
        if (movie) showMovieDetails(movie, false);
    });

    favoritesList.addEventListener('click', (e) => {
        const del = e.target.closest('.delete-btn');
        if (del && del.dataset.movieId) {
            e.stopPropagation();
            removeFavorite(del.dataset.movieId);
            return;
        }
        const card = e.target.closest('.movie-card');
        if (!card || card.dataset.favIndex === undefined) return;
        const movie = favoritesResultsCache[parseInt(card.dataset.favIndex, 10)];
        if (movie) showMovieDetails(movie, true);
    });
});