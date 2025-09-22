// Product related types
export interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    startup: string;
    quantity: string;
    price: string;
    contact: Contact;
    image: string;
    // Focus area information automatically assigned based on category
    focusAreas?: FocusAreaInfo[];
    primaryFocusArea?: FocusAreaInfo;
}

// Focus area information for products
export interface FocusAreaInfo {
    id: string;
    icon: string;
    title: string;
}

// Startup related types
export interface Startup {
    id: number;
    name: string;
    focusArea: string;
    description: string;
    contact: Contact;
    productCount: number;
    featured: boolean;
}

// Focus Area related types
export interface FocusArea {
    id: string;
    title: string;
    description: string;
    icon: string;
}

// Contact information
export interface Contact {
    name: string;
    phone: string;
    email: string;
}

// Order related types
export interface Order {
    product: Product;
    name: string;
    email: string;
    phone: string;
    quantity: string;
    address: string;
    paymentMethod?: string;
    paymentMethodKey?: string;
    paymentDetails?: PaymentDetails;
}

// Payment related types
export interface PaymentDetails {
    upiId?: string;
    cardNumber?: string;
    cardName?: string;
    cardExpiry?: string;
    cardCvv?: string;
    bank?: string;
    netbankingName?: string;
    netbankingRef?: string;
    netbankingUsername?: string;
    netbankingPassword?: string;
}

// Form related types
export interface ContactForm {
    name: string;
    email: string;
    message: string;
}

// Navigation types
export interface NavigationItem {
    name: string;
    href: string;
}

// Filter types
export interface FilterOption {
    value: string;
    label: string;
} 