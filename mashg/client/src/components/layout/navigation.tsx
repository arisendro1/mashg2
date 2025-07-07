import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", id: "dashboard" },
  { path: "/inspection", label: "New Inspection", id: "inspection" },
  { path: "/reports", label: "Reports", id: "reports" },
  { path: "/factories", label: "Factories", id: "factories" },
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <div className="mb-8">
      <nav className="flex space-x-8 border-b border-gray-200">
        {navItems.map((item) => {
          const isActive = location === item.path || 
            (item.path === "/inspection" && location.startsWith("/inspection"));
          
          return (
            <Link key={item.id} href={item.path}>
              <button
                className={cn(
                  "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                )}
              >
                {item.label}
              </button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
