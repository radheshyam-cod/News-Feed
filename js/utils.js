/**
 * Debounce function to limit the rate at which a function is executed.
 * Useful for handling rapid input events (like search typing).
 * 
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} - The debounced function.
 */
export function debounce(func, delay = 500) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Formats an ISO date string into a user-friendly local date format.
 * 
 * @param {string} dateString - The ISO date string from the API.
 * @returns {string} - Formatted date (e.g., "Oct 12, 2023").
 */
export function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}