import { cn } from "@/ui/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/primitives/card";
import { Separator } from "@/ui/primitives/separator";

/**
 * Step-based form section wrapper. Groups related form fields with a title.
 *
 * Usage in a multi-step form:
 *   <FormSection title="Personal Information" step={1} totalSteps={4}>
 *     <Input ... />
 *     <Input ... />
 *   </FormSection>
 *
 * @param {string} title - Section title
 * @param {string} description - Optional description
 * @param {number} step - Current step number (optional)
 * @param {number} totalSteps - Total number of steps (optional)
 * @param {React.ReactNode} children - Form fields
 * @param {string} className
 */
export default function FormSection({
  title,
  description,
  step,
  totalSteps,
  children,
  className,
}) {
  return (
    <Card className={cn("border-0 shadow-none sm:border sm:shadow-md", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {step && totalSteps && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-6 rounded-full transition-colors",
                    i + 1 <= step ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          )}
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">{children}</div>
      </CardContent>
    </Card>
  );
}
