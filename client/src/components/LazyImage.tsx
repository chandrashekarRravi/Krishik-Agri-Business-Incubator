import { useState, useEffect } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import React from "react";

interface LazyImageProps {
    src: string;
    alt: string;
    className?: string;
    placeholder?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
    src,
    alt,
    className = "",
    placeholder = "/placeholder.svg"
}) => {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setImageSrc(src);
            setLoading(false);
        };

        img.onerror = () => {
            setError(true);
            setLoading(false);
        };
    }, [src]);

    if (error) {
        return (
            <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
                <span className="text-gray-500 text-sm">Image not available</span>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <LoadingSpinner size="sm" />
                </div>
            )}
            <img
                src={imageSrc}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"
                    }`}
                loading="lazy"
            />
        </div>
    );
}; 