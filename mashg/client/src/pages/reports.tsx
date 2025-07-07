import { useState } from "react";
import { useInspections } from "@/hooks/use-inspections";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchFilters } from "@/components/reports/search-filters";
import { ReportCard } from "@/components/reports/report-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus } from "lucide-react";

export default function Reports() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  const { data: inspections = [], isLoading } = useInspections();

  // Filter inspections based on current filters
  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = !filters.search || 
      inspection.factoryName.toLowerCase().includes(filters.search.toLowerCase()) ||
      inspection.inspector.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || inspection.status === filters.status;
    
    const matchesDateFrom = !filters.dateFrom || 
      new Date(inspection.gregorianDate) >= new Date(filters.dateFrom);
    
    const matchesDateTo = !filters.dateTo || 
      new Date(inspection.gregorianDate) <= new Date(filters.dateTo);
    
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-text-primary">Inspection Reports</h2>
        <Link href="/inspection">
          <Button className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Inspection
          </Button>
        </Link>
      </div>
      
      <SearchFilters filters={filters} onFiltersChange={setFilters} />

      {filteredInspections.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-text-primary">
                {inspections.length === 0 ? "No inspections yet" : "No inspections match your filters"}
              </h3>
              <p className="text-text-secondary">
                {inspections.length === 0 
                  ? "Start by creating your first factory inspection."
                  : "Try adjusting your search criteria or filters."
                }
              </p>
              {inspections.length === 0 && (
                <Link href="/inspection">
                  <Button>Create First Inspection</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInspections.map((inspection) => (
            <ReportCard key={inspection.id} inspection={inspection} />
          ))}
        </div>
      )}
    </div>
  );
}
