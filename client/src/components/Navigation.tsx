import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Focus Areas", href: "/focus-areas" },
  { name: "Startups", href: "/startups" },
  { name: "Products", href: "/products" },
  { name: "Contact", href: "/contact" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  useEffect(() => {
    if (!avatarMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [avatarMenuOpen]);

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16 relative">
          {/* Desktop Navigation (centered) */}
          <div className="hidden md:block w-full">
            <div className="flex justify-center items-baseline space-x-4">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                      ? "bg-agri-green text-white"
                      : "text-foreground hover:bg-agri-green/10 hover:text-agri-green"
                      }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Avatar/Account section (right) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <div className="relative" ref={avatarRef}>
              <button onClick={() => setAvatarMenuOpen((v) => !v)} className="focus:outline-none">
                <Avatar>
                  <AvatarFallback>{user ? user.name?.[0]?.toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
              </button>
              {avatarMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                  {user ? (
                    <>
                      <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setAvatarMenuOpen(false)}>Profile</Link>
                      {user.isAdmin && (
                        <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setAvatarMenuOpen(false)}>Admin Dashboard</Link>
                      )}
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                          localStorage.removeItem('token');
                          localStorage.removeItem('user');
                          setAvatarMenuOpen(false);
                          navigate('/login');
                        }}
                      >Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/register" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setAvatarMenuOpen(false)}>Register</Link>
                      <Link to="/login" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setAvatarMenuOpen(false)}>Login</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden absolute left-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive
                      ? "bg-agri-green text-white"
                      : "text-foreground hover:bg-agri-green/10 hover:text-agri-green"
                      }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="mt-2 border-t pt-2">
                <Link to="/register" className="block px-4 py-2 hover:bg-gray-100">Register</Link>
                <Link to="/login" className="block px-4 py-2 hover:bg-gray-100">Login</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}