import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/hooks/useAuth";
import { Analytics } from "@/components/Analytics";
import Index from "./pages/Index";
import About from "./pages/About";
import FocusAreas from "./pages/FocusAreas";
import Startups from "./pages/Startups";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
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
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/focus-areas" element={<FocusAreas />} />
                <Route path="/startups" element={<Startups />} />
                <Route path="/products" element={<Products />} />
                <Route path="/buy" element={<><Navigation /><Buy /></>} />
                <Route path="/payment" element={<><Navigation /><Payment /></>} />
                <Route path="/payment-details" element={<><Navigation /><PaymentDetails /></>} />
                <Route path="/order-summary" element={<><Navigation /><OrderSummary /></>} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/register" element={<><Navigation /><Register /></>} />
                <Route path="/login" element={<><Navigation /><Login /></>} />
                <Route path="/profile" element={<><Navigation /><Profile /></>} />
                <Route path="/admin" element={<AdminDashboard />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <footer className="bg-agri-earth-dark text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div>
                      <h3 className="text-xl font-bold mb-4">Krishik Agri Business Hub</h3>
                      <p className="text-gray-300 mb-4">
                        Empowering agricultural innovation through sustainable entrepreneurship and cutting-edge technology solutions.
                      </p>
                      <div className="flex space-x-4">
                        <Phone className="w-5 h-5 text-agri-yellow" />
                        <span className="text-gray-300">+91 836 221 5284</span>
                      </div>
                      <div className="flex space-x-4 mt-2">
                        <Mail className="w-5 h-5 text-agri-yellow" />
                        <span className="text-gray-300">info@krishikagri.com</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                      <ul className="space-y-2">
                        <li><a href="/about" className="text-gray-300 hover:text-agri-yellow transition-colors">About Us</a></li>
                        <li><a href="/startups" className="text-gray-300 hover:text-agri-yellow transition-colors">Startups</a></li>
                        <li><a href="/products" className="text-gray-300 hover:text-agri-yellow transition-colors">Products</a></li>
                        <li><a href="/focus-areas" className="text-gray-300 hover:text-agri-yellow transition-colors">Focus Areas</a></li>
                        <li><a href="/contact" className="text-gray-300 hover:text-agri-yellow transition-colors">Contact</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4">Location</h3>
                      <p className="text-gray-300">
                        Krishik Agri Business Incubator<br />
                        University of Agricultural Sciences<br />
                        Dharwad, Karnataka 580005<br />
                        India
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p className="text-gray-300">
                      © 2025 Krishik Agri Business Hub. All rights reserved.
                    </p>
                  </div>
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
