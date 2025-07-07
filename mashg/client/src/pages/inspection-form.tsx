import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BasicInfoForm } from "@/components/inspection/basic-info-form";
import { ContactForm } from "@/components/inspection/contact-form";
import { BackgroundForm } from "@/components/inspection/background-form";
import { DocumentsForm } from "@/components/inspection/documents-form";
import { CategoryForm } from "@/components/inspection/category-form";
import { PhotoUpload } from "@/components/inspection/photo-upload";
import { FactorySelector } from "@/components/factories/factory-selector";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useFactory } from "@/hooks/use-factories";
import type { Factory } from "@shared/schema";

const steps = [
  { id: 0, title: "Factory", component: FactorySelector },
  { id: 1, title: "Basic Info", component: BasicInfoForm },
  { id: 2, title: "Contact", component: ContactForm },
  { id: 3, title: "Background", component: BackgroundForm },
  { id: 4, title: "Documents", component: DocumentsForm },
  { id: 5, title: "Category", component: CategoryForm },
  { id: 6, title: "Photos", component: PhotoUpload },
];

export default function InspectionForm() {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(id ? 1 : 0); // Start at factory selection for new inspections
  const [formData, setFormData] = useState({});
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  
  // Get factory ID from URL parameters for auto-population
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const factoryId = urlParams.get('factory');
  const { data: factory } = useFactory(factoryId || '');
  const { toast } = useToast();

  // Auto-populate form data from factory (either selected or URL parameter)
  useEffect(() => {
    const sourceFactory = selectedFactory || factory;
    if (sourceFactory && !id) { // Only auto-populate for new inspections
      setFormData(prevData => ({
        ...prevData,
        factoryName: sourceFactory.name,
        address: sourceFactory.address,
        mapLink: sourceFactory.mapLink || '',
        contactName: sourceFactory.contactName || '',
        contactPosition: sourceFactory.contactPosition || '',
        contactEmail: sourceFactory.contactEmail || '',
        contactPhone: sourceFactory.contactPhone || '',
        currentProducts: sourceFactory.currentProducts || '',
        employeeCount: sourceFactory.employeeCount || '',
        shiftsPerDay: sourceFactory.shiftsPerDay || '',
        workingDays: sourceFactory.workingDays || '',
        kashrut: sourceFactory.kashrut || '',
      }));
      
      toast({
        title: "Factory data loaded",
        description: `Form has been pre-filled with data from ${sourceFactory.name}`,
      });
    }
  }, [selectedFactory, factory, id, toast]);
  
  // Set selected factory from URL parameter
  useEffect(() => {
    if (factory && !selectedFactory) {
      setSelectedFactory(factory);
    }
  }, [factory, selectedFactory]);

  const { data: inspection, isLoading } = useQuery({
    queryKey: ["/api/inspections", id],
    enabled: !!id,
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("API request data:", data);
      
      if (id) {
        const response = await apiRequest("PATCH", `/api/inspections/${id}`, data);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/inspections", data);
        return response.json();
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Draft saved successfully",
        description: "Your inspection draft has been saved.",
      });
      
      // If this was a new inspection, redirect to edit mode
      if (!id && data?.id) {
        setLocation(`/inspection/${data.id}`);
      }
      
      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["/api/inspections", id] });
      }
    },
    onError: () => {
      toast({
        title: "Error saving draft",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeInspectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data, status: "completed" };
      
      if (id) {
        const response = await apiRequest("PATCH", `/api/inspections/${id}`, payload);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/inspections", payload);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Inspection completed",
        description: "Your inspection has been marked as completed.",
      });
      
      // Invalidate cache and redirect
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      setLocation("/reports");
    },
    onError: () => {
      toast({
        title: "Error completing inspection",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleFactorySelect = (factory: Factory | null) => {
    setSelectedFactory(factory);
    if (factory) {
      // Auto-advance to basic info when factory is selected
      setCurrentStep(1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const handleSaveDraft = () => {
    console.log("Saving draft with data:", formData);
    
    // Ensure minimum required fields are present
    const draftData = {
      factoryName: formData.factoryName || "Draft Factory",
      inspector: formData.inspector || "Inspector",
      factoryAddress: formData.factoryAddress || "Address",
      gregorianDate: formData.gregorianDate || new Date().toISOString().split('T')[0],
      ...formData,
      status: "draft"
    };
    
    console.log("Sending draft data:", draftData);
    saveDraftMutation.mutate(draftData);
  };

  const handleCompleteInspection = () => {
    completeInspectionMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-text-primary">
            {id ? "Edit Inspection" : "New Factory Inspection"}
          </CardTitle>
          
          {/* Step Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => handleStepClick(step.id)}
                      className="flex items-center"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        step.id === currentStep
                          ? "bg-primary text-white"
                          : step.id < currentStep
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-text-secondary"
                      }`}>
                        {step.id === 0 ? "F" : step.id}
                      </div>
                      <span className={`ml-2 text-sm font-medium ${
                        step.id === currentStep ? "text-primary" : "text-text-secondary"
                      }`}>
                        {step.title}
                      </span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className="w-12 h-0.5 bg-gray-300 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {CurrentStepComponent && currentStep === 0 ? (
            <FactorySelector
              onFactorySelect={handleFactorySelect}
              selectedFactory={selectedFactory}
            />
          ) : CurrentStepComponent ? (
            <CurrentStepComponent
              data={inspection || formData}
              onUpdate={setFormData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          ) : null}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={saveDraftMutation.isPending}
              >
                {saveDraftMutation.isPending ? "Saving..." : "Save as Draft"}
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="flex items-center"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteInspection}
                  disabled={completeInspectionMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {completeInspectionMutation.isPending ? "Completing..." : "Complete Inspection"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}