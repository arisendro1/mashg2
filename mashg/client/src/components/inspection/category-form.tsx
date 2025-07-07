import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const categorySchema = z.object({
  category: z.enum(["treif", "issur", "g6", "kosher"], {
    required_error: "Please select a factory category",
  }),
  bishuYisrael: z.boolean(),
  afiyaYisrael: z.boolean(),
  chalavYisrael: z.boolean(),
  linatLaila: z.boolean(),
  kavush: z.boolean(),
  chadash: z.boolean(),
  hafrashChalla: z.boolean(),
  kashrutPesach: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function CategoryForm({ data, onUpdate, onNext }: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      category: data?.category || "kosher",
      bishuYisrael: data?.bishuYisrael || false,
      afiyaYisrael: data?.afiyaYisrael || false,
      chalavYisrael: data?.chalavYisrael || false,
      linatLaila: data?.linatLaila || false,
      kavush: data?.kavush || false,
      chadash: data?.chadash || false,
      hafrashChalla: data?.hafrashChalla || false,
      kashrutPesach: data?.kashrutPesach || false,
    },
  });

  const onSubmit = (formData: CategoryFormData) => {
    onUpdate({ ...data, ...formData });
    onNext();
  };

  const categories = [
    {
      value: "treif",
      label: "Treif Category",
      description: "Meat, seafood, non-kosher cheese, etc. - requires solutions for kosherization at every stage",
    },
    {
      value: "issur",
      label: "Issur Category", 
      description: "Non-kosher milk, wine, etc. - requires solutions for kosherization at every stage",
    },
    {
      value: "g6",
      label: "G6 Category",
      description: "Non-kosher products but don't make production lines treif",
    },
    {
      value: "kosher",
      label: "Kosher Factory",
      description: "All ingredients are kosher or G1",
    },
  ];

  const specialRequirements = [
    { key: "bishuYisrael", label: "Bishul Yisrael (Jewish Cooking)" },
    { key: "afiyaYisrael", label: "Afiya Yisrael (Jewish Baking)" },
    { key: "chalavYisrael", label: "Chalav Yisrael (Jewish Milk)" },
    { key: "linatLaila", label: "Linat Laila (Overnight Stay)" },
    { key: "kavush", label: "Kavush (Pickling)" },
    { key: "chadash", label: "Chadash (New Grain)" },
    { key: "hafrashChalla", label: "Hafrashat Challah (Challah Separation)" },
    { key: "kashrutPesach", label: "Kashrut Pesach (Passover Kosher)" },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-text-primary">
            Factory Category Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factory Category</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-3"
                      >
                        {categories.map((category) => (
                          <div key={category.value} className="flex items-start space-x-3 p-3 border rounded-lg bg-white">
                            <RadioGroupItem value={category.value} id={category.value} className="mt-1" />
                            <div className="flex-1">
                              <Label htmlFor={category.value} className="text-sm font-medium text-text-primary">
                                {category.label}
                              </Label>
                              <p className="text-xs text-text-secondary mt-1">
                                {category.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-base font-medium text-text-primary">
                  Special Requirements (if applicable)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {specialRequirements.map((requirement) => (
                    <FormField
                      key={requirement.key}
                      control={form.control}
                      name={requirement.key as keyof CategoryFormData}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-lg bg-white">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium text-text-primary">
                            {requirement.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                Continue to Photo Documentation
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
