import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateFactory, useUpdateFactory } from "@/hooks/use-factories";
import { useToast } from "@/hooks/use-toast";
import { insertFactorySchema } from "@shared/schema";
import type { Factory, InsertFactory } from "@shared/schema";
import { z } from "zod";

const formSchema = insertFactorySchema.extend({
  address: z.string().min(1, "Address is required"),
  name: z.string().min(1, "Factory name is required"),
});

type FormData = z.infer<typeof formSchema>;

interface FactoryFormProps {
  factory?: Factory | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FactoryForm({ factory, onSuccess, onCancel }: FactoryFormProps) {
  const createFactory = useCreateFactory();
  const updateFactory = useUpdateFactory();
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: factory?.name || "",
      address: factory?.address || "",
      mapLink: factory?.mapLink || "",
      contactName: factory?.contactName || "",
      contactPosition: factory?.contactPosition || "",
      contactEmail: factory?.contactEmail || "",
      contactPhone: factory?.contactPhone || "",
      currentProducts: factory?.currentProducts || "",
      employeeCount: factory?.employeeCount || "",
      shiftsPerDay: factory?.shiftsPerDay || "",
      workingDays: factory?.workingDays || "",
      kashrut: factory?.kashrut || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (factory) {
        await updateFactory.mutateAsync({ id: factory.id, data });
        toast({
          title: "Factory updated",
          description: "Factory information has been updated successfully.",
        });
      } else {
        await createFactory.mutateAsync(data);
        toast({
          title: "Factory created",
          description: "New factory has been added successfully.",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: factory ? "Failed to update factory." : "Failed to create factory.",
        variant: "destructive",
      });
    }
  };

  const isLoading = createFactory.isPending || updateFactory.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Factory Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter factory name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kashrut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kashrut Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select kashrut status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="kosher">Kosher</SelectItem>
                    <SelectItem value="non-kosher">Non-Kosher</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address *</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter full factory address" {...field} />
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
              <FormLabel>Map Link</FormLabel>
              <FormControl>
                <Input placeholder="Google Maps link or other map service" {...field} />
              </FormControl>
              <FormDescription>
                Link to the factory location on maps for easy navigation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input placeholder="Contact person name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Job title or position" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="contact@factory.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Production Information</h3>
          
          <FormField
            control={form.control}
            name="currentProducts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Products</FormLabel>
                <FormControl>
                  <Textarea placeholder="List of products manufactured" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="employeeCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Count</FormLabel>
                  <FormControl>
                    <Input placeholder="Number of employees" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shiftsPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shifts per Day</FormLabel>
                  <FormControl>
                    <Input placeholder="Number of shifts" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workingDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Working Days</FormLabel>
                  <FormControl>
                    <Input placeholder="Days per week" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : factory ? "Update Factory" : "Create Factory"}
          </Button>
        </div>
      </form>
    </Form>
  );
}