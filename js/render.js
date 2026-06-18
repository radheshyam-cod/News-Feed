import { formatDate } from './utils.js';

// DOM Elements
const newsGrid = document.getElementById('newsGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const messageContainer = document.getElementById('messageContainer');

// Base64 encoded fallback SVG image to ensure offline/network-resilient loading
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMWUyOTNiO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzBmMTcyYTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTcwLCA3NSkiIHN0cm9rZT0iIzQ3NTU2OSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI0OCIgcng9IjQiLz48Y2lyY2xlIGN4PSIxOCIgY3k9IjE2IiByPSI0Ii8+PHBhdGggZD0iTTQgNDAgbDE4LTE4IDE2IDE2IDgtOCAxMCAxMCIvPjwvZz48dGV4dCB4PSI1MCUiIHk9IjE2MCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgLWFwcGxlLXN5c3RlbSwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0YTNiOCIgbGV0dGVyLXNwYWNpbmc9IjEiPk5FV1MgRkVFRDwvdGV4dD48L3N2Zz4=';

/**
 * Renders an array of articles to the DOM using a DocumentFragment
 * to minimize DOM reflows and maximize performance.
 * 
 * @param {Array} articles - Array of article objects.
 */
export function renderArticles(articles) {
    // Clear current grid
    newsGrid.innerHTML = '';
    
    if (!articles || articles.length === 0) {
        showInfo('No articles found. Try adjusting your search or category.');
        return;
    }

    // Use a DocumentFragment to build the DOM in memory
    const fragment = document.createDocumentFragment();

    articles.forEach(article => {
        // Create article container
        const card = document.createElement('article');
        card.className = 'news-card';

        // Use a placeholder if no image is provided
        const imageUrl = article.urlToImage || DEFAULT_PLACEHOLDER;
        const sourceName = article.source?.name || 'Unknown Source';
        const publishedDate = formatDate(article.publishedAt);
        const description = article.description || 'No description available for this article.';

        // Build inner HTML (Using template literals is efficient here since we have full control over the inputs, 
        // though in production we should sanitize HTML to prevent XSS if the API isn't fully trusted)
        card.innerHTML = `
            <img class="news-card-img" alt="${article.title}" loading="lazy">
            <div class="news-card-content">
                <h2 class="news-card-title">
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                        ${article.title}
                    </a>
                </h2>
                <p class="news-card-desc">${description}</p>
                <div class="news-card-meta">
                    <span class="source">${sourceName}</span>
                    <span class="date">${publishedDate}</span>
                </div>
            </div>
        `;

        const img = card.querySelector('.news-card-img');
        
        // Set up robust error listener to bypass hotlinking restrictions (CORS/406) via the proxy
        img.addEventListener('error', function handleErr() {
            img.removeEventListener('error', handleErr);
            if (article.urlToImage && !article.urlToImage.startsWith('data:') && !img.src.startsWith('https://corsproxy.io/?')) {
                img.src = `https://corsproxy.io/?${encodeURIComponent(article.urlToImage)}`;
                img.addEventListener('error', () => {
                    img.src = DEFAULT_PLACEHOLDER;
                }, { once: true });
            } else {
                img.src = DEFAULT_PLACEHOLDER;
            }
        });

        // Set the src after binding the error listener to guarantee the event is caught
        img.src = imageUrl;

        fragment.appendChild(card);
    });

    // Append everything to the DOM at once (single reflow)
    newsGrid.appendChild(fragment);
}

/**
 * Shows the loading spinner and hides the news grid/messages.
 */
export function showLoading() {
    newsGrid.innerHTML = ''; // Clear grid to show we're fetching new content
    hideMessage();
    loadingSpinner.classList.remove('hidden');
}

/**
 * Hides the loading spinner.
 */
export function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

/**
 * Displays an error message to the user.
 * 
 * @param {string} message - The error message.
 */
export function showError(message) {
    messageContainer.className = 'message-container message-error';
    messageContainer.textContent = message;
    messageContainer.classList.remove('hidden');
}

/**
 * Displays an info message to the user.
 * 
 * @param {string} message - The info message.
 */
export function showInfo(message) {
    messageContainer.className = 'message-container message-info';
    messageContainer.textContent = message;
    messageContainer.classList.remove('hidden');
}

/**
 * Hides the message container.
 */
export function hideMessage() {
    messageContainer.classList.add('hidden');
    messageContainer.textContent = '';
}