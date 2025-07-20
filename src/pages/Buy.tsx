import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BuyForm } from "@/components/BuyForm";
import type { BuyFormData } from "@/components/BuyForm";
import { productData } from "@/data/products";

export default function Buy() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = Number(searchParams.get("productId"));
  const product = productData.find((p) => p.id === productId);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const handleSubmit = async (formData: BuyFormData) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigate("/payment", {
        state: {
          order: {
            product,
            ...formData,
          },
        },
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-agri-green mb-2">Buy Product</h2>
        <div className="mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
            {product.image && (
              <img src={product.image} alt={product.name} className="w-20 h-20 object-contain rounded" />
            )}
            <div>
              <div className="font-semibold text-lg">{product.name}</div>
              <div className="text-sm text-muted-foreground">{product.category}</div>
              <div className="text-sm">Startup: <span className="font-medium">{product.startup}</span></div>
              <div className="text-sm">Price: <span className="font-semibold text-agri-green">{product.price}</span></div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-agri-green mb-4">Customer Details</h3>
          <BuyForm product={product} onSubmit={handleSubmit} isSubmitting={submitting} />
        </div>
      </div>
    </div>
  );
} 