/**
 * Extract @username mentions from text
 * @param {string} text - Content to scan for mentions  
 * @returns {string[]} Array of unique usernames mentioned
 */
export function extractMentions(text) {
    if (!text || typeof text !== 'string') return [];

    // Match @username pattern (alphanumeric + underscore)
    const regex = /@(\w+)/g;
    const matches = [...text.matchAll(regex)];
    const usernames = matches.map(m => m[1]);

    // Return unique usernames only
    return [...new Set(usernames)];
}

/**
 * Highlight @mentions in text for display
 * @param {string} text - Content with @mentions
 * @returns {string} HTML string with highlighted mentions
 */
export function highlightMentions(text) {
    if (!text) return text;

    return text.replace(
        /@(\w+)/g,
        '<span class="text-primary font-semibold cursor-pointer hover:underline" data-mention="$1">@$1</span>'
    );
}

/**
 * Get user suggestions for autocomplete
 * @param {string} query - Current search query
 * @param {string} token - Auth token
 * @returns {Promise<Array>} List of matching users
 */
export async function searchUsersForMention(query, token) {
    if (!query || query.length < 2) return [];

    try {
        const res = await fetch(`/api/v1/users/search?q=${encodeURIComponent(query)}&limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        return data.success ? data.data : [];
    } catch (err) {
        console.error('Failed to search users:', err);
        return [];
    }
}
