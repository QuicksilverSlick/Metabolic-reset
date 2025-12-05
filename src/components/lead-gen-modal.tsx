import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, CheckCircle, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
const leadSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
});
type LeadForm = z.infer<typeof leadSchema>;
interface LeadGenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function LeadGenModal({ open, onOpenChange }: LeadGenModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LeadForm>({
    resolver: zodResolver(leadSchema)
  });
  const onSubmit = async (data: LeadForm) => {
    setIsLoading(true);
    // Simulate API call to GoHighLevel or similar
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Lead captured:', data);
    setIsLoading(false);
    setIsSuccess(true);
  };
  const handleClose = () => {
    onOpenChange(false);
    // Reset state after a delay so the user doesn't see it flash back
    setTimeout(() => {
      setIsSuccess(false);
      reset();
    }, 300);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold text-navy-900">
            {isSuccess ? "Check Your Inbox!" : "Get the Metabolic Checklist"}
          </DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "We've sent the free guide to your email. It should arrive in the next 5 minutes."
              : "Discover the 5 key markers of metabolic health that most doctors miss."}
          </DialogDescription>
        </DialogHeader>
        {isSuccess ? (
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-slate-600">
              While you wait, why not learn more about the 28 Day Reset challenge?
            </p>
            <Button onClick={handleClose} className="w-full bg-navy-900 text-white">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="lead-name">First Name</Label>
              <Input
                id="lead-name"
                placeholder="Jane"
                {...register('name')}
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead-email">Email Address</Label>
              <Input
                id="lead-email"
                type="email"
                placeholder="jane@example.com"
                {...register('email')}
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> Send Me the Guide
                </span>
              )}
            </Button>
            <p className="text-xs text-center text-slate-400 mt-2">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}