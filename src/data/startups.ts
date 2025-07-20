export interface Startup {
    id: number;
    name: string;
    focusArea: string;
    description: string;
    contact: {
        name: string;
        phone: string;
        email: string;
    };
    productCount: number;
    featured: boolean;
}

export const startupData: Startup[] = [
    {
        id: 1,
        name: "Agrider Biotech LLP",
        focusArea: "Post Harvest and Food Technology",
        description: "Innovative millet-based beverage solutions promoting health and sustainable agriculture through locally sourced ingredients.",
        contact: {
            name: "Ravishankar S Nilegar",
            phone: "9036408947",
            email: "agriderbiotech@gmail.com"
        },
        productCount: 2,
        featured: true
    },
    {
        id: 2,
        name: "Nutrica Supplements LLP",
        focusArea: "Agricultural Biotechnology",
        description: "Specialized agri-health supplements and nutritional products for enhanced agricultural productivity and farmer wellness.",
        contact: {
            name: "Sunil Jalwadi",
            phone: "08043856592",
            email: "nutricasupplements@gmail.com"
        },
        productCount: 5,
        featured: false
    },
    {
        id: 3,
        name: "Shree Aarogya Food & Beverages Products",
        focusArea: "Organic Farming",
        description: "Premium millet products including finger millets, foxtail millets, and other health-focused agricultural products.",
        contact: {
            name: "Raghu R S",
            phone: "9535282617",
            email: "raghursraghurs36@gmail.com"
        },
        productCount: 4,
        featured: true
    },
    {
        id: 4,
        name: "Sri Om Sai Sugar Allied Production Pvt. Ltd. (SOSSA)",
        focusArea: "Post Harvest and Food Technology",
        description: "Sugarcane processing and value-added products including fresh sugarcane juice and liquid jaggery solutions.",
        contact: {
            name: "Rajgopal I Patil",
            phone: "9740271821",
            email: "sairaju.patil500002@gmail.com"
        },
        productCount: 2,
        featured: false
    }
];

export const focusAreaFilters = [
    "All",
    "Post Harvest and Food Technology",
    "Agricultural Biotechnology",
    "Organic Farming"
]; 