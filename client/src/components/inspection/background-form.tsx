import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const backgroundSchema = z.object({
  currentProducts: z.string().min(1, "Current products description is required"),
  employeeCount: z.coerce.number().min(1, "Employee count is required"),
  shiftsPerDay: z.coerce.number().min(1, "Shifts per day is required"),
  workingDays: z.coerce.number().min(1, "Working days is required"),
  kashrut: z.enum(["yes", "no", "previous"], {
    required_error: "Please select kashrut status",
  }),
});

type BackgroundFormData = z.infer<typeof backgroundSchema>;

interface BackgroundFormProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function BackgroundForm({ data, onUpdate, onNext }: BackgroundFormProps) {
  const form = useForm<BackgroundFormData>({
    resolver: zodResolver(backgroundSchema),
    defaultValues: {
      currentProducts: data?.currentProducts || "",
      employeeCount: data?.employeeCount || 0,
      shiftsPerDay: data?.shiftsPerDay || 1,
      workingDays: data?.workingDays || 5,
      kashrut: data?.kashrut || "no",
    },
  });

  const onSubmit = (formData: BackgroundFormData) => {
    onUpdate({ ...data, ...formData });
    onNext();
  };

  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-text-primary">
          General Background
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentProducts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Products Currently Manufactured</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the products manufactured (include any meat, dairy, seafood, grape products, etc.)"
                      className="h-20"
                      {...field} 
                    />
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
                    <FormLabel>Number of Employees</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
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
                      <Input type="number" min="1" {...field} />
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
                    <FormLabel>Working Days per Week</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="7" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="kashrut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Kashrut Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="kashrut-yes" />
                        <Label htmlFor="kashrut-yes">Currently Kosher</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="kashrut-no" />
                        <Label htmlFor="kashrut-no">Not Currently Kosher</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="previous" id="kashrut-previous" />
                        <Label htmlFor="kashrut-previous">Previously Kosher</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Continue to Document Requirements
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
