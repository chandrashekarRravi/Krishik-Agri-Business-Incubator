import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Package, Leaf, Phone, Mail } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
const API = import.meta.env.VITE_API_URL;
const Index = () => {
  const featuredStartups = [
    {
      name: "Agrider Biotech LLP",
      category: "Post Harvest Tech",
      products: 2
    },
    {
      name: "Shree Aarogya Foods",
      category: "Organic Farming",
      products: 4
    },
    {
      name: "Nutrica Supplements",
      category: "Biotechnology",
      products: 5
    },
    {
      name: "SOSSA Sugar",
      category: "Food Technology",
      products: 2
    }
  ];

  return (
    <>
      <SEOHead
        title="Krishik Agri Business Hub - Empowering Agricultural Innovation"
        description="Discover innovative agricultural products and startups from Krishik Agri Business Incubator. Sustainable farming solutions for the future."
        keywords="agriculture, farming, innovation, startups, sustainable farming, agricultural technology"
        image="/krishik-banner.jpg"
      />
      <div className="min-h-screen bg-background">
        {/* Header Banner */}
        <section className="relative w-full bg-[#181c23] py-6 border-b border-neutral-800">
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            <div className="flex flex-row flex-wrap justify-center gap-4 mb-4">
              <img src="/uploads/India Emblem(new circular).png" alt="India Emblem" className="h-16 w-16 object-contain rounded-full" />
              <img src="/uploads/RKVY(new circular).png" alt="RKVY Logo" className="h-16 w-16 object-contain rounded-full" />
              <img src="/uploads/UAS Dharwad(new circular).png" alt="UAS Dharwad Logo" className="h-16 w-16 object-contain rounded-full" />
              <img src="/uploads/Krishik(new circular).png" alt="Krishik Logo" className="h-16 w-16 object-contain rounded-full" />
              <img src="/uploads/ASTRA(new circular).png" alt="ASTRA Logo" className="h-16 w-16 object-contain rounded-full" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-extrabold text-agri-yellow mb-2 tracking-tight">Krishik Agri Business Incubator</h1>
              <div className="text-base md:text-lg text-white font-medium mb-1">RKVY-Innovation and Agri-Entrepreneurship Programme</div>
              <div className="text-lg md:text-xl text-white font-bold mb-1">Center of Excellence</div>
              <div className="text-sm text-white mb-1">(Knowledge Partner, RKVY, MoA & FW, GoI)</div>
              <div className="text-lg md:text-xl font-bold text-agri-green mt-1">University of Agricultural Sciences, Dharwad.</div>
            </div>
          </div>
        </section>

        <Navigation />

        {/* Hero Section */}
        <section className="relative bg-gradient-hero text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Empowering Agricultural Innovation
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Discover cutting-edge agricultural products and connect with innovative startups
                driving sustainable farming solutions for the future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button
                  size="lg"
                  className="bg-agri-yellow text-agri-earth-dark hover:bg-agri-yellow/90 font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <a href={`${API}/startups`} className="flex items-center justify-center">
                    <Users className="mr-2 h-5 w-5" />
                    View Startups
                  </a>
                </Button>
                <Button
                  size="lg"
                  className="bg-white text-agri-green hover:bg-agri-yellow hover:text-agri-earth-dark font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl border-2 border-agri-yellow transition-all duration-300"
                  asChild
                >
                  <a href="/products" className="flex items-center justify-center">
                    <Package className="mr-2 h-5 w-5" />
                    Explore Agri Products
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-agri-green-light/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-agri-green mb-6">
                About Krishik Agri Business Incubator
              </h2>
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                The Krishik Agri Business Incubator operates as a Center of Excellence under the
                RKVY-Innovation and Agri-Entrepreneurship Programme, supported by the Ministry of
                Agriculture & Farmers' Welfare, Government of India. Located at the prestigious
                University of Agricultural Sciences, Dharwad, Karnataka, we drive agricultural innovation
                through comprehensive startup support and sustainable technology solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Focus Areas */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-agri-green mb-6">
                Our Focus Areas
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Comprehensive coverage across 15+ agricultural innovation domains
              </p>
            </div>

            <div className="mb-12">
              <img
                src="/uploads/focusAreas.png"
                alt="Focus Areas"
                className="mx-auto max-w-full h-auto rounded-lg shadow-elevated"
              />
            </div>

            <div className="text-center">
              <Button
                size="lg"
                className="bg-agri-green hover:bg-agri-green/90"
                asChild
              >
                <a href="/focus-areas">
                  Explore All Focus Areas
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Startups */}
        <section className="py-16 bg-gradient-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-agri-green mb-6">
                Featured Startups
              </h2>
              <p className="text-lg text-muted-foreground">
                Meet the innovative startups driving agricultural transformation
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featuredStartups.map((startup, index) => (
                <Card key={index} className="shadow-card hover:shadow-elevated transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg text-agri-green">
                      {startup.name}
                    </CardTitle>
                    <Badge className="bg-agri-yellow-light text-agri-earth-dark">
                      {startup.category}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Products:</span>
                      <span className="font-semibold text-agri-green">{startup.products}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                size="lg"
                variant="outline"
                className="border-agri-green text-agri-green hover:bg-agri-green hover:text-white"
                asChild
              >
                <a href="/startups">
                  View All Startups
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Success Highlight */}
        <section className="py-16 bg-gradient-hero text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <Leaf className="h-12 w-12 mr-4" />
              <h2 className="text-4xl font-bold">Driving Agricultural Innovation</h2>
            </div>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join our ecosystem of agricultural innovators and be part of the sustainable farming revolution.
              Together, we're creating solutions that benefit farmers, consumers, and the environment.
            </p>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold mb-2">15+</div>
                <p className="opacity-90">Focus Areas</p>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">4+</div>
                <p className="opacity-90">Active Startups</p>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">20+</div>
                <p className="opacity-90">Innovative Products</p>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">100%</div>
                <p className="opacity-90">Sustainability Focus</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer
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
        */}

      </div>
    </>
  );
};

export default Index;
