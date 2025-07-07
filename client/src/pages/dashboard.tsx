import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, CalendarCheck, Clock, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useInspections } from "@/hooks/use-inspections";

export default function Dashboard() {
  const { data: inspections = [], isLoading: inspectionsLoading } = useInspections();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/inspections/stats"],
  });

  if (inspectionsLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const recentInspections = inspections.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardList className="text-primary text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Total Inspections</p>
                <p className="text-2xl font-semibold text-text-primary">
                  {stats?.totalInspections || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarCheck className="text-secondary text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">This Month</p>
                <p className="text-2xl font-semibold text-text-primary">
                  {stats?.thisMonth || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="text-accent text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">Pending</p>
                <p className="text-2xl font-semibold text-text-primary">
                  {stats?.pending || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Inspections */}
      <Card className="bg-white shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-text-primary">Recent Inspections</h3>
            <Link href="/reports">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
        </div>
        
        {recentInspections.length === 0 ? (
          <CardContent className="p-6 text-center">
            <p className="text-text-secondary">No inspections yet. Start by creating your first inspection.</p>
            <Link href="/inspection">
              <Button className="mt-4">New Inspection</Button>
            </Link>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Factory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentInspections.map((inspection) => (
                  <tr key={inspection.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                            <Building className="text-white text-sm" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-text-primary">
                            {inspection.factoryName}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {inspection.factoryAddress}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                      {inspection.inspector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {new Date(inspection.gregorianDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={
                          inspection.status === "completed" ? "default" : 
                          inspection.status === "pending" ? "secondary" : "outline"
                        }
                        className={
                          inspection.status === "completed" ? "bg-green-100 text-green-800" :
                          inspection.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {inspection.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link href={`/inspection/${inspection.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
