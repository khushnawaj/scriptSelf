import React from 'react';

const Spinner = ({ fullPage = false, message = "Loading" }) => {
    const containerClasses = fullPage
        ? "fixed inset-0 z-[999] bg-white dark:bg-[#1b1b1b] flex flex-col items-center justify-center overflow-hidden"
        : "flex flex-col items-center justify-center p-12 w-full h-full min-h-[200px]";

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                {message && (
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                        {message.toUpperCase()}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Spinner;
