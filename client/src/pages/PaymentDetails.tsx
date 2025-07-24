import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PaymentDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);
  const order = location.state?.order;
  const [form, setForm] = useState({
    upiId: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    bank: "",
    netbankingName: "",
    netbankingRef: "",
    netbankingUsername: "",
    netbankingPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">No Order Found</h2>
        <Button onClick={() => navigate("/products")}>Go to Products</Button>
      </div>
    );
  }

  // Calculate total
  const priceNumber = Number(order.product.price.replace(/[^\d.]/g, ''));
  const total = priceNumber * (order.quantity || 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      navigate("/order-summary", {
        state: {
          order: {
            ...order,
            paymentDetails: form,
          },
        },
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-green-light/30 to-agri-yellow-light/30 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 border border-agri-green/10">
        <h2 className="text-3xl font-bold text-agri-green mb-6 text-center">Payment Details</h2>
        <div className="bg-agri-green-light/30 rounded-lg p-4 mb-6">
          <h3 className="text-xl font-semibold mb-2">Order Summary</h3>
          <div className="flex flex-col gap-1 text-sm">
            <div><span className="font-medium">Product:</span> {order.product.name}</div>
            <div><span className="font-medium">Quantity:</span> {order.quantity}</div>
            <div><span className="font-medium">Price:</span> {order.product.price}</div>
            <div><span className="font-medium">Total:</span> <span className="font-semibold text-agri-green">₹{total}</span></div>
            <div><span className="font-medium">Customer:</span> {order.name}</div>
            <div><span className="font-medium">Payment Method:</span> {order.paymentMethod}</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {order.paymentMethodKey === "upi" && (
            <div>
              <label className="block font-medium mb-1" htmlFor="upiId">UPI ID</label>
              <input
                id="upiId"
                name="upiId"
                value={form.upiId}
                onChange={handleChange}
                required
                placeholder="example@upi"
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-agri-green focus:outline-none"
              />
            </div>
          )}
          {order.paymentMethodKey === "card" && (
            <>
              <div>
                <label className="block font-medium mb-1" htmlFor="cardNumber">Card Number</label>
                <input
                  id="cardNumber"
                  name="cardNumber"
                  value={form.cardNumber}
                  onChange={handleChange}
                  required
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-agri-green focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1" htmlFor="cardExpiry">Expiry</label>
                  <input
                    id="cardExpiry"
                    name="cardExpiry"
                    value={form.cardExpiry}
                    onChange={handleChange}
                    required
                    placeholder="MM/YY"
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-agri-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1" htmlFor="cardCvv">CVV</label>
                  <input
                    id="cardCvv"
                    name="cardCvv"
                    value={form.cardCvv}
                    onChange={handleChange}
                    required
                    maxLength={4}
                    placeholder="123"
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-agri-green focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1" htmlFor="cardName">Name on Card</label>
                <input
                  id="cardName"
                  name="cardName"
                  value={form.cardName}
                  onChange={handleChange}
                  required
                  placeholder="Cardholder Name"
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-agri-green focus:outline-none"
                />
              </div>
            </>
          )}
          {order.paymentMethodKey === "netbanking" && (
            <>
              <div>
                <label className="block font-medium mb-1" htmlFor="bank">Select Bank</label>
                <select
                  id="bank"
                  name="bank"
                  value={form.bank}
                  onChange={handleChange}
                  required
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-agri-green focus:outline-none"
                >
                  <option value="">-- Select Bank --</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="Axis">Axis Bank</option>
                  <option value="Kotak">Kotak Mahindra Bank</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1" htmlFor="netbankingUsername">Netbanking Username</label>
                <input
                  id="netbankingUsername"
                  name="netbankingUsername"
                  value={form.netbankingUsername || ""}
                  onChange={handleChange}
                  required
                  placeholder="Enter your netbanking username"
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-agri-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium mb-1" htmlFor="netbankingPassword">Netbanking Password</label>
                <input
                  id="netbankingPassword"
                  name="netbankingPassword"
                  type="password"
                  value={form.netbankingPassword || ""}
                  onChange={handleChange}
                  required
                  placeholder="Enter your netbanking password"
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-agri-green focus:outline-none"
                />
              </div>
            </>
          )}
          {order.paymentMethodKey === "cod" && (
            <div className="text-center text-lg font-medium text-agri-green py-6">
              Cash on Delivery selected. Please keep the exact amount ready. Our delivery partner will contact you soon.
            </div>
          )}
          <Button type="submit" className="w-full bg-agri-green hover:bg-agri-green/90 text-lg py-3 font-semibold shadow-md mt-4" disabled={submitting}>
            {submitting ? "Processing..." : "Complete Payment"}
          </Button>
        </form>
      </div>
    </div>
  );
} 