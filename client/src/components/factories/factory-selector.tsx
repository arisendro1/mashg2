import { useState } from "react";
import { Search, Building2, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFactories, useSearchFactories } from "@/hooks/use-factories";
import { FactoryForm } from "./factory-form";
import type { Factory } from "@shared/schema";

interface FactorySelectorProps {
  onFactorySelect: (factory: Factory | null) => void;
  selectedFactory?: Factory | null;
  showCreateNew?: boolean;
}

export function FactorySelector({ onFactorySelect, selectedFactory, showCreateNew = true }: FactorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: factories, isLoading } = useFactories();
  const { data: searchResults } = useSearchFactories(searchQuery);
  
  const displayFactories = searchQuery.trim() ? searchResults || [] : factories || [];
  
  const handleFactorySelect = (factory: Factory) => {
    onFactorySelect(factory);
  };
  
  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading factories...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Select Factory (Optional)
        </CardTitle>
        <CardDescription>
          Choose an existing factory to auto-populate inspection data, or start with a blank form.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search factories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {showCreateNew && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Factory</DialogTitle>
                  <DialogDescription>
                    Create a new factory that will be available for future inspections.
                  </DialogDescription>
                </DialogHeader>
                <FactoryForm
                  onSuccess={handleCreateSuccess}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {selectedFactory && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">{selectedFactory.name}</p>
                <p className="text-sm text-blue-700">{selectedFactory.address}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onFactorySelect(null)}
                className="text-blue-700 hover:bg-blue-100"
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {displayFactories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery.trim() ? (
                <p>No factories found matching "{searchQuery}"</p>
              ) : (
                <div>
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No factories available</p>
                  <p className="text-sm">Create your first factory to get started</p>
                </div>
              )}
            </div>
          ) : (
            displayFactories.map((factory) => (
              <div
                key={factory.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedFactory?.id === factory.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
                onClick={() => handleFactorySelect(factory)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{factory.name}</p>
                    <p className="text-sm text-gray-600 truncate">{factory.address}</p>
                    {factory.contactName && (
                      <p className="text-xs text-gray-500">Contact: {factory.contactName}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onFactorySelect(null)}
          >
            Continue without factory selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}