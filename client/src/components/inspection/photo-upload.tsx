import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PhotoUploadProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function PhotoUpload({ data, onUpdate, onNext }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(data?.photos || []);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('photos', file);
      });
      
      const response = await apiRequest('POST', '/api/upload/photos', formData);
      return response.json();
    },
    onSuccess: (data) => {
      const newPhotos = [...photos, ...data.filePaths];
      setPhotos(newPhotos);
      onUpdate({ ...data, photos: newPhotos });
      toast({
        title: "Success",
        description: "Photos uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload photos",
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadMutation.mutate(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files);
    }
  };

  const removePhoto = (photoPath: string) => {
    const newPhotos = photos.filter(p => p !== photoPath);
    setPhotos(newPhotos);
    onUpdate({ ...data, photos: newPhotos });
  };

  const handleContinue = () => {
    onUpdate({ ...data, photos });
    onNext();
  };

  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-text-primary">
          Photo Documentation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? "border-primary bg-primary/10" 
              : "border-gray-300 hover:border-primary"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Camera className="text-3xl text-gray-400 mb-3 mx-auto" />
          <p className="text-sm text-text-secondary mb-2">
            Drop photos here or click to upload
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <Button 
              asChild 
              disabled={uploadMutation.isPending}
              className="cursor-pointer"
            >
              <span className="flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                {uploadMutation.isPending ? "Uploading..." : "Choose Files"}
              </span>
            </Button>
          </label>
        </div>

        {photos.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-text-primary">Uploaded Photos:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Inspection photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                    onClick={() => removePhoto(photo)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={handleContinue} className="w-full">
          Complete Inspection Setup
        </Button>
      </CardContent>
    </Card>
  );
}
