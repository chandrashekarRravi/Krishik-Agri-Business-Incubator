import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { StartupCard } from "@/components/StartupCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, ExternalLink } from "lucide-react";
import type { Startup } from "@/types";

export default function Startups() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [focusAreaFilters, setFocusAreaFilters] = useState<string[]>(["All"]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartups = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/startups");
        if (res.ok) {
          const data = await res.json();
          // Ensure data is an array of Startup
          const startupsData: Startup[] = Array.isArray(data) ? data : [];
          setStartups(startupsData);
          // Dynamically generate focus area filters
          const focusAreas = Array.from(new Set(startupsData.map((s) => String(s.focusArea))));
          setFocusAreaFilters(["All", ...focusAreas]);
        }
      } catch (err: any) {
        setStartups([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStartups();
  }, []);

  const filteredStartups = selectedFilter === "All"
    ? startups
    : startups.filter(startup => startup.focusArea === selectedFilter);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-agri-green mb-6">
            Incubated Startups
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover innovative agricultural enterprises transforming the future of farming
            through technology and sustainable practices
          </p>
        </div>

        {/* Professional Filter Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-agri-green-light/20 to-agri-yellow-light/20 rounded-2xl p-8 shadow-elegant">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-agri-green mb-2">Filter by Focus Area</h3>
              <p className="text-muted-foreground">Select a category to view specialized startups</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {focusAreaFilters.map((filter) => (
                <Button
                  key={String(filter)}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  onClick={() => setSelectedFilter(String(filter))}
                  className={`
                    ${selectedFilter === filter
                      ? "bg-agri-green hover:bg-agri-green/90 text-white shadow-md transform scale-105"
                      : "border-2 border-agri-green/30 text-agri-green hover:border-agri-green hover:bg-agri-green/10"
                    }
                    px-6 py-3 rounded-full font-medium transition-all duration-300 hover:shadow-lg
                  `}
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Startups Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agri-green mr-2"></div>
            <span className="text-muted-foreground">Loading startups...</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredStartups.map((startup) => (
              <StartupCard key={(startup as any)._id ?? (startup as any).id} startup={startup} onMoreInfo={setSelectedStartup} />
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-gradient-hero text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">
            Join Our Innovation Ecosystem
          </h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Are you an agri-entrepreneur with innovative ideas? Connect with us to explore
            incubation opportunities and transform your agricultural innovations into successful ventures.
          </p>
          <Button
            variant="secondary"
            className="bg-white text-agri-green hover:bg-gray-100"
            asChild
          >
            <a href="/contact">
              Get Started Today
            </a>
          </Button>
        </div>
      </div>

      {/* Startup Detail Modal/Overlay */}
      {selectedStartup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl text-agri-green mb-2">
                    {selectedStartup.name}
                  </CardTitle>
                  <Badge className="bg-agri-yellow-light text-agri-earth-dark">
                    {selectedStartup.focusArea}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedStartup(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">About</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedStartup.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-medium min-w-[100px]">Name:</span>
                      <span className="text-muted-foreground">{selectedStartup.contact.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-agri-green min-w-[16px]" />
                      <span className="font-medium min-w-[100px]">Phone:</span>
                      <span className="text-muted-foreground">{selectedStartup.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-agri-green min-w-[16px]" />
                      <span className="font-medium min-w-[100px]">Email:</span>
                      <span className="text-muted-foreground break-all">{selectedStartup.contact.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    className="bg-agri-green hover:bg-agri-green/90 flex-1"
                    asChild
                  >
                    <a href="/products">
                      View All Products
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedStartup(null)}
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