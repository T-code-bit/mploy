import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Page Not Found | M-Ploy";
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-lg mx-auto px-4"
        >
          <div className="inline-flex p-5 rounded-3xl bg-primary/10 mb-6">
            <Search className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-display text-7xl font-bold text-foreground tracking-tight mb-2">404</h1>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-3">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="bg-gradient-primary text-primary-foreground rounded-xl h-11 px-6 gap-2">
                <Home className="h-4 w-4" /> Go Home
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="outline" className="rounded-xl h-11 px-6 gap-2">
                <Search className="h-4 w-4" /> Browse Jobs
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
