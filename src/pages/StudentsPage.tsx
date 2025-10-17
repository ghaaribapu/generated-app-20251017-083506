import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStore } from '@/lib/store';
import { Student } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FileDown, MoreHorizontal, Edit, KeyRound } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { exportToCSV } from '@/lib/csvExport';
const studentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
  joinDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
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
export default function StudentsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { students, instructorStudents, loading, fetchStudents, fetchStudentsForInstructor, addStudent, updateStudent, adminResetPassword } = useStore();
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const studentForm = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: '', email: '', joinDate: new Date().toISOString().split('T')[0], gender: 'Male', phone: '', googleMeetId: '' },
  });
  const passwordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });
  React.useEffect(() => {
    if (user?.role === 'Instructor' && user.id) {
      fetchStudentsForInstructor(user.id);
    } else if (user?.role === 'Admin') {
      fetchStudents();
    }
  }, [user, fetchStudents, fetchStudentsForInstructor]);
  const displayedStudents = React.useMemo(() => {
    return user?.role === 'Instructor' ? instructorStudents : students;
  }, [students, instructorStudents, user]);
  const isLoading = user?.role === 'Instructor' ? loading.instructorStudents : loading.students;
  React.useEffect(() => {
    if (selectedStudent && isFormDialogOpen) {
      studentForm.reset({
        ...selectedStudent,
        joinDate: new Date(selectedStudent.joinDate).toISOString().split('T')[0],
      });
    } else {
      studentForm.reset({ name: '', email: '', joinDate: new Date().toISOString().split('T')[0], gender: 'Male', phone: '', googleMeetId: '' });
    }
  }, [selectedStudent, isFormDialogOpen, studentForm]);
  const handleFormDialogOpen = (student: Student | null) => {
    setSelectedStudent(student);
    setIsFormDialogOpen(true);
  };
  const handleResetDialogOpen = (student: Student) => {
    setSelectedStudent(student);
    setIsResetDialogOpen(true);
  };
  const onStudentSubmit = async (values: z.infer<typeof studentSchema>) => {
    if (selectedStudent) {
      await updateStudent(selectedStudent.id, values);
    } else {
      const newStudentData = { ...values, avatarUrl: `https://i.pravatar.cc/150?u=${values.email}` };
      await addStudent(newStudentData);
    }
    setIsFormDialogOpen(false);
    setSelectedStudent(null);
  };
  const onPasswordSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (selectedStudent) {
      await adminResetPassword(selectedStudent.id, values.newPassword);
      setIsResetDialogOpen(false);
      setSelectedStudent(null);
      passwordForm.reset();
    }
  };
  const handleExport = () => {
    const dataToExport = displayedStudents.map(s => ({
      ID: s.id, Name: s.name, Email: s.email, CoursesEnrolled: s.coursesEnrolled,
      OverallProgress: s.overallProgress, JoinDate: s.joinDate, Gender: s.gender,
      Phone: s.phone, GoogleMeetID: s.googleMeetId,
    }));
    exportToCSV(dataToExport, 'students_report');
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('students.title')}</h1>
          <p className="text-muted-foreground">{t('students.description')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}><FileDown className="mr-2 h-4 w-4" />{t('students.export')}</Button>
          {user?.role === 'Admin' && <Button onClick={() => handleFormDialogOpen(null)}><PlusCircle className="mr-2 h-4 w-4" />{t('students.add_student')}</Button>}
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle>{t('students.table.title')}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('students.table.header.name')}</TableHead>
                <TableHead>{t('students.table.header.email')}</TableHead>
                <TableHead>{t('students.table.header.courses_enrolled')}</TableHead>
                <TableHead>{t('students.table.header.overall_progress')}</TableHead>
                <TableHead>{t('students.table.header.join_date')}</TableHead>
                {user?.role === 'Admin' && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    {user?.role === 'Admin' && <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>}
                  </TableRow>
                ))
              ) : (
                displayedStudents.map((student) => (
                  <TableRow key={student.id} className="group">
                    <TableCell className="cursor-pointer" onClick={() => navigate(`/students/${student.id}`)}>
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarImage src={student.profilePictureUrl || student.avatarUrl} alt={student.name} /><AvatarFallback>{student.name.charAt(0)}</AvatarFallback></Avatar>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => navigate(`/students/${student.id}`)}>{student.email}</TableCell>
                    <TableCell className="cursor-pointer" onClick={() => navigate(`/students/${student.id}`)}>{student.coursesEnrolled}</TableCell>
                    <TableCell className="cursor-pointer" onClick={() => navigate(`/students/${student.id}`)}>
                      <div className="flex items-center gap-2">
                        <Progress value={student.overallProgress} className="w-24" />
                        <span>{student.overallProgress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => navigate(`/students/${student.id}`)}>{new Date(student.joinDate).toLocaleDateString()}</TableCell>
                    {user?.role === 'Admin' && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleFormDialogOpen(student)}><Edit className="mr-2 h-4 w-4" />{t('instructors.actions.edit')}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetDialogOpen(student)}><KeyRound className="mr-2 h-4 w-4" />{t('students.actions.reset_password')}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
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
            <DialogTitle>{selectedStudent ? t('students.dialog.edit_title') : t('students.dialog.title')}</DialogTitle>
            <DialogDescription>{selectedStudent ? t('students.dialog.edit_desc') : t('students.dialog.description')}</DialogDescription>
          </DialogHeader>
          <Form {...studentForm}>
            <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
              <FormField control={studentForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t('students.dialog.form.name_label')}</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={studentForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>{t('students.dialog.form.email_label')}</FormLabel><FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={studentForm.control} name="gender" render={({ field }) => (<FormItem><FormLabel>{t('students.dialog.form.gender_label')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('students.dialog.form.gender_placeholder')} /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={studentForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>{t('students.dialog.form.phone_label')}</FormLabel><FormControl><Input placeholder="+1234567890" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={studentForm.control} name="googleMeetId" render={({ field }) => (<FormItem><FormLabel>{t('students.dialog.form.google_meet_id_label')}</FormLabel><FormControl><Input placeholder="your-meet-id" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={studentForm.control} name="joinDate" render={({ field }) => (<FormItem><FormLabel>{t('students.dialog.form.join_date_label')}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={studentForm.formState.isSubmitting}>{studentForm.formState.isSubmitting ? (selectedStudent ? t('instructors.form.saving') : t('students.dialog.form.adding')) : (selectedStudent ? t('instructors.form.save_button') : t('students.dialog.form.add_button'))}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('students.reset_dialog.title', { name: selectedStudent?.name })}</DialogTitle>
            <DialogDescription>{t('students.reset_dialog.description')}</DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (<FormItem><FormLabel>{t('settings.security.new_password_label')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>{t('settings.security.confirm_password_label')}</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>{passwordForm.formState.isSubmitting ? t('instructors.form.saving') : t('students.reset_dialog.submit_button')}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}