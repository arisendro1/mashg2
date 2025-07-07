import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Eye, Download, Mail, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Inspection } from "@shared/schema";
import { generatePDF } from "@/lib/pdf-generator";
import { PDFViewer } from "./pdf-viewer";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReportCardProps {
  inspection: Inspection;
}

export function ReportCard({ inspection }: ReportCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      // Generate PDF
      const pdfBlob = await generatePDF(inspection);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inspection-report-${inspection.factoryName}-${inspection.gregorianDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "PDF report generated and downloaded successfully",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewReport = () => {
    setShowPDFViewer(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/inspections/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inspections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inspections/stats'] });
      toast({
        title: "Success",
        description: "Inspection deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete inspection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(inspection.id);
  };

  const handleEmail = () => {
    // TODO: Implement email functionality
    toast({
      title: "Email",
      description: "Email functionality will be implemented",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Building className="text-white text-sm" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-text-primary">
                {inspection.factoryName}
              </h3>
              <p className="text-xs text-text-secondary">
                {inspection.inspector}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(inspection.status)}>
            {inspection.status}
          </Badge>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-text-secondary mb-1">Inspection Date</p>
          <p className="text-sm font-medium text-text-primary">
            {new Date(inspection.gregorianDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-text-secondary mb-1">Location</p>
          <p className="text-sm font-medium text-text-primary">
            {inspection.factoryAddress}
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleViewReport}
              title="View Report"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDownload}
              disabled={isGenerating}
              title="Download PDF"
            >
              <Download className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleEmail}
              title="Email Report"
            >
              <Mail className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  title="Delete Inspection"
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Inspection</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the inspection for "{inspection.factoryName}"? 
                    This action cannot be undone and will permanently remove all inspection data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <p className="text-xs text-text-secondary">
            {inspection.createdAt ? new Date(inspection.createdAt).toLocaleDateString() : ""}
          </p>
        </div>
      </CardContent>
      
      <PDFViewer 
        inspection={inspection}
        isOpen={showPDFViewer}
        onClose={() => setShowPDFViewer(false)}
      />
    </Card>
  );
}
