






import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { ProductCard } from "@/components/ProductCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";
import type { Product } from "@/types";

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

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStartup, setSelectedStartup] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [startups, setStartups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategoriesAndStartups();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
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
        fetch('/api/products/categories'),
        fetch('/api/products/startups')
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
    return categoryMatch && startupMatch;
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
        <div className="mb-12">
          <div className="bg-gradient-to-br from-agri-green-light/10 via-white to-agri-yellow-light/10 rounded-3xl p-8 shadow-elegant border border-agri-green/10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-agri-green mb-2">Smart Product Filters</h3>
              <p className="text-muted-foreground">Discover products tailored to your interests</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Category Filter */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-agri-green rounded-full"></div>
                  <h4 className="font-semibold text-agri-green">Filter by Category</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`
                        ${selectedCategory === category
                          ? "bg-agri-green hover:bg-agri-green/90 text-white shadow-md transform scale-105"
                          : "border-2 border-agri-green/30 text-agri-green hover:border-agri-green hover:bg-agri-green/10"
                        }
                        px-4 py-2 rounded-full font-medium transition-all duration-300 hover:shadow-lg text-xs
                      `}
                    >
                      {category === "All" ? "All Categories" : category.split(" ").slice(0, 2).join(" ")}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Startup Filter */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-agri-yellow rounded-full"></div>
                  <h4 className="font-semibold text-agri-earth-dark">Filter by Startup</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {startups.map((startup) => (
                    <Button
                      key={startup}
                      variant={selectedStartup === startup ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStartup(startup)}
                      className={`
                        ${selectedStartup === startup
                          ? "bg-agri-yellow text-agri-earth-dark hover:bg-agri-yellow/90 shadow-md transform scale-105"
                          : "border-2 border-agri-yellow/50 text-agri-earth-dark hover:border-agri-yellow hover:bg-agri-yellow/10"
                        }
                        px-4 py-2 rounded-full font-medium transition-all duration-300 hover:shadow-lg text-xs
                      `}
                    >
                      {startup === "All" ? "All Startups" : startup.split(" ")[0]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agri-green mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              // Convert ApiProduct to Product format
              const productForCard: Product = {
                id: parseInt(product._id.replace(/[^0-9]/g, '')) || Math.random(), // Convert string ID to number
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
            <a href="/contact">
              Get in Touch
            </a>
          </Button>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                    <a href={`tel:${selectedProduct.contact.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    asChild
                  >
                    <a href={`mailto:${selectedProduct.contact.email}`}>
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
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedProduct(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
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
    fetch(`http://localhost:5000/api/products/${productId}/reviews`)
      .then(res => res.ok ? res.json() : [])
      .then(data => { setReviews(data); setLoading(false); });
  }, [productId]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    const res = await fetch(`http://localhost:5000/api/products/${productId}/reviews`, {
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