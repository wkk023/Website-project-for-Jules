import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useFireStationAuth } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NewInspection from "./pages/NewInspection";
import ViewRecords from "./pages/ViewRecords";
import Dashboard from "./pages/Dashboard";
import VerificationDashboard from "./pages/VerificationDashboard";
import VerificationHistory from "./pages/VerificationHistory";
import BulkImport from "./pages/BulkImport";
import { useEffect, useState } from "react";
import { trpc } from "./lib/trpc";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useFireStationAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return user ? <Component /> : null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/submit" component={() => <ProtectedRoute component={NewInspection} />} />
      <Route path="/records" component={() => <ProtectedRoute component={ViewRecords} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/verification" component={() => <ProtectedRoute component={VerificationDashboard} />} />
      <Route path="/verification-history" component={() => <ProtectedRoute component={VerificationHistory} />} />
      <Route path="/bulk-import" component={() => <ProtectedRoute component={BulkImport} />} />
      <Route path="/" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
