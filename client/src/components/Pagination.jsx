import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/50 disabled:opacity-30 disabled:hover:text-muted-foreground disabled:hover:border-border transition-all"
            >
                <ChevronLeft size={18} />
            </button>

            {start > 1 && (
                <>
                    <button
                        onClick={() => onPageChange(1)}
                        className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all ${currentPage === 1
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary'
                            }`}
                    >
                        1
                    </button>
                    {start > 2 && <span className="text-muted-foreground px-1">...</span>}
                </>
            )}

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all ${currentPage === page
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary'
                        }`}
                >
                    {page}
                </button>
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className="text-muted-foreground px-1">...</span>}
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className={`w-10 h-10 rounded-lg border text-sm font-bold transition-all ${currentPage === totalPages
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary'
                            }`}
                    >
                        {totalPages}
                    </button>
                </>
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/50 disabled:opacity-30 disabled:hover:text-muted-foreground disabled:hover:border-border transition-all"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default Pagination;
