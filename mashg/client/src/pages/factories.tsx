import { useState } from "react";
import { Link } from "wouter";
import { Plus, Search, Edit, Trash2, MapPin, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useFactories, useDeleteFactory, useSearchFactories } from "@/hooks/use-factories";
import { useToast } from "@/hooks/use-toast";
import { FactoryForm } from "@/components/factories/factory-form";
import type { Factory } from "@shared/schema";

export default function Factories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFactory, setEditingFactory] = useState<Factory | null>(null);
  
  const { data: factories, isLoading } = useFactories();
  const { data: searchResults } = useSearchFactories(searchQuery);
  const deleteFactory = useDeleteFactory();
  const { toast } = useToast();

  const displayFactories = searchQuery.trim() ? searchResults || [] : factories || [];

  const handleDelete = async (factory: Factory) => {
    try {
      await deleteFactory.mutateAsync(factory.id);
      toast({
        title: "Factory deleted",
        description: `${factory.name} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete factory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (factory: Factory) => {
    setEditingFactory(factory);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFactory(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Factory Management</h1>
            <p className="text-gray-600 mt-2">Manage factory information for streamlined inspections</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingFactory(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Factory
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingFactory ? "Edit Factory" : "Add New Factory"}
                </DialogTitle>
                <DialogDescription>
                  {editingFactory 
                    ? "Update factory information that will be used for inspections."
                    : "Add factory information that will be used to auto-populate inspection forms."
                  }
                </DialogDescription>
              </DialogHeader>
              <FactoryForm 
                factory={editingFactory}
                onSuccess={handleCloseForm}
                onCancel={handleCloseForm}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search factories by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {displayFactories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500">
                {searchQuery.trim() ? (
                  <>
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No factories found</p>
                    <p>Try adjusting your search terms</p>
                  </>
                ) : (
                  <>
                    <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No factories yet</p>
                    <p>Add your first factory to get started</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayFactories.map((factory) => (
              <Card key={factory.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{factory.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {factory.address}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(factory)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Factory</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{factory.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(factory)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {factory.contactName && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{factory.contactName}</span>
                      {factory.contactPosition && (
                        <Badge variant="secondary" className="text-xs">
                          {factory.contactPosition}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {factory.contactPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{factory.contactPhone}</span>
                    </div>
                  )}
                  
                  {factory.contactEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="truncate">{factory.contactEmail}</span>
                    </div>
                  )}

                  {factory.kashrut && (
                    <div className="pt-2">
                      <Badge variant="outline">
                        {factory.kashrut}
                      </Badge>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <Link href={`/inspection-form?factory=${factory.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        Start Inspection
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}