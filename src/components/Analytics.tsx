import { useEffect } from "react";

interface AnalyticsProps {
    trackingId?: string;
}

// Define a type for gtag config
interface GtagConfig {
    page_title?: string;
    page_location?: string;
    event_category?: string;
    event_label?: string;
    value?: number;
    [key: string]: unknown;
}

export const Analytics: React.FC<AnalyticsProps> = ({
    trackingId = "G-XXXXXXXXXX" // Replace with actual Google Analytics ID
}) => {
    useEffect(() => {
        // Google Analytics 4 initialization
        if (typeof window !== "undefined" && window.gtag) {
            window.gtag("config", trackingId, {
                page_title: document.title,
                page_location: window.location.href,
            });
        }
    }, [trackingId]);

    // Track page views
    useEffect(() => {
        const handleRouteChange = () => {
            if (typeof window !== "undefined" && window.gtag) {
                window.gtag("config", trackingId, {
                    page_title: document.title,
                    page_location: window.location.href,
                });
            }
        };

        // Listen for route changes
        window.addEventListener("popstate", handleRouteChange);

        return () => {
            window.removeEventListener("popstate", handleRouteChange);
        };
    }, [trackingId]);

    return null;
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

// Track form submissions
export const trackFormSubmission = (formName: string) => {
    trackEvent("form_submit", "engagement", formName);
};

// Track button clicks
export const trackButtonClick = (buttonName: string) => {
    trackEvent("button_click", "engagement", buttonName);
};

// Track product views
export const trackProductView = (productName: string) => {
    trackEvent("product_view", "ecommerce", productName);
};

// Track startup views
export const trackStartupView = (startupName: string) => {
    trackEvent("startup_view", "engagement", startupName);
};

// Declare gtag for TypeScript
declare global {
    interface Window {
        gtag: (
            command: "config" | "event",
            targetId: string,
            config?: GtagConfig
        ) => void;
    }
} 