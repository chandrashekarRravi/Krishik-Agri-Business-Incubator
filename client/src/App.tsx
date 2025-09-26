import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import { Analytics } from "@/components/Analytics";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Startups from "./pages/Startups";
import NotFound from "./pages/NotFound";
import Buy from "./pages/Buy";
import Payment from "./pages/Payment";
import OrderSummary from "./pages/OrderSummary";
import PaymentDetails from "./pages/PaymentDetails";
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import { Navigation } from "@/components/Navigation";
import { Phone, Mail } from 'lucide-react';

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Analytics />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {/** Determine user for conditional footer links */}
              {(() => {
                return null;
              })()}
              <Routes>
                {/* Default route redirects to products */}
                <Route path="/" element={<Navigate to="/products" replace />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<><Navigation /><ProductDetail /></>} />
                <Route path="/startups" element={<Startups />} />
                <Route path="/buy" element={<><Navigation /><Buy /></>} />
                <Route path="/payment" element={<><Navigation /><Payment /></>} />
                <Route path="/payment-details" element={<><Navigation /><PaymentDetails /></>} />
                <Route path="/order-summary" element={<><Navigation /><OrderSummary /></>} />
                <Route path="/register" element={<><Navigation /><Register /></>} />
                <Route path="/login" element={<><Navigation /><Login /></>} />
                <Route path="/profile" element={<><Navigation /><Profile /></>} />
                <Route path="/admin" element={<AdminDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <footer className="bg-agri-earth-dark text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    <div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
                        <img
                          src="/uploads/Krishik_original.jpg"
                          alt="Krishik Logo"
                          className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-cover rounded-full border-2 border-white shadow-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">Krishik Agri Business Incubator</h3>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4">
                        Empowering agricultural innovation through sustainable entrepreneurship and cutting-edge technology solutions.
                      </p>
                      <div className="flex items-center space-x-3 mb-2">
                        <Phone className="w-5 h-5 text-agri-yellow flex-shrink-0" />
                        <span className="text-gray-300 text-sm sm:text-base">0836-2214487</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-agri-yellow flex-shrink-0" />
                        <span className="text-gray-300 text-sm sm:text-base">rabi@uasd.in</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold mb-4">Quick Links</h3>
                      <ul className="space-y-2">
                        <li><Link to="/products" className="text-gray-300 hover:text-agri-yellow transition-colors text-sm sm:text-base">Products</Link></li>
                        <li><Link to="/profile" className="text-gray-300 hover:text-agri-yellow transition-colors text-sm sm:text-base">Profile</Link></li>
                        {/* Admin link visible; actual access should be protected server-side */}
                        <li><Link to="/admin" className="text-gray-300 hover:text-agri-yellow transition-colors text-sm sm:text-base">Admin</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold mb-4">Location</h3>
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                        Krishik Agri Business Incubator<br />
                        University of Agricultural Sciences<br />
                        Dharwad, Karnataka 580005<br />
                        India
                      </p>
                      <div className="w-full h-48 sm:h-56 rounded-lg overflow-hidden border border-gray-600 bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-gray-600 mb-2">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">University of Agricultural Sciences</p>
                          <p className="text-xs text-gray-500">Dharwad, Karnataka 580005</p>
                          <a
                            href="https://maps.google.com/?q=University+of+Agricultural+Sciences+Dharwad"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/*<div className="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p className="text-gray-300">
                      © 2025 Krishik Agri Business Incubator. All rights reserved.
                    </p>
                  </div>*/}

                </div>
              </footer>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
