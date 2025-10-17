import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  profilePictureUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  phone: z.string().optional(),
  googleMeetId: z.string().optional(),
});
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
export default function SettingsPage() {
  const { t } = useLanguage();
  const { user: authUser, loading: authLoading, refetchUser } = useAuth();
  const { updateUser, changePassword } = useStore();
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", profilePictureUrl: "", phone: "", googleMeetId: "" },
  });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  useEffect(() => {
    if (authUser) {
      profileForm.reset({
        name: authUser.name,
        email: authUser.email,
        profilePictureUrl: authUser.profilePictureUrl || "",
        phone: authUser.phone || "",
        googleMeetId: authUser.googleMeetId || "",
      });
    }
  }, [authUser, profileForm]);
  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    await updateUser(values);
    await refetchUser();
  };
  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!authUser) return;
    try {
      await changePassword({ userId: authUser.id, ...values });
      passwordForm.reset();
    } catch (error) {
      // Error is handled in the store action
    }
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.description')}</p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold">{t('settings.profile.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('settings.profile.description')}</p>
        </div>
        <div className="md:col-span-2">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.profile.card_title')}</CardTitle>
                  <CardDescription>{t('settings.profile.card_description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {authLoading ? (
                    <>
                      <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                      <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                    </>
                  ) : (
                    <>
                      <FormField control={profileForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t('settings.profile.name_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={profileForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>{t('settings.profile.email_label')}</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={profileForm.control} name="profilePictureUrl" render={({ field }) => (<FormItem><FormLabel>{t('settings.profile.picture_url_label')}</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={profileForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>{t('settings.profile.phone_label')}</FormLabel><FormControl><Input placeholder="+1234567890" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={profileForm.control} name="googleMeetId" render={({ field }) => (<FormItem><FormLabel>{t('settings.profile.google_meet_id_label')}</FormLabel><FormControl><Input placeholder="your-meet-id" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={profileForm.formState.isSubmitting || authLoading}>
                    {profileForm.formState.isSubmitting ? t('settings.profile.saving_button') : t('settings.profile.save_button')}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </div>
      <Separator />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold">{t('settings.security.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('settings.security.description')}</p>
        </div>
        <div className="md:col-span-2">
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.security.card_title')}</CardTitle>
                  <CardDescription>{t('settings.security.card_description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (<FormItem><FormLabel>{t('settings.security.current_password_label')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (<FormItem><FormLabel>{t('settings.security.new_password_label')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>{t('settings.security.confirm_password_label')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                    {passwordForm.formState.isSubmitting ? t('settings.security.saving_button') : t('settings.security.save_button')}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}