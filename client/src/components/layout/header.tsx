import { ClipboardCheck, Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <ClipboardCheck className="text-primary text-2xl mr-3" />
            <h1 className="text-xl font-inter font-semibold text-text-primary">
              Factory Inspection
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Search className="text-text-secondary hover:text-primary transition-colors" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="text-text-secondary hover:text-primary transition-colors" />
            </Button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="text-white text-sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
