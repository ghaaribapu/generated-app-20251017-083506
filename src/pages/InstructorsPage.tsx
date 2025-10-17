import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStore } from '@/lib/store';
import { Instructor } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FileDown, MoreHorizontal, Edit, Trash2, Video, KeyRound } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
const instructorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
  gender: z.enum(['Male', 'Female']),
  phone: z.string().optional(),
  googleMeetId: z.string().optional(),
});
const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
export default function InstructorsPage() {
  const { t } = useLanguage();
  const { instructors, loading, fetchInstructors, addInstructor, updateInstructor, deleteInstructor, adminResetPassword } = useStore();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const instructorForm = useForm<z.infer<typeof instructorSchema>>({
    resolver: zodResolver(instructorSchema),
    defaultValues: { name: '', email: '', gender: 'Male', phone: '', googleMeetId: '' },
  });
  const passwordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);
  useEffect(() => {
    if (selectedInstructor && isFormDialogOpen) {
      instructorForm.reset(selectedInstructor);
    } else {
      instructorForm.reset({ name: '', email: '', gender: 'Male', phone: '', googleMeetId: '' });
    }
  }, [selectedInstructor, isFormDialogOpen, instructorForm]);
  const handleFormDialogOpen = (instructor: Instructor | null) => {
    setSelectedInstructor(instructor);
    setIsFormDialogOpen(true);
  };
  const handleResetDialogOpen = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setIsResetDialogOpen(true);
  };
  const onInstructorSubmit = async (values: z.infer<typeof instructorSchema>) => {
    const instructorData = { ...values, avatarUrl: `https://i.pravatar.cc/150?u=${values.email}` };
    if (selectedInstructor) {
      await updateInstructor(selectedInstructor.id, instructorData);
    } else {
      await addInstructor(instructorData);
    }
    setIsFormDialogOpen(false);
    setSelectedInstructor(null);
  };
  const onPasswordSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (selectedInstructor) {
      await adminResetPassword(selectedInstructor.id, values.newPassword);
      setIsResetDialogOpen(false);
      setSelectedInstructor(null);
      passwordForm.reset();
    }
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('instructors.title')}</h1>
          <p className="text-muted-foreground">{t('instructors.description')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline"><FileDown className="mr-2 h-4 w-4" />{t('instructors.export')}</Button>
          <Button onClick={() => handleFormDialogOpen(null)}><PlusCircle className="mr-2 h-4 w-4" />{t('instructors.add_instructor')}</Button>
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>{t('instructors.table.title')}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('instructors.table.header.name')}</TableHead>
                <TableHead>{t('instructors.table.header.email')}</TableHead>
                <TableHead>{t('instructors.table.header.join_date')}</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading.instructors ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                instructors.map((instructor) => (
                  <TableRow key={instructor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarImage src={instructor.avatarUrl} alt={instructor.name} /><AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback></Avatar>
                        <span className="font-medium">{instructor.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{instructor.email}</TableCell>
                    <TableCell>{new Date(instructor.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleFormDialogOpen(instructor)}><Edit className="mr-2 h-4 w-4" />{t('instructors.actions.edit')}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetDialogOpen(instructor)}><KeyRound className="mr-2 h-4 w-4" />{t('instructors.actions.reset_password')}</DropdownMenuItem>
                            <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />{t('instructors.actions.delete')}</DropdownMenuItem></AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('instructors.delete_confirm.title')}</AlertDialogTitle>
                            <AlertDialogDescription>{t('instructors.delete_confirm.description', { name: instructor.name })}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('instructors.delete_confirm.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteInstructor(instructor.id)} className="bg-destructive hover:bg-destructive/90">{t('instructors.actions.delete')}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedInstructor ? t('instructors.dialog.edit_title') : t('instructors.dialog.add_title')}</DialogTitle>
            <DialogDescription>{selectedInstructor ? t('instructors.dialog.edit_desc') : t('instructors.dialog.add_desc')}</DialogDescription>
          </DialogHeader>
          <Form {...instructorForm}>
            <form onSubmit={instructorForm.handleSubmit(onInstructorSubmit)} className="space-y-4">
              <FormField control={instructorForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t('instructors.form.name_label')}</FormLabel><FormControl><Input placeholder="Ghaarib Khurshid" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={instructorForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>{t('instructors.form.email_label')}</FormLabel><FormControl><Input type="email" placeholder="ghaarib.k@zavia.ai" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={instructorForm.control} name="gender" render={({ field }) => (<FormItem><FormLabel>{t('instructors.form.gender_label')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('instructors.form.gender_placeholder')} /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={instructorForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>{t('instructors.form.phone_label')}</FormLabel><FormControl><Input placeholder="+1234567890" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={instructorForm.control} name="googleMeetId" render={({ field }) => (<FormItem><FormLabel>{t('instructors.form.google_meet_id_label')}</FormLabel><FormControl><Input placeholder="your-meet-id" {...field} /></FormControl>{selectedInstructor && field.value && (<div className="pt-2"><Button asChild size="sm" variant="outline"><a href={`https://meet.google.com/${field.value}`} target="_blank" rel="noopener noreferrer"><Video className="mr-2 h-4 w-4" /> {t('instructors.start_meet')}</a></Button></div>)}<FormMessage /></FormItem>)} />
              <Button type="submit" disabled={instructorForm.formState.isSubmitting}>{instructorForm.formState.isSubmitting ? t('instructors.form.saving') : t('instructors.form.save_button')}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('instructors.reset_dialog.title', { name: selectedInstructor?.name })}</DialogTitle>
            <DialogDescription>{t('instructors.reset_dialog.description')}</DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (<FormItem><FormLabel>{t('settings.security.new_password_label')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>{t('settings.security.confirm_password_label')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>{passwordForm.formState.isSubmitting ? t('instructors.form.saving') : t('instructors.reset_dialog.submit_button')}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}