import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/navigation";
import Dashboard from "@/pages/dashboard";
import InspectionForm from "@/pages/inspection-form";
import Reports from "@/pages/reports";
import Factories from "@/pages/factories";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/inspection" component={InspectionForm} />
      <Route path="/inspection/:id" component={InspectionForm} />
      <Route path="/reports" component={Reports} />
      <Route path="/factories" component={Factories} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-surface">
          <Header />
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <Navigation />
            <Router />
          </main>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
