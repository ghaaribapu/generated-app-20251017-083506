import * as React from 'react';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginFormValues = z.infer<typeof loginSchema>;
export default function LoginPage() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);
      navigate('/');
    } catch (error) {
      // Error is already handled by toast in auth context
    }
  };
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <GraduationCap className="h-10 w-10 text-primary" />
              <h1 className="text-3xl font-bold">{t('login.title')}</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              {t('login.description')}
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>{t('login.form_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('login.email_label')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="m@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('login.password_label')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? t('login.logging_in') : t('login.login_button')}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <div className="flex h-full w-full items-center justify-center bg-blue-900/10 p-10">
            <div className="text-white text-center max-w-md">
                <h2 className="text-4xl font-bold text-primary-foreground">Welcome to Zavia AI Academy</h2>
                <p className="mt-4 text-lg text-gray-300">The future of learning management. Streamline operations, empower educators, and inspire students.</p>
            </div>
        </div>
      </div>
    </div>
  );
}