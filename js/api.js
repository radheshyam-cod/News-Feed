// NOTE: Get a free API key from https://newsapi.org/
// Hardcoding API keys in frontend code is generally unsafe, but done here for demonstration/simplicity.
const API_KEY = '8e07684aa4004904b06a4942a35da2b9'; 
const BASE_URL = 'https://newsapi.org/v2';

// CORS proxy: NewsAPI free tier blocks browser CORS requests from non-localhost domains.
// When deployed to GitHub Pages (or any custom domain), we route through this proxy.
// To disable (e.g. during local dev), set USE_CORS_PROXY = false.
const USE_CORS_PROXY = !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1');
const CORS_PROXY = 'https://corsproxy.io/?';

/**
 * Fetches news articles from NewsAPI based on query and category.
 * Handles rate limits, invalid keys, and network errors gracefully.
 * 
 * @param {string} query - The search query.
 * @param {string} category - The news category.
 * @returns {Promise<Array>} - Resolves to an array of article objects.
 */
export async function fetchNews(query, category) {
    // If a query is provided, we use the /everything endpoint (which doesn't support category natively)
    // If no query, we use the /top-headlines endpoint which supports category.
    // To handle both, we combine parameters creatively or switch endpoints.
    
    let url;
    if (query && query.trim() !== '') {
        // NewsAPI /everything requires 'q'. 'category' is not supported, 
        // so we just search everything with the query.
        const encodedQuery = encodeURIComponent(query);
        url = `${BASE_URL}/everything?q=${encodedQuery}&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;
    } else {
        // NewsAPI /top-headlines supports 'category'
        url = `${BASE_URL}/top-headlines?country=us&category=${category}&apiKey=${API_KEY}`;
    }

    // Wrap URL in CORS proxy when deployed (GitHub Pages, etc.)
    if (USE_CORS_PROXY) {
        url = CORS_PROXY + encodeURIComponent(url);
    }

    try {
        const response = await fetch(url);
        
        // Handle HTTP errors
        if (!response.ok) {
            let errorMsg = `HTTP Error: ${response.status}`;
            
            // Handle common NewsAPI specific errors
            if (response.status === 401) {
                errorMsg = 'Invalid API Key. Please update the API_KEY in js/api.js.';
            } else if (response.status === 429) {
                errorMsg = 'Rate limit exceeded. Please try again later.';
            } else if (response.status === 426) {
                // This should no longer happen with the CORS proxy, but keep as fallback
                errorMsg = 'CORS/Upgrade Required. The CORS proxy may be down. Try running locally via Live Server.';
            }

            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorMsg);
        }

        const data = await response.json();

        // Ensure we actually got articles back
        if (!data.articles) {
            throw new Error('Invalid response format from API.');
        }

        // Filter out "Removed" articles (NewsAPI sometimes returns empty/removed articles)
        const validArticles = data.articles.filter(article => 
            article.title && article.title !== '[Removed]' && article.url
        );

        return validArticles;

    } catch (error) {
        // If it's a TypeError, it's likely a network issue (e.g., offline or CORS failure)
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your internet connection or the CORS proxy may be down.');
        }
        
        // Re-throw the error to be handled by the caller
        throw error;
    }
}