import { Helmet } from "react-helmet-async";
import React from "react";

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
    title = "Krishik Agri Business Incubator - Empowering Agricultural Innovation",
    description = "Discover innovative agricultural products and startups from Krishik Agri Business Incubator, University of Agricultural Sciences, Dharwad. Sustainable farming solutions for the future.",
    keywords = "agriculture, farming, innovation, startups, sustainable farming, agricultural technology, Krishik, Dharwad",
    image = "/krishik-banner.jpg",
    url = "",
    type = "website"
}) => {
    const fullUrl = url ? `${window.location.origin}${url}` : window.location.href;

    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content="Krishik Agri Business Hub" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@krishik_agri" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Additional SEO */}
            <meta name="robots" content="index, follow" />
            <meta name="author" content="Krishik Agri Business Hub" />
            <link rel="canonical" href={fullUrl} />
        </Helmet>
    );
}; 