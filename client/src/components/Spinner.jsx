import React from 'react';
import { Loader2 } from 'lucide-react';

const Spinner = ({ fullPage = false, size = "md", message = "Loading..." }) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
        xl: "h-16 w-16"
    };

    const containerClasses = fullPage
        ? "fixed inset-0 z-[999] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center"
        : "flex flex-col items-center justify-center p-8 w-full h-full";

    return (
        <div className={containerClasses}>
            <div className="relative">
                {/* Decorative outer ring */}
                <div className={`absolute inset-0 rounded-full border-2 border-primary/20 scale-150 animate-pulse`}></div>

                {/* Main Spinner */}
                <Loader2
                    className={`${sizeClasses[size] || sizeClasses.md} text-primary animate-spin`}
                />
            </div>

            {message && (
                <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse tracking-wide uppercase">
                    {message}
                </p>
            )}
        </div>
    );
};

export default Spinner;
