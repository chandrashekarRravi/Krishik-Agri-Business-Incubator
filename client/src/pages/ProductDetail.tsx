import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { ProductCard } from "@/components/ProductCard";
import {
    ShoppingCart,
    Heart,
    Share2,
    Star,
    Truck,
    Shield,
    Phone,
    Mail,
    ArrowLeft,
    CheckCircle,
    Info
} from "lucide-react";

interface ApiProduct {
    _id: string;
    name: string;
    description: string;
    category: string;
    startup: string;
    quantity: string;
    price: string;
    contact: {
        name: string;
        phone: string;
        email: string;
    };
    image: string[];
    reviews: any[];
    focusAreas?: Array<{
        id: string;
        icon: string;
        title: string;
    }>;
    primaryFocusArea?: {
        id: string;
        icon: string;
        title: string;
    };
}

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<ApiProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [suggestedProducts, setSuggestedProducts] = useState<ApiProduct[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const API = import.meta.env.VITE_API_URL || 'https://krishik-agri-business-hub-backend.onrender.com/api';
                const response = await fetch(`${API}/products/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                    // Fetch suggested products after main product is loaded
                    fetchSuggestedProducts(data.category, data._id);
                } else {
                    navigate('/products');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id, navigate]);

    const fetchSuggestedProducts = async (category: string, currentProductId: string) => {
        setLoadingSuggestions(true);
        try {
            const API = import.meta.env.VITE_API_URL || 'https://krishik-agri-business-hub-backend.onrender.com/api';
            const response = await fetch(`${API}/products`);
            if (response.ok) {
                const data = await response.json();
                const allProducts = data.products || data; // Handle both response formats

                // Filter products by same category, exclude current product, and get random 4
                const relatedProducts = allProducts
                    .filter((p: ApiProduct) => p.category === category && p._id !== currentProductId)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 4);

                // If not enough related products, fill with random products
                if (relatedProducts.length < 4) {
                    const randomProducts = allProducts
                        .filter((p: ApiProduct) => p._id !== currentProductId)
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 4 - relatedProducts.length);
                    const finalProducts = [...relatedProducts, ...randomProducts];
                    setSuggestedProducts(finalProducts);
                } else {
                    setSuggestedProducts(relatedProducts);
                }
            }
        } catch (error) {
            console.error('Error fetching suggested products:', error);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto py-16 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-green mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading product...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="max-w-7xl mx-auto py-16 text-center">
                    <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                    <Button onClick={() => navigate('/products')}>Go Back to Products</Button>
                </div>
            </div>
        );
    }

    const images = Array.isArray(product.image) ? product.image : [product.image];
    const priceNumber = Number(product.price.replace(/[^\d.]/g, ''));
    const originalPrice = priceNumber * 1.5; // Simulate original price
    const discount = Math.round(((originalPrice - priceNumber) / originalPrice) * 100);

    return (
        <div className="min-h-screen bg-gray-50">


            {/* Breadcrumb 
            
            
             <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <Link to="/" className="hover:text-agri-green">Home</Link>
                        <span>/</span>
                        <Link to="/products" className="hover:text-agri-green">Products</Link>
                        <span>/</span>
                        <span className="text-gray-900">{product.category}</span>
                        <span>/</span>
                        <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
                    </nav>
                </div>
            </div>
            
            */}


            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Section - Product Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="bg-white rounded-lg p-8 border">
                            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                                <img
                                    src={images[selectedImageIndex]}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>

                        {/* Thumbnail Images */}
                        {images.length > 1 && (
                            <div className="flex space-x-2 overflow-x-auto">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${selectedImageIndex === index ? 'border-agri-green' : 'border-gray-200'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-contain"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <Button
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold"
                                onClick={() => navigate(`/buy?productId=${product._id}`)}
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                BUY NOW
                            </Button>

                            {/* Contact Buttons */}
                            <div className="flex space-x-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-green-500 text-green-500 hover:bg-green-50 py-3 font-semibold"
                                    onClick={() => window.open(`tel:${product.contact.phone}`)}
                                >
                                    <Phone className="w-5 h-5 mr-2" />
                                    CALL NOW
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 py-3 font-semibold"
                                    onClick={() => window.open(`mailto:${product.contact.email}`)}
                                >
                                    <Mail className="w-5 h-5 mr-2" />
                                    EMAIL
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Product Details */}
                    <div className="space-y-6">

                        {/* Product Title */}
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 leading-tight mb-2">
                                {product.name}
                            </h1>

                            {/* Rating
                            
                             <div className="flex items-center space-x-2 mb-4">
                                <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">4.2</span>
                                <span className="text-sm text-gray-500">(127 Reviews)</span>
                            </div>
                            
                            */}


                            {/* Price */}
                            <div className="mb-4">
                                <div className="flex items-center space-x-3">
                                    <span className="text-3xl font-bold text-gray-900">₹{priceNumber.toLocaleString()}</span>
                                    <span className="text-lg text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
                                    <Badge className="bg-green-100 text-green-800">{discount}% off</Badge>
                                </div>
                            </div>

                            {/* Category Badge */}
                            {product.primaryFocusArea && (
                                <div className="mb-4">
                                    <Badge className="bg-agri-green-light text-agri-green">
                                        <span className="mr-1">{product.primaryFocusArea.icon}</span>
                                        {product.primaryFocusArea.title}
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* Available Offers
                        
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-green-800 mb-3">Available Offers</h3>
                                <div className="space-y-2">
                                    <div className="flex items-start space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-green-700">
                                            Bank Offer 10% Off on UPI payments. Max discount ₹100. T&C apply
                                        </span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-green-700">
                                            Free delivery on orders above ₹500
                                        </span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-green-700">
                                            Special discount for farmers - 5% additional off
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        
                        */}

                        {/* Warranty
                        
                         <Card>
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Warranty</h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            1 Year manufacturer warranty. For assistance contact: {product.contact.phone}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        
                        */}


                        {/* Delivery
                        
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                    <Truck className="w-5 h-5 text-green-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Delivery</h4>
                                        <div className="mt-2">
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter Delivery Pincode"
                                                    className="flex-1 border rounded px-3 py-2 text-sm"
                                                />
                                                <Button size="sm" className="bg-agri-green hover:bg-agri-green/90">
                                                    Check
                                                </Button>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2">
                                                Delivery by Tomorrow if ordered before 6 PM
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        */}


                        {/* Product Details */}
                        <Card>
                            <CardContent className="p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Product Details</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Quantity Available:</span>
                                        <span className="font-medium">{product.quantity}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Category:</span>
                                        <span className="font-medium">{product.category}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Startup:</span>
                                        <span className="font-medium">{product.startup}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardContent className="p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm">{product.contact.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm">{product.contact.email}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Contact Person: {product.contact.name}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description */}
                        <Card>
                            <CardContent className="p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* More Suggestions Section */}
                <div className="mt-16">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">More Suggestions</h2>
                        <p className="text-gray-600">Discover more products you might like</p>
                    </div>

                    {loadingSuggestions ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agri-green"></div>
                        </div>
                    ) : suggestedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {suggestedProducts.map((suggestedProduct) => (
                                <div key={suggestedProduct._id} onClick={() => navigate(`/product/${suggestedProduct._id}`)}>
                                    <ProductCard
                                        product={{
                                            id: suggestedProduct._id,
                                            name: suggestedProduct.name,
                                            description: suggestedProduct.description,
                                            category: suggestedProduct.category,
                                            startup: suggestedProduct.startup,
                                            quantity: suggestedProduct.quantity,
                                            price: suggestedProduct.price,
                                            contact: suggestedProduct.contact,
                                            image: Array.isArray(suggestedProduct.image) ? suggestedProduct.image[0] : suggestedProduct.image,
                                            primaryFocusArea: suggestedProduct.primaryFocusArea
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No suggestions available at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
