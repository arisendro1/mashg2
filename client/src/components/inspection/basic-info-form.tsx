import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { HDate } from "@hebcal/core";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const basicInfoSchema = z.object({
  factoryName: z.string().min(1, "Factory name is required"),
  inspector: z.string().min(1, "Inspector name is required"),
  factoryAddress: z.string().min(1, "Factory address is required"),
  mapLink: z.string().url("Invalid URL").optional().or(z.literal("")),
  hebrewDate: z.string().optional(),
  gregorianDate: z.string().min(1, "Gregorian date is required"),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface BasicInfoFormProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function BasicInfoForm({ data, onUpdate, onNext }: BasicInfoFormProps) {
  // Generate Hebrew date for default Gregorian date if not provided
  const getDefaultHebrewDate = () => {
    if (data?.hebrewDate) return data.hebrewDate;
    
    const gregorianDateString = data?.gregorianDate || new Date().toISOString().split('T')[0];
    try {
      const gregorianDate = new Date(gregorianDateString);
      const hebrewDate = new HDate(gregorianDate);
      return hebrewDate.toString();
    } catch (error) {
      console.error('Error converting default date to Hebrew:', error);
      return "";
    }
  };

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      factoryName: data?.factoryName || "",
      inspector: data?.inspector || "",
      factoryAddress: data?.factoryAddress || "",
      mapLink: data?.mapLink || "",
      gregorianDate: data?.gregorianDate || new Date().toISOString().split('T')[0],
      hebrewDate: getDefaultHebrewDate(),
    },
  });

  // Auto-populate Hebrew date when Gregorian date changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'gregorianDate' && value.gregorianDate) {
        try {
          const gregorianDate = new Date(value.gregorianDate);
          const hebrewDate = new HDate(gregorianDate);
          const hebrewDateString = hebrewDate.toString();
          form.setValue('hebrewDate', hebrewDateString);
        } catch (error) {
          console.error('Error converting to Hebrew date:', error);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = (formData: BasicInfoFormData) => {
    onUpdate({ ...data, ...formData });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="factoryName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Factory Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter factory name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="inspector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inspector Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter inspector name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="factoryAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Factory Address</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter factory address" 
                  className="h-20"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mapLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Google Maps Link</FormLabel>
              <FormControl>
                <Input 
                  type="url" 
                  placeholder="https://goo.gl/maps..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="gregorianDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inspection Date (Gregorian)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hebrewDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inspection Date (Hebrew)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="תאריך עברי" 
                    {...field}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Continue to Contact Information
        </Button>
      </form>
    </Form>
  );
}
