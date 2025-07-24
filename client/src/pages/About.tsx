import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-agri-green mb-6">
            About Krishik Agri Business Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering agricultural innovation through sustainable entrepreneurship and cutting-edge technology solutions
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <Card className="shadow-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-agri-green mb-4">
                Krishik Agri Business Incubator
              </h2>
              <p className="text-foreground leading-relaxed mb-4">
                The Krishik Agri Business Incubator is a Center of Excellence established under the
                RKVY-Innovation and Agri-Entrepreneurship Programme. As a Knowledge Partner of RKVY,
                we operate under the Ministry of Agriculture & Farmers' Welfare, Government of India.
              </p>
              <p className="text-foreground leading-relaxed">
                Located at the prestigious University of Agricultural Sciences, Dharwad, Karnataka,
                our incubator serves as a catalyst for transforming innovative agricultural ideas
                into successful, sustainable enterprises.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-agri-green mb-4">
                Our Mission
              </h2>
              <p className="text-foreground leading-relaxed mb-4">
                To foster agricultural innovation by providing comprehensive support to agri-entrepreneurs,
                from ideation to market success. We bridge the gap between traditional farming practices
                and modern technology solutions.
              </p>
              <p className="text-foreground leading-relaxed">
                Through our platform, we connect innovative startups with customers, investors, and
                stakeholders to create a thriving ecosystem for sustainable agricultural development.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Support Partners */}
        <Card className="shadow-elevated mb-16">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-center text-agri-green mb-8">
              Supported By
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-lg font-semibold text-agri-earth-dark mb-2">
                  RKVY-RAFTAAR Programme
                </h3>
                <p className="text-muted-foreground">
                  Innovation and Agri-Entrepreneurship initiative for sustainable agricultural growth
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-agri-earth-dark mb-2">
                  Ministry of Agriculture & Farmers' Welfare
                </h3>
                <p className="text-muted-foreground">
                  Government of India's premier agricultural development ministry
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-agri-earth-dark mb-2">
                  University of Agricultural Sciences
                </h3>
                <p className="text-muted-foreground">
                  Leading agricultural research and education institution in Dharwad, Karnataka
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-agri-green mb-8">
            Our Impact
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-gradient-card p-6 rounded-lg">
              <div className="text-3xl font-bold text-agri-green mb-2">15+</div>
              <p className="text-muted-foreground">Focus Areas</p>
            </div>
            <div className="bg-gradient-card p-6 rounded-lg">
              <div className="text-3xl font-bold text-agri-green mb-2">20+</div>
              <p className="text-muted-foreground">Active Startups</p>
            </div>
            <div className="bg-gradient-card p-6 rounded-lg">
              <div className="text-3xl font-bold text-agri-green mb-2">90+</div>
              <p className="text-muted-foreground">Innovative Products</p>
            </div>
            <div className="bg-gradient-card p-6 rounded-lg">
              <div className="text-3xl font-bold text-agri-green mb-2">100%</div>
              <p className="text-muted-foreground">Sustainability Focus</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}