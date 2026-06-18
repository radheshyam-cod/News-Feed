import { state, updateState, saveCategory } from './state.js';
import { fetchNews } from './api.js';
import { renderArticles, showLoading, hideLoading, showError, hideMessage } from './render.js';
import { debounce } from './utils.js';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const yearSpan = document.getElementById('year');

/**
 * Main application initialization.
 */
function init() {
    // Set current year in footer
    yearSpan.textContent = new Date().getFullYear();

    // Initialize UI with saved state
    categorySelect.value = state.category;

    // Attach Event Listeners
    setupEventListeners();

    // Initial Fetch
    loadNews();
}

/**
 * Sets up all event listeners for the application.
 */
function setupEventListeners() {
    // Search Input with Debounce (500ms) to prevent excessive API calls
    const handleSearch = debounce((e) => {
        const query = e.target.value.trim();
        if (state.query !== query) {
            updateState('query', query);
            
            // If there's a search query, category is often ignored by the API (/everything), 
            // but we still fetch news based on the new query.
            loadNews();
        }
    }, 500);

    searchInput.addEventListener('input', handleSearch);

    // Category Select Dropdown
    categorySelect.addEventListener('change', (e) => {
        const category = e.target.value;
        updateState('category', category);
        saveCategory(category);
        
        // Clear search input if changing category, to make API behavior predictable
        if (state.query) {
            searchInput.value = '';
            updateState('query', '');
        }

        loadNews();
    });
}

/**
 * Orchestrates the fetching and rendering of news based on current state.
 */
async function loadNews() {
    if (state.isLoading) return; // Prevent overlapping requests

    updateState('isLoading', true);
    showLoading();

    try {
        const articles = await fetchNews(state.query, state.category);
        updateState('articles', articles);
        renderArticles(articles);
    } catch (error) {
        console.error('Failed to load news:', error);
        updateState('error', error.message);
        showError(error.message);
    } finally {
        updateState('isLoading', false);
        hideLoading();
    }
}

// Boot the app when DOM is fully parsed
document.addEventListener('DOMContentLoaded', init);