import { Navigation } from "@/components/Navigation";
import { FocusAreaCard } from "@/components/FocusAreaCard";
import { focusAreas } from "@/data/focusAreas";
import type { FocusArea } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function FocusAreas() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-agri-green mb-6">
            Focus Areas
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive coverage of agricultural innovation across multiple domains,
            driving sustainable development and technological advancement
          </p>
        </div>
        {/* Focus Areas Image */}
        <div className="mb-12 text-center">
          <img
            src="/uploads/focusAreas.png"
            alt="Focus Areas Diagram"
            className="mx-auto max-w-full h-auto rounded-lg shadow-elevated"
          />
        </div>
        {/* Focus Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {focusAreas.map((area: FocusArea) => (
            <FocusAreaCard key={area.id} area={area} />
          ))}
        </div>
        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-agri-green mb-4">
            Ready to Innovate?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join our ecosystem of agricultural innovators and explore opportunities
            in these focus areas. Connect with startups and discover cutting-edge solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/startups"
              className="bg-agri-green text-white px-6 py-3 rounded-lg font-medium hover:bg-agri-green/90 transition-colors"
            >
              Explore Startups
            </Link>
            <Link
              to="/products"
              className="bg-agri-yellow text-agri-earth-dark px-6 py-3 rounded-lg font-medium hover:bg-agri-yellow/90 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}