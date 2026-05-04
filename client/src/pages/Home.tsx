import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { FileText, Eye, Zap, BarChart3 } from "lucide-react";
import { useFireStationAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const { user } = useFireStationAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center text-white font-bold">
              FI
            </div>
            <h1 className="text-xl font-bold text-foreground">Fire Inspection System</h1>
          </div>
          <nav className="hidden sm:flex items-center gap-6">
            <button
              onClick={() => navigate("/")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Home
            </button>
            {user && (
              <>
                <button
                  onClick={() => navigate("/submit")}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Submit
                </button>
                <button
                  onClick={() => navigate("/records")}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Records
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </button>
              </>
            )}
            {!user && (
              <Link href="/login">
                <Button className="gradient-primary text-white">
                  Login
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 sm:py-32">
        <div className="max-w-3xl">
          <h2 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
            Fire Safety <span className="gradient-primary bg-clip-text text-transparent">Inspection</span> Management
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            A comprehensive system for submitting, managing, and tracking fire inspection records.
            Streamline your fire safety compliance with our elegant and intuitive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {user ? (
              <>
                <Button
                  onClick={() => navigate("/submit")}
                  className="h-12 px-8 text-base font-semibold gradient-primary text-white hover:opacity-90"
                >
                  Submit New Inspection
                </Button>
                <Button
                  onClick={() => navigate("/records")}
                  variant="outline"
                  className="h-12 px-8 text-base font-semibold"
                >
                  View All Records
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="h-12 px-8 text-base font-semibold gradient-primary text-white hover:opacity-90">
                  Login to Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 sm:py-32">
        <div className="container">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Key Features
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage fire inspection records efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Easy Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Submit fire inspection details with a simple, intuitive form.
                  Capture LIFIPS numbers, addresses, locations, and inspection findings.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Search & View</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Search and filter inspection records by LIFIPS number, address,
                  or location. View all submitted records in a clean table format.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Export Data</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Export all or filtered inspection records to CSV format
                  for further analysis and reporting.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 4 - Dashboard */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  View detailed statistics and charts showing irregularity distribution,
                  records by location, and compliance metrics.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-primary text-white py-20 sm:py-32">
        <div className="container text-center">
          <h3 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Submit your first fire inspection record today and keep your facility compliant.
          </p>
          {user ? (
            <Button
              onClick={() => navigate("/submit")}
              className="h-12 px-8 text-base font-semibold bg-white text-primary hover:bg-orange-50"
            >
              Submit Inspection Now
            </Button>
          ) : (
            <Link href="/login">
              <Button className="h-12 px-8 text-base font-semibold bg-white text-primary hover:bg-orange-50">
                Login Now
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-8">
        <div className="container text-center text-sm opacity-75">
          <p>&copy; 2024 Fire Inspection System. All rights reserved.</p>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex justify-around">
        <button
          onClick={() => navigate("/")}
          className="flex-1 py-3 text-center text-sm font-medium text-foreground hover:text-primary"
        >
          Home
        </button>
        {user && (
          <>
            <button
              onClick={() => navigate("/submit")}
              className="flex-1 py-3 text-center text-sm font-medium text-foreground hover:text-primary"
            >
              Submit
            </button>
            <button
              onClick={() => navigate("/records")}
              className="flex-1 py-3 text-center text-sm font-medium text-foreground hover:text-primary"
            >
              Records
            </button>
          </>
        )}
        {!user && (
          <Link href="/login" className="flex-1">
            <button className="w-full py-3 text-center text-sm font-medium text-primary hover:text-primary">
              Login
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
