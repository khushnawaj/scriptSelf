export const addToRecent = (note) => {
    if (!note || !note._id) return;

    try {
        const STORAGE_KEY = 'recent_vault_items';
        const MAX_ITEMS = 6;

        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

        const newItem = {
            id: note._id,
            title: note.title,
            category: note.category?.name || 'GENERIC',
            type: 'note',
            timestamp: new Date().getTime()
        };

        // Remove existing instance of this item to move it to top
        const filtered = existing.filter(item => item.id !== note._id);

        const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Dispatch custom event for cross-component sync
        window.dispatchEvent(new Event('recent_items_updated'));
    } catch (err) {
        console.error('[RecentTracker] Failed to update recent items:', err);
    }
};

export const getRecentItems = () => {
    try {
        return JSON.parse(localStorage.getItem('recent_vault_items') || '[]');
    } catch (err) {
        return [];
    }
};
