






import { useState, useEffect, useRef, type ElementType } from "react";
import { Navigation } from "@/components/Navigation";
import { ProductCard } from "@/components/ProductCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Leaf, Sprout, Droplets, Tractor, FlaskConical, Wifi, Package, Wheat, Apple, Shield, ThermometerSun, Bug } from "lucide-react";
import type { Product } from "@/types";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

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
  image: string;
  reviews: any[];
}

// Map common category names to lucide-react icons. Unknown categories fall back to Package.
const categoryIconMap: Record<string, ElementType> = {
  All: Package,
  Fertilizer: FlaskConical,
  Fertilizers: FlaskConical,
  Seeds: Sprout,
  Irrigation: Droplets,
  Machinery: Tractor,
  Equipment: Tractor,
  Biotech: FlaskConical,
  IoT: Wifi,
  Packaging: Package,
  Grains: Wheat,
  Fruits: Apple,
  Protection: Shield,
  Weather: ThermometerSun,
  Pest: Bug,
};

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStartup, setSelectedStartup] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [startups, setStartups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  // Flipkart-style filters show all in scrollable rows on mobile; no expand/collapse needed

  const location = useLocation();
  const hasSetStartupFromURL = useRef(false);

  useEffect(() => {
    if (hasSetStartupFromURL.current) return;
    const params = new URLSearchParams(location.search);
    const startupParam = params.get("startup");
    if (startupParam && startups.includes(startupParam)) {
      setSelectedStartup(startupParam);
      hasSetStartupFromURL.current = true;
    }
  }, [location.search, startups]);

  useEffect(() => {
    fetchProducts(page, pageSize);
    fetchCategoriesAndStartups();
  }, [page, pageSize]);

  useEffect(() => {
    // If a filter is applied, show more products per page
    if ((selectedStartup && selectedStartup !== "All") || (selectedCategory && selectedCategory !== "All") || searchTerm) {
      setPageSize(100);
    } else {
      setPageSize(20);
    }
    // Always reset to page 1 when filters change
    setPage(1);
  }, [selectedStartup, selectedCategory, searchTerm]);

  const fetchProducts = async (pageNum = 1, limit = pageSize) => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/products?page=${pageNum}&limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
        setPage(data.page || 1);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndStartups = async () => {
    try {
      const [categoriesRes, startupsRes] = await Promise.all([
        fetch(`${API}/products/categories`),
        fetch(`${API}/products/startups`)
      ]);
      if (categoriesRes.ok) {
        const cats = await categoriesRes.json();
        setCategories(['All', ...cats]);
      }
      if (startupsRes.ok) {
        const starts = await startupsRes.json();
        setStartups(['All', ...starts]);
      }
    } catch (error) {
      console.error('Failed to fetch categories/startups:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
    const startupMatch = selectedStartup === "All" || product.startup === selectedStartup;
    const searchMatch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && startupMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-agri-green mb-6">
            Agricultural Products
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover innovative agricultural products from our incubated startups,
            bringing sustainable solutions directly from farm to your table
          </p>
        </div>

        {/* Professional Filter Section */}
        <div className="mb-8 flex justify-center">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="border rounded px-4 py-2 w-full max-w-md"
          />
        </div>
        <div className="mb-12">
          <div className="bg-gradient-to-br from-agri-green-light/10 via-white to-agri-yellow-light/10 rounded-3xl p-4 sm:p-8 shadow-elegant border border-agri-green/10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-agri-green mb-2">Smart Product Filters</h3>
              <p className="text-muted-foreground">Discover products tailored to your interests</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Category Filter */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-agri-green rounded-full"></div>
                  <h4 className="font-semibold text-agri-green">Filter by Focus Areas</h4>
                </div>
                {/* Mobile: horizontal scroll row */}
                <div className="md:hidden -mx-1 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 px-1">
                    {categories.map((category) => {
                      const Icon = categoryIconMap[category] || Package;
                      const isSelected = selectedCategory === category;
                      return (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            if (category === "All") setPage(1);
                          }}
                          className={`min-w-[110px] rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                            isSelected
                              ? "bg-agri-green/15 border-agri-green text-agri-green shadow-md"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-agri-green/40"
                          }`}
                        >
                          <Icon className={`w-6 h-6 mb-2 ${isSelected ? "text-agri-green" : "text-gray-500"}`} />
                          <span className="text-sm font-medium truncate">
                            {category === "All" ? "All Focus Areas" : category}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Desktop: grid */}
                <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 w-full">
                  {categories.map((category) => {
                    const Icon = categoryIconMap[category] || Package;
                    const isSelected = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          if (category === "All") setPage(1);
                        }}
                        className={`rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                          isSelected
                            ? "bg-agri-green/15 border-agri-green text-agri-green shadow-md"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-agri-green/40"
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${isSelected ? "text-agri-green" : "text-gray-500"}`} />
                        <span className="text-sm font-medium truncate">
                          {category === "All" ? "All Focus Areas" : category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Startup Filter */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-agri-yellow rounded-full"></div>
                  <h4 className="font-semibold text-agri-earth-dark">Filter by Startup</h4>
                </div>
                {/* Mobile: horizontal scroll row */}
                <div className="md:hidden -mx-1 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 px-1">
                    {startups.map((startup) => {
                      const isSelected = selectedStartup === startup;
                      return (
                        <button
                          key={startup}
                          onClick={() => {
                            setSelectedStartup(startup);
                            if (startup === "All") setPage(1);
                          }}
                          className={`min-w-[130px] rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                            isSelected
                              ? "bg-agri-yellow/20 border-agri-yellow text-agri-earth-dark shadow-md"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-agri-yellow/50"
                          }`}
                        >
                          <span className="text-2xl mb-2">🏢</span>
                          <span className="text-sm font-medium truncate">
                            {startup === "All" ? "All Startups" : startup}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {/* Desktop: grid */}
                <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 w-full">
                  {startups.map((startup) => {
                    const isSelected = selectedStartup === startup;
                    return (
                      <button
                        key={startup}
                        onClick={() => {
                          setSelectedStartup(startup);
                          if (startup === "All") setPage(1);
                        }}
                        className={`rounded-xl border p-4 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                          isSelected
                            ? "bg-agri-yellow/20 border-agri-yellow text-agri-earth-dark shadow-md"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-agri-yellow/50"
                        }`}
                      >
                        <span className="text-2xl mb-2">🏢</span>
                        <span className="text-sm font-medium truncate">
                          {startup === "All" ? "All Startups" : startup}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Size Selection */}
        <div className="flex justify-end mb-4">
          <label className="mr-2 font-medium">Products per page:</label>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-1">
            {[10, 20, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agri-green mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                // Convert ApiProduct to Product format
                const productForCard: Product = {
                  id: product._id, // Use MongoDB _id as id
                  name: product.name,
                  description: product.description,
                  category: product.category,
                  startup: product.startup,
                  quantity: product.quantity,
                  price: product.price,
                  contact: product.contact,
                  image: product.image
                };
                return (
                  <ProductCard key={product._id} product={productForCard} onMoreInfo={setSelectedProduct} />
                );
              })
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col items-center mt-8 gap-2">
          <div className="flex gap-2">
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <Button key={num} variant={num === page ? 'default' : 'outline'} onClick={() => setPage(num)}>{num}</Button>
            ))}
            <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
          <span className="px-4 py-2">Page {page} of {totalPages}</span>
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No products found matching your filters. Try adjusting your selection.
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-hero text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            Interested in Bulk Orders?
          </h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Contact our startups directly for bulk pricing, custom orders, or distribution partnerships.
            Support sustainable agriculture and innovative farming solutions.
          </p>
          <Button
            variant="secondary"
            className="bg-white text-agri-green hover:bg-gray-100"
            asChild
          >
            <Link to="/contact">
              Get in Touch
            </Link>
          </Button>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <Card className="max-w-full sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl text-agri-green mb-2">
                    {selectedProduct.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className="bg-agri-yellow-light text-agri-earth-dark">
                      {selectedProduct.category}
                    </Badge>
                    <Badge variant="outline">
                      {selectedProduct.startup}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedProduct(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedProduct.image && (
                  <div className="rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-64 object-contain"
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-2">Product Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Product Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span className="font-medium">{selectedProduct.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-medium text-agri-green">{selectedProduct.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Category:</span>
                        <span className="font-medium">{selectedProduct.category}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Startup Contact</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Contact Person:</span>
                        <p className="font-medium">{selectedProduct.contact.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-agri-green" />
                        <span className="font-medium">{selectedProduct.contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-agri-green" />
                        <span className="font-medium break-all">{selectedProduct.contact.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="bg-agri-green hover:bg-agri-green/90 flex-1"
                    asChild
                  >
                    <a href={`tel:${selectedProduct.contact.phone} `}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    asChild
                  >
                    <a href={`mailto:${selectedProduct.contact.email} `}>
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </a>
                  </Button>
                  <Button
                    className="bg-agri-yellow text-agri-earth-dark hover:bg-agri-yellow/90 flex-1 font-semibold"
                    asChild
                  >
                    <a
                      href={`https://wa.me/91${selectedProduct.contact.phone.replace(/[^0-9]/g, "")}?text=Hi,%20I%20am%20interested%20in%20buying%20the%20product:%20${encodeURIComponent(selectedProduct.name)}%20(${encodeURIComponent(selectedProduct.quantity)})%20for%20${encodeURIComponent(selectedProduct.price)}%20from%20${encodeURIComponent(selectedProduct.startup)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buy Now
                    </a >
                  </Button >
                  <Button
                    variant="outline"
                    onClick={() => setSelectedProduct(null)}
                  >
                    Close
                  </Button>
                </div >
              </div >
            </CardContent >
          </Card >
        </div >
      )
      }
    </div >
  );
}

function ProductReviews({ productId, user }: { productId: string, user: any }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    fetch(`${API}/products/${productId}/reviews`)
      .then(res => res.ok ? res.json() : [])
      .then(data => { setReviews(data); setLoading(false); });
  }, [productId]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    const res = await fetch(`${API}/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, name: user.name, rating, comment })
    });
    if (res.ok) {
      const data = await res.json();
      setReviews(data);
      setSuccess('Review submitted!');
      setRating(5);
      setComment('');
    } else {
      setError('Failed to submit review');
    }
    setSubmitting(false);
  };
  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;
  return (
    <div className="mt-4">
      <h4 className="font-bold text-lg mb-2">Reviews {avgRating && <span className="ml-2 text-yellow-600">★ {avgRating}</span>}</h4>
      {loading ? <div>Loading...</div> : reviews.length === 0 ? <div className="text-gray-500">No reviews yet.</div> : (
        <div className="space-y-2 mb-4">
          {reviews.map((r, i) => (
            <div key={i} className="bg-gray-50 rounded p-2">
              <div className="flex items-center gap-2 text-yellow-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} <span className="text-xs text-gray-500 ml-2">{r.name}</span></div>
              <div className="text-sm text-gray-700">{r.comment}</div>
              <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="font-medium">Your Rating:</label>
            <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border rounded px-2 py-1">
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Your review..." className="w-full border rounded px-2 py-1 min-h-[60px]" />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-700 text-sm">{success}</div>}
        </form>
      )}
    </div>
  );
}