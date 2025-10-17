import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStore } from '@/lib/store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FileDown, MoreHorizontal, Trash2 } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { exportToCSV } from '@/lib/csvExport';
const courseSchema = z.object({
  id: z.string().startsWith('ZAI-', { message: "Course ID must start with 'ZAI-'" }).min(5, 'Course ID must be at least 5 characters'),
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  instructorId: z.string().min(1, 'Instructor is required'),
});
export default function CoursesPage() {
  const { t } = useLanguage();
  const { role } = useAuth();
  const navigate = useNavigate();
  const courses = useStore((state) => state.courses);
  const loading = useStore((state) => state.loading.courses);
  const { fetchCourses, addCourse, deleteCourse } = useStore();
  const instructors = useStore((state) => state.instructors);
  const fetchInstructors = useStore((state) => state.fetchInstructors);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      id: '',
      title: '',
      instructorId: '',
    },
  });
  React.useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, [fetchCourses, fetchInstructors]);
  React.useEffect(() => {
    if (isDialogOpen) {
      // Generate a new default ID when the dialog opens for creation
      const defaultId = `ZAI-${String(courses.length + 1).padStart(3, '0')}`;
      form.reset({
        id: defaultId,
        title: '',
        instructorId: '',
      });
    }
  }, [isDialogOpen, courses.length, form]);
  const onSubmit = async (values: z.infer<typeof courseSchema>) => {
    await addCourse(values);
    form.reset();
    setIsDialogOpen(false);
  };
  const handleExport = () => {
    const dataToExport = courses.map(c => ({
      ID: c.id,
      Title: c.title,
      Instructor: c.instructor?.name || 'N/A',
      Enrolled: c.enrolled,
      Progress: c.progress,
      Status: c.status,
      NextClass: c.nextClass,
    }));
    exportToCSV(dataToExport, 'courses_report');
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('courses.title')}</h1>
          <p className="text-muted-foreground">{t('courses.description')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            {t('courses.export')}
          </Button>
          {role === 'Admin' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('courses.add_course')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('courses.dialog.title')}</DialogTitle>
                  <DialogDescription>{t('courses.dialog.description')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('courses.dialog.form.id_label')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('courses.dialog.form.id_placeholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('courses.dialog.form.title_label')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('courses.dialog.form.title_placeholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="instructorId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('courses.table.header.instructor')}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('courses.dialog.form.instructor_placeholder')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {instructors.map((instructor) => (
                                <SelectItem key={instructor.id} value={instructor.id}>
                                  {instructor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? t('courses.dialog.form.creating') : t('courses.dialog.form.create_button')}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('courses.table.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('courses.table.header.course_title')}</TableHead>
                <TableHead>{t('courses.table.header.instructor')}</TableHead>
                <TableHead>{t('courses.table.header.enrolled')}</TableHead>
                <TableHead>{t('courses.table.header.progress')}</TableHead>
                <TableHead>{t('courses.table.header.status')}</TableHead>
                <TableHead>{t('courses.table.header.next_class')}</TableHead>
                {role === 'Admin' && <TableHead className="text-right">{t('course_detail.actions')}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    {role === 'Admin' && <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>}
                  </TableRow>
                ))
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-muted/50 group">
                    <TableCell className="font-medium cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>{course.title} ({course.id})</TableCell>
                    <TableCell className="cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>{course.instructor?.name || 'N/A'}</TableCell>
                    <TableCell className="cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>{course.enrolled}</TableCell>
                    <TableCell className="cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>
                      <div className="flex items-center gap-2">
                        <Progress value={course.progress} className="w-24" />
                        <span>{course.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>
                      <Badge
                        className={
                          course.status === 'On Track'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : course.status === 'At Risk'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                            : ''
                        }
                      >
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>{course.nextClass}</TableCell>
                    {role === 'Admin' && (
                      <TableCell className="text-right">
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t('courses.delete_course')}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('courses.delete_confirm_title')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('courses.delete_confirm_desc', { courseName: course.title })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('course_detail.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteCourse(course.id)} className="bg-destructive hover:bg-destructive/90">
                                {t('courses.delete_course')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}