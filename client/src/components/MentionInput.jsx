import { useState, useRef, useEffect } from 'react';
import { AtSign } from 'lucide-react';
import { searchUsersForMention } from '../utils/mentions';

const MentionInput = ({ value, onChange, placeholder, className }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mentionQuery, setMentionQuery] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef(null);

    // Detect @ symbol and extract query
    const handleInput = (e) => {
        const text = e.target.value;
        const cursorPos = e.target.selectionStart;

        onChange(text);
        setCursorPosition(cursorPos);

        // Find @ symbol before cursor
        const textBeforeCursor = text.slice(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const queryAfterAt = textBeforeCursor.slice(lastAtIndex + 1);

            // Check if we're still in a mention (no spaces after @)
            if (!/\s/.test(queryAfterAt)) {
                setMentionQuery(queryAfterAt);
                setShowSuggestions(true);
                fetchSuggestions(queryAfterAt);
            } else {
                setShowSuggestions(false);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    const fetchSuggestions = async (query) => {
        const token = localStorage.getItem('token');
        const users = await searchUsersForMention(query, token);
        setSuggestions(users);
        setSelectedIndex(0);
    };

    const insertMention = (username) => {
        const text = value || '';
        const textBeforeCursor = text.slice(0, cursorPosition);
        const textAfterCursor = text.slice(cursorPosition);

        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        const newText =
            text.slice(0, lastAtIndex) +
            `@${username} ` +
            textAfterCursor;

        onChange(newText);
        setShowSuggestions(false);

        // Focus back on textarea
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = lastAtIndex + username.length + 2;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' || e.key === 'Tab') {
            if (showSuggestions) {
                e.preventDefault();
                insertMention(suggestions[selectedIndex].username);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={className}
                rows={8}
            />

            {/* Mention Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-card border border-border rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto">
                    <div className="p-2 border-b border-border bg-muted/30">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <AtSign size={10} />
                            Mention User
                        </p>
                    </div>
                    {suggestions.map((user, i) => (
                        <button
                            key={user._id}
                            onClick={() => insertMention(user.username)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors ${i === selectedIndex ? 'bg-accent' : ''
                                }`}
                        >
                            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col items-start flex-1 min-w-0">
                                <span className="font-medium text-foreground truncate w-full">{user.username}</span>
                                {user.reputation !== undefined && (
                                    <span className="text-[10px] text-muted-foreground">
                                        {user.reputation} XP
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Helper Text */}
            <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                <AtSign size={10} />
                Type @ to mention users
            </p>
        </div>
    );
};

export default MentionInput;
