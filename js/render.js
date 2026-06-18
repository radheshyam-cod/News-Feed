import { formatDate } from './utils.js';

// DOM Elements
const newsGrid = document.getElementById('newsGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const messageContainer = document.getElementById('messageContainer');

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
        const imageUrl = article.urlToImage || 'https://via.placeholder.com/400x200.png?text=No+Image+Available';
        const sourceName = article.source?.name || 'Unknown Source';
        const publishedDate = formatDate(article.publishedAt);
        const description = article.description || 'No description available for this article.';

        // Build inner HTML (Using template literals is efficient here since we have full control over the inputs, 
        // though in production we should sanitize HTML to prevent XSS if the API isn't fully trusted)
        card.innerHTML = `
            <img class="news-card-img" src="${imageUrl}" alt="${article.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x200.png?text=Image+Load+Error'">
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