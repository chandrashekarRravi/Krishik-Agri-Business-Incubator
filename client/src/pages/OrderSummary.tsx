import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API = import.meta.env.VITE_API_URL;

export default function OrderSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;
  const [emailStatus, setEmailStatus] = useState('');

  // Calculate total
  const priceNumber = Number(order?.product.price.replace(/[^\d.]/g, ''));
  const total = priceNumber * (order?.quantity || 1);

  useEffect(() => {
    if (order && order.email && order.product && order.product.name) {
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?._id,
          productId: order.product.id, // Use id instead of _id for static data
          productName: order.product.name, // Send product name
          email: order.email,
          name: order.name,
          quantity: order.quantity,
          total,
          shippingAddress: order.address
        })
      })
        .then(res => res.json())
        .then(data => {
          setEmailStatus(data.message || '');
        })
        .catch(() => setEmailStatus('Order placed but failed to send confirmation email.'));
    }
  }, [order, total]);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">No Order Found</h2>
        <Button onClick={() => navigate("/products")}>Go to Products</Button>
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      startY: 78,
      head: [['Product', 'Quantity', 'Price', 'Total']],
      body: [[order.product.name, order.quantity, order.product.price, `₹${total}`]],
    });
    // @ts-expect-error: lastAutoTable is added by jspdf-autotable
    doc.text(`Payment Method: ${order.paymentMethod}`, 14, doc.lastAutoTable.finalY + 10);
    if (order.estimatedDelivery) {
      // @ts-expect-error: lastAutoTable is added by jspdf-autotable
      doc.text(`Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}`, 14, doc.lastAutoTable.finalY + 18);
    }
    doc.setFontSize(18);
    doc.text('Invoice', 14, 18);
    doc.setFontSize(12);
    doc.text(`Order Number: ${order.orderNumber || 'N/A'}`, 14, 28);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
    doc.text(`Customer: ${order.name}`, 14, 44);
    doc.text(`Email: ${order.email}`, 14, 52);
    doc.text(`Phone: ${order.phone}`, 14, 60);
    doc.text(`Shipping Address: ${order.address}`, 14, 68);
    doc.save(`Invoice_${order.orderNumber || 'Order'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-green-light/30 to-agri-yellow-light/30 flex items-center justify-center py-6 px-2 sm:px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-4 sm:p-8 border border-agri-green/10">
        <h2 className="text-2xl sm:text-3xl font-bold text-agri-green mb-2 sm:mb-4 text-center">Order Confirmed!</h2>
        <p className="text-base sm:text-lg text-center mb-4 sm:mb-8 text-muted-foreground">Thank you for your purchase. Your order has been placed successfully.</p>
        <div className="bg-agri-green-light/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Order Details</h3>
          <div className="flex flex-col gap-1 text-xs sm:text-sm">
            <div><span className="font-medium">Product:</span> {order.product.name}</div>
            <div><span className="font-medium">Quantity:</span> {order.quantity}</div>
            <div><span className="font-medium">Price:</span> {order.product.price}</div>
            <div><span className="font-medium">Total:</span> <span className="font-semibold text-agri-green">₹{total}</span></div>
            <div><span className="font-medium">Customer:</span> {order.name}</div>
            <div><span className="font-medium">Email:</span> {order.email}</div>
            <div><span className="font-medium">Phone:</span> {order.phone}</div>
            <div><span className="font-medium">Shipping Address:</span> {order.address}</div>
            <div><span className="font-medium">Payment Method:</span> {order.paymentMethod}</div>
            {order.estimatedDelivery && (
              <div><span className="font-medium">Estimated Delivery:</span> {new Date(order.estimatedDelivery).toLocaleDateString()}</div>
            )}
          </div>
          {emailStatus && (
            <div className={`mt-2 sm:mt-4 text-center font-semibold ${emailStatus.includes('failed') ? 'text-red-600' : 'text-green-700'}`}>{emailStatus}</div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:mt-4">
          <Button className="w-full sm:w-auto bg-agri-green hover:bg-agri-green/90 text-base sm:text-lg py-2 sm:py-3 font-semibold shadow-md" onClick={() => navigate("/products")}>Back to Products</Button>
          <Button className="w-full sm:w-auto bg-agri-yellow text-agri-earth-dark hover:bg-agri-yellow/90 text-base sm:text-lg py-2 sm:py-3 font-semibold shadow-md" onClick={handleDownloadInvoice}>Download Invoice</Button>
        </div>
      </div>
    </div>
  );
} 