import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { CreditCard, Banknote, Landmark, Smartphone } from "lucide-react";

const paymentMethods = [
  { key: "upi", label: "UPI", icon: <Smartphone className="w-5 h-5 mr-2" /> },
  { key: "card", label: "Credit/Debit Card", icon: <CreditCard className="w-5 h-5 mr-2" /> },
  { key: "netbanking", label: "Netbanking", icon: <Landmark className="w-5 h-5 mr-2" /> },
  { key: "cod", label: "Cash on Delivery", icon: <Banknote className="w-5 h-5 mr-2" /> },
];

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("upi");

  useEffect(() => {
    if (location.state && location.state.order) {
      setOrder(location.state.order);
    } else {
      navigate("/products");
    }
  }, [location, navigate]);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  if (!order) return null;

  // Calculate total
  const priceNumber = Number(order.product.price.replace(/[^\d.]/g, ''));
  const total = priceNumber * (order.quantity || 1);

  const handleConfirmPay = () => {
    navigate("/payment-details", {
      state: {
        order: {
          ...order,
          paymentMethod: paymentMethods.find((m) => m.key === selectedMethod)?.label,
          paymentMethodKey: selectedMethod,
        },
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-green-light/30 to-agri-yellow-light/30 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 border border-agri-green/10">
        <h2 className="text-3xl font-bold text-agri-green mb-6 text-center">Payment</h2>
        <div className="mb-8">
          <div className="bg-agri-green-light/30 rounded-lg p-4 mb-4">
            <h3 className="text-xl font-semibold mb-2">Order Summary</h3>
            <div className="flex flex-col gap-1 text-sm">
              <div><span className="font-medium">Product:</span> {order.product.name}</div>
              <div><span className="font-medium">Quantity:</span> {order.quantity}</div>
              <div><span className="font-medium">Price:</span> {order.product.price}</div>
              <div><span className="font-medium">Total:</span> <span className="font-semibold text-agri-green">₹{total}</span></div>
              <div><span className="font-medium">Customer:</span> {order.name}</div>
              <div><span className="font-medium">Email:</span> {order.email}</div>
              <div><span className="font-medium">Phone:</span> {order.phone}</div>
              <div><span className="font-medium">Shipping Address:</span> {order.address}</div>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Select Payment Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <button
                key={method.key}
                type="button"
                aria-pressed={selectedMethod === method.key}
                onClick={() => setSelectedMethod(method.key)}
                className={`flex items-center justify-center w-full py-3 text-lg font-medium rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-agri-green
                  ${selectedMethod === method.key
                    ? "bg-agri-green text-white border-agri-green shadow-lg"
                    : "bg-white text-agri-green border-agri-green/30 hover:bg-agri-green-light/30"}
                `}
              >
                {method.icon}
                {method.label}
              </button>
            ))}
          </div>
        </div>
        <Button className="w-full bg-agri-green hover:bg-agri-green/90 text-lg py-3 font-semibold shadow-md mt-4" onClick={handleConfirmPay}>
          Confirm & Pay
        </Button>
        <div className="text-center text-xs text-muted-foreground mt-6">
          <span>100% Secure Payment | Powered by Krishik Agri Business Incubator</span>
        </div>
      </div>
    </div>
  );
} 