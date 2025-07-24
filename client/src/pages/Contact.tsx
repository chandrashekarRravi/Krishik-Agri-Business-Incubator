import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/ContactForm";
import { MapPin, Phone, Mail, Youtube, Facebook, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-agri-green mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get in touch with the Krishik Agri Business Hub team. We're here to support
            your agricultural innovation journey and answer any questions you may have.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl text-agri-green">Get In Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-agri-green mt-1" />
                  <div>
                    <h3 className="font-semibold text-agri-green">Address</h3>
                    <p className="text-muted-foreground">
                      Krishik Agri Business Incubator<br />
                      University of Agricultural Sciences<br />
                      Dharwad, Karnataka 580005<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="w-6 h-6 text-agri-green mt-1" />
                  <div>
                    <h3 className="font-semibold text-agri-green">Phone</h3>
                    <p className="text-muted-foreground">
                      +91 836 221 5284<br />
                      +91 836 221 5285
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-agri-green mt-1" />
                  <div>
                    <h3 className="font-semibold text-agri-green">Email</h3>
                    <p className="text-muted-foreground">
                      info@krishikagri.com<br />
                      support@krishikagri.com
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-xl text-agri-green">Location Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3847.8962447234734!2d75.02371217503657!3d15.459893285138842!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb8d3a1b1b1b1b1%3A0x1b1b1b1b1b1b1b1b!2sUniversity%20of%20Agricultural%20Sciences%2C%20Dharwad!5e0!3m2!1sen!2sin!4v1629876543210!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="University of Agricultural Sciences, Dharwad Location"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="shadow-elevated">
              <CardHeader>
                <CardTitle className="text-2xl text-agri-green">Send us a Message</CardTitle>
                <p className="text-muted-foreground">
                  Have questions about our programs, startups, or products? We'd love to hear from you.
                </p>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>

            {/* Enhanced Quick Links */}
            <Card className="shadow-elevated mt-8 bg-gradient-to-br from-agri-green-light/10 to-agri-yellow-light/20">
              <CardHeader>
                <CardTitle className="text-xl text-agri-green flex items-center gap-2">
                  <div className="w-2 h-2 bg-agri-green rounded-full"></div>
                  Quick Links
                </CardTitle>
                <p className="text-sm text-muted-foreground">Navigate to key sections</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    to="/startups"
                    className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-center"
                  >
                    <div className="font-medium text-agri-green">Startups</div>
                    <div className="text-xs text-muted-foreground">Explore our startups</div>
                  </Link>
                  <Link
                    to="/products"
                    className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-center"
                  >
                    <div className="font-medium text-agri-green">Products</div>
                    <div className="text-xs text-muted-foreground">Browse products</div>
                  </Link>
                  <Link
                    to="/focus-areas"
                    className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-center"
                  >
                    <div className="font-medium text-agri-green">Focus Areas</div>
                    <div className="text-xs text-muted-foreground">Innovation domains</div>
                  </Link>
                  <Link
                    to="/about"
                    className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-center"
                  >
                    <div className="font-medium text-agri-green">About Us</div>
                    <div className="text-xs text-muted-foreground">Learn more</div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}