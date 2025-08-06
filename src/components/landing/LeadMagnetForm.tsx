import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LeadMagnetFormProps {
  title: string;
  ctaText: string;
  fields: {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
  }[];
  onSubmit: (data: Record<string, string>) => void;
}

const LeadMagnetForm: React.FC<LeadMagnetFormProps> = ({
  title,
  ctaText,
  fields,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    const requiredFields = fields.filter(field => field.name !== 'demo');
    const missingFields = requiredFields.filter(field => !formData[field.name]?.trim());

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
      setIsSubmitted(true);
      toast({
        title: "Success!",
        description: "Your partnership guide is being prepared. Check your email!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Partnership Guide Sent!
        </h3>
        <p className="text-muted-foreground mb-4">
          Check your email for the {title} Partnership Guide and next steps.
        </p>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => {
            // Re-trigger download in case it didn't work
            const pdfMap: Record<string, string> = {
              'Colleges': '/partnership-guides/college-partnership-guide.pdf',
              'Companies': '/partnership-guides/corporate-partnership-guide.pdf',
              'Sports Teams': '/partnership-guides/sports-partnership-guide.pdf'
            };
            
            const pdfUrl = pdfMap[title];
            if (pdfUrl) {
              const link = document.createElement('a');
              link.href = pdfUrl;
              link.download = `${title.toLowerCase().replace(' ', '-')}-partnership-guide.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }}
        >
          <Download className="h-4 w-4" />
          Download Backup Copy
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name} className="text-sm font-medium text-foreground">
            {field.label}
          </Label>
          {field.type === 'checkbox' ? (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={field.name}
                checked={formData[field.name] === 'true'}
                onChange={(e) => handleInputChange(field.name, e.target.checked.toString())}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label htmlFor={field.name} className="text-sm text-muted-foreground">
                {field.placeholder}
              </Label>
            </div>
          ) : (
            <Input
              id={field.name}
              type={field.type || 'text'}
              placeholder={field.placeholder}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.name !== 'demo'}
              className="w-full"
            />
          )}
        </div>
      ))}
      
      <Button 
        type="submit" 
        variant="spiritual" 
        size="lg" 
        className="w-full mt-6"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending...' : ctaText}
        <Download className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
};

export default LeadMagnetForm;