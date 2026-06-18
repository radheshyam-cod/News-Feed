// State object to manage application data
export const state = {
    query: '',
    category: getSavedCategory(),
    articles: [],
    isLoading: false,
    error: null
};

/**
 * Retrieves the saved category from localStorage, or defaults to 'general'.
 * @returns {string}
 */
function getSavedCategory() {
    try {
        return localStorage.getItem('newsCategory') || 'general';
    } catch (e) {
        console.warn('localStorage is not accessible', e);
        return 'general';
    }
}

/**
 * Saves the current category to localStorage.
 * @param {string} category 
 */
export function saveCategory(category) {
    try {
        localStorage.setItem('newsCategory', category);
    } catch (e) {
        console.warn('Failed to save category to localStorage', e);
    }
}

/**
 * Updates a specific key in the state.
 * @param {string} key 
 * @param {any} value 
 */
export function updateState(key, value) {
    if (Object.prototype.hasOwnProperty.call(state, key)) {
        state[key] = value;
    }
}