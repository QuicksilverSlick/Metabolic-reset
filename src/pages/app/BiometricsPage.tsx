import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { useSubmitBiometrics } from '@/hooks/use-queries';
import imageCompression from 'browser-image-compression';
const biometricsSchema = z.object({
  weight: z.string().min(1, "Weight is required"),
  bodyFat: z.string().min(1, "Body Fat % is required"),
  visceralFat: z.string().min(1, "Visceral Fat is required"),
  leanMass: z.string().min(1, "Lean Mass is required"),
  metabolicAge: z.string().min(1, "Metabolic Age is required"),
});
type BiometricsForm = z.infer<typeof biometricsSchema>;
export function BiometricsPage() {
  const navigate = useNavigate();
  const submitMutation = useSubmitBiometrics();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<BiometricsForm>({
    resolver: zodResolver(biometricsSchema)
  });
  const onSubmit = async (data: BiometricsForm) => {
    if (!file) {
      alert("Please upload a screenshot of your scale app.");
      return;
    }
    setIsProcessing(true);
    try {
      // Compress image
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);
      // Convert to Base64
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Submit
        submitMutation.mutate({
          weekNumber: 1, // Hardcoded for Phase 1/2/3, dynamic later
          weight: parseFloat(data.weight),
          bodyFat: parseFloat(data.bodyFat),
          visceralFat: parseFloat(data.visceralFat),
          leanMass: parseFloat(data.leanMass),
          metabolicAge: parseFloat(data.metabolicAge),
          screenshotUrl: base64data // Sending base64 directly for now
        }, {
          onSuccess: () => {
            setIsSuccess(true);
            setIsProcessing(false);
          },
          onError: () => {
            setIsProcessing(false);
          }
        });
      };
    } catch (error) {
      console.error('Compression failed', error);
      setIsProcessing(false);
    }
  };
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-navy-900 mb-4">Submission Received!</h2>
        <p className="text-slate-600 mb-8">
          You have successfully logged your biometrics for this week. Come back next week to track your progress.
        </p>
        <Button onClick={() => navigate('/app')} className="bg-navy-900 text-white">
          Return to Dashboard
        </Button>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">Weekly Weigh-In</h1>
        <p className="text-slate-500">
          Step on your smart scale, take a screenshot of the app, and enter the 5 key numbers below.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Biometric Data</CardTitle>
            <CardDescription>Enter values exactly as they appear on your scale.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input id="weight" type="number" step="0.1" placeholder="0.0" {...register('weight')} />
              {errors.weight && <p className="text-red-500 text-xs">{errors.weight.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyFat">Body Fat (%)</Label>
              <Input id="bodyFat" type="number" step="0.1" placeholder="0.0" {...register('bodyFat')} />
              {errors.bodyFat && <p className="text-red-500 text-xs">{errors.bodyFat.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="visceralFat">Visceral Fat</Label>
              <Input id="visceralFat" type="number" step="0.5" placeholder="0" {...register('visceralFat')} />
              {errors.visceralFat && <p className="text-red-500 text-xs">{errors.visceralFat.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="leanMass">Muscle Mass (lbs)</Label>
              <Input id="leanMass" type="number" step="0.1" placeholder="0.0" {...register('leanMass')} />
              {errors.leanMass && <p className="text-red-500 text-xs">{errors.leanMass.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="metabolicAge">Metabolic Age</Label>
              <Input id="metabolicAge" type="number" placeholder="0" {...register('metabolicAge')} />
              {errors.metabolicAge && <p className="text-red-500 text-xs">{errors.metabolicAge.message}</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Proof of Weigh-In</CardTitle>
            <CardDescription>Upload a screenshot from your smart scale app.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                  <Upload className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-navy-900">
                    {file ? file.name : "Click to upload screenshot"}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {file ? "File selected" : "JPG or PNG up to 5MB"}
                  </p>
                </div>
              </div>
            </div>
            {!file && (
              <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Required</AlertTitle>
                <AlertDescription>
                  You must upload a screenshot to verify your data.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isProcessing}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-full shadow-lg"
          >
            {isProcessing ? <><Loader2 className="animate-spin mr-2" /> Uploading...</> : 'Submit Data (+25 Pts)'}
          </Button>
        </div>
      </form>
    </div>
  );
}