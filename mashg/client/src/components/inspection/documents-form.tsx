import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const documentsSchema = z.object({
  masterIngredientList: z.boolean(),
  blueprint: z.boolean(),
  flowchart: z.boolean(),
  boilerBlueprint: z.boolean(),
});

type DocumentsFormData = z.infer<typeof documentsSchema>;

interface DocumentsFormProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function DocumentsForm({ data, onUpdate, onNext }: DocumentsFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string[]>>(
    data?.documentFiles || {}
  );
  const { toast } = useToast();
  const form = useForm<DocumentsFormData>({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      masterIngredientList: data?.documents?.masterIngredientList || false,
      blueprint: data?.documents?.blueprint || false,
      flowchart: data?.documents?.flowchart || false,
      boilerBlueprint: data?.documents?.boilerBlueprint || false,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ files, documentType }: { files: FileList; documentType: string }) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('documents', file);
      });
      
      const response = await apiRequest('POST', '/api/upload/documents', formData);
      return { filePaths: (await response.json()).filePaths, documentType };
    },
    onSuccess: ({ filePaths, documentType }) => {
      const newFiles = {
        ...uploadedFiles,
        [documentType]: [...(uploadedFiles[documentType] || []), ...filePaths],
      };
      setUploadedFiles(newFiles);
      toast({
        title: "Success",
        description: "Documents uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (files: FileList | null, documentType: string) => {
    if (files && files.length > 0) {
      uploadMutation.mutate({ files, documentType });
    }
  };

  const removeFile = (documentType: string, filePath: string) => {
    const newFiles = {
      ...uploadedFiles,
      [documentType]: uploadedFiles[documentType]?.filter(f => f !== filePath) || [],
    };
    setUploadedFiles(newFiles);
  };

  const onSubmit = (formData: DocumentsFormData) => {
    onUpdate({ 
      ...data, 
      documents: formData,
      documentFiles: uploadedFiles,
    });
    onNext();
  };

  const documents = [
    {
      key: "masterIngredientList",
      label: "Master Ingredient List",
      description: "Complete list of all ingredients used in the factory",
      type: "required",
    },
    {
      key: "blueprint",
      label: "Blueprint/Floor Plan",
      description: "Factory layout and floor plan",
      type: "recommended",
    },
    {
      key: "flowchart",
      label: "Flowchart",
      description: "Production process flow diagram",
      type: "recommended",
    },
    {
      key: "boilerBlueprint",
      label: "Boiler Blueprint",
      description: "Steam system and boiler layout",
      type: "optional",
    },
  ];

  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-text-primary">
          Required Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              {documents.map((doc) => (
                <FormField
                  key={doc.key}
                  control={form.control}
                  name={doc.key as keyof DocumentsFormData}
                  render={({ field }) => (
                    <div className="p-4 border rounded-lg bg-white space-y-3">
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none flex-1">
                          <div className="flex items-center space-x-2">
                            <FormLabel className="text-sm font-medium text-text-primary">
                              {doc.label}
                            </FormLabel>
                            <Badge 
                              variant={
                                doc.type === "required" ? "destructive" : 
                                doc.type === "recommended" ? "default" : "secondary"
                              }
                              className={
                                doc.type === "required" ? "bg-red-100 text-red-800" :
                                doc.type === "recommended" ? "bg-blue-100 text-blue-800" :
                                "bg-gray-100 text-gray-800"
                              }
                            >
                              {doc.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-secondary">
                            {doc.description}
                          </p>
                        </div>
                      </FormItem>

                      {/* File Upload Section */}
                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-text-secondary">Upload Files:</p>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.xlsx,.xls"
                            onChange={(e) => handleFileUpload(e.target.files, doc.key)}
                            className="hidden"
                            id={`file-upload-${doc.key}`}
                          />
                          <label htmlFor={`file-upload-${doc.key}`}>
                            <Button 
                              asChild 
                              variant="outline" 
                              size="sm"
                              disabled={uploadMutation.isPending}
                              className="cursor-pointer"
                            >
                              <span className="flex items-center">
                                <Upload className="w-3 h-3 mr-2" />
                                {uploadMutation.isPending ? "Uploading..." : "Upload"}
                              </span>
                            </Button>
                          </label>
                        </div>

                        {/* Uploaded Files List */}
                        {uploadedFiles[doc.key] && uploadedFiles[doc.key].length > 0 && (
                          <div className="space-y-1">
                            {uploadedFiles[doc.key].map((filePath, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                                <div className="flex items-center">
                                  <FileText className="w-3 h-3 mr-2 text-blue-600" />
                                  <span className="text-text-primary">
                                    {filePath.split('/').pop()}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(doc.key, filePath)}
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                />
              ))}
            </div>

            <Button type="submit" className="w-full">
              Continue to Category Assessment
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
