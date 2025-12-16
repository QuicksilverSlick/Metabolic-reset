import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, AlertCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate, Link } from 'react-router-dom';
import { MarketingLayout } from '@/components/layout/MarketingLayout';
import { useLogin } from '@/hooks/use-queries';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await loginMutation.mutateAsync(data);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    }
  };

  const variants = {
    enter: { y: 20, opacity: 0 },
    center: { y: 0, opacity: 1 },
  };

  return (
    <MarketingLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <motion.div
            variants={variants}
            initial="enter"
            animate="center"
            transition={{ duration: 0.3 }}
          >
            <Card className="border-navy-700 bg-navy-800 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
                <CardDescription className="text-slate-400">
                  Sign in to continue your Metabolic Reset journey
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-300">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Login Failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-slate-200">
                      <Mail className="h-4 w-4 text-slate-400" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      {...register('email')}
                      className="bg-navy-900 border-navy-600 text-white placeholder:text-slate-500 focus:border-gold-500"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-slate-200">
                      <Phone className="h-4 w-4 text-slate-400" />
                      Mobile Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      {...register('phone')}
                      className="bg-navy-900 border-navy-600 text-white placeholder:text-slate-500 focus:border-gold-500"
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-xs">{errors.phone.message}</p>
                    )}
                    <p className="text-xs text-slate-500">
                      Enter the phone number you registered with
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                  <div className="text-center text-sm text-slate-400">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-gold-500 hover:text-gold-400 font-medium">
                      Register here
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </MarketingLayout>
  );
}
