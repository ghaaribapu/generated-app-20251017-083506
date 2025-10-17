import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { CourseModule, CourseContent, SubTopic } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, User, Calendar, Users, PlusCircle, MoreHorizontal, Check, ChevronsUpDown, Edit, Trash2, FileText, Link as LinkIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription as FormDesc, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const moduleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});
type ModuleFormValues = z.infer<typeof moduleSchema>;
const contentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  contentType: z.enum(['text', 'url']),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
});
type ContentFormValues = z.infer<typeof contentSchema>;
const subTopicSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
});
type SubTopicFormValues = z.infer<typeof subTopicSchema>;
const ModuleAccordionContent = ({ module, canManageCourse }: { module: CourseModule, canManageCourse: boolean }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();
  const [isSubTopicDialogOpen, setIsSubTopicDialogOpen] = React.useState(false);
  const [editingSubTopic, setEditingSubTopic] = React.useState<SubTopic | null>(null);
  const moduleSubTopics = useStore((state) => state.moduleSubTopics);
  const loading = useStore((state) => state.loading);
  const studentProgress = useStore((state) => state.studentProgress);
  const courseProgress = useStore((state) => state.courseProgress);
  const fetchSubTopicsForModule = useStore((state) => state.fetchSubTopicsForModule);
  const addSubTopic = useStore((state) => state.addSubTopic);
  const updateSubTopic = useStore((state) => state.updateSubTopic);
  const deleteSubTopic = useStore((state) => state.deleteSubTopic);
  const updateSubTopicProgress = useStore((state) => state.updateSubTopicProgress);
  const subTopics = moduleSubTopics[module.id] || [];
  const subTopicForm = useForm<SubTopicFormValues>({ resolver: zodResolver(subTopicSchema), defaultValues: { title: '', description: '' } });
  React.useEffect(() => {
    fetchSubTopicsForModule(module.id);
  }, [module.id, fetchSubTopicsForModule]);
  React.useEffect(() => {
    if (editingSubTopic) subTopicForm.reset(editingSubTopic);
    else subTopicForm.reset({ title: '', description: '' });
  }, [editingSubTopic, subTopicForm]);
  const handleSubTopicDialogOpen = (subTopic: SubTopic | null) => {
    setEditingSubTopic(subTopic);
    setIsSubTopicDialogOpen(true);
  };
  const onSubTopicSubmit = async (values: SubTopicFormValues) => {
    if (editingSubTopic) {
      await updateSubTopic(editingSubTopic.id, values);
    } else {
      await addSubTopic(module.id, values);
    }
    setIsSubTopicDialogOpen(false);
  };
  const handleProgressChange = (subTopicId: string, checked: boolean) => {
    if (user && courseId) {
      updateSubTopicProgress(user.id, courseId, subTopicId, checked);
    }
  };
  const completedSubTopics = studentProgress?.[courseId ?? ''] || [];
  return (
    <AccordionContent>
      <p className="mb-4 text-sm text-muted-foreground">{module.description}</p>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{t('course_detail.sub_topics')}</h4>
        {canManageCourse && <Button size="sm" variant="outline" onClick={() => handleSubTopicDialogOpen(null)}><PlusCircle className="mr-2 h-4 w-4" />{t('course_detail.add_sub_topic')}</Button>}
      </div>
      <div className="space-y-2">
        {loading.moduleSubTopics && !subTopics.length ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          subTopics.map((subTopic) => {
            const progressInfo = courseProgress?.[subTopic.id];
            const completionPercent = progressInfo && progressInfo.total > 0 ? (progressInfo.completed / progressInfo.total) * 100 : 0;
            return (
              <div key={subTopic.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`subtopic-${subTopic.id}`}
                    disabled={user?.role === 'Student'}
                    checked={completedSubTopics.includes(subTopic.id)}
                    onCheckedChange={(checked) => handleProgressChange(subTopic.id, !!checked)}
                  />
                  <label htmlFor={`subtopic-${subTopic.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {subTopic.title}
                  </label>
                  {canManageCourse && progressInfo && (
                    <Badge variant="secondary">{t('course_detail.progress_percent', { percent: completionPercent.toFixed(0) })}</Badge>
                  )}
                </div>
                {canManageCourse && (
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleSubTopicDialogOpen(subTopic)}><Edit className="mr-2 h-4 w-4" />{t('course_detail.edit_sub_topic')}</DropdownMenuItem>
                        <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />{t('course_detail.delete_sub_topic')}</DropdownMenuItem></AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('course_detail.delete_sub_topic_confirm.title')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('course_detail.delete_sub_topic_confirm.description', { title: subTopic.title })}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('course_detail.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteSubTopic(subTopic.id)} className="bg-destructive hover:bg-destructive/90">{t('course_detail.delete_sub_topic')}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            );
          })
        )}
      </div>
      <Dialog open={isSubTopicDialogOpen} onOpenChange={setIsSubTopicDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubTopic ? t('course_detail.edit_sub_topic_dialog.title') : t('course_detail.add_sub_topic_dialog.title')}</DialogTitle>
            <DialogDescription>{editingSubTopic ? t('course_detail.edit_sub_topic_dialog.description') : t('course_detail.add_sub_topic_dialog.description')}</DialogDescription>
          </DialogHeader>
          <Form {...subTopicForm}><form onSubmit={subTopicForm.handleSubmit(onSubTopicSubmit)} className="space-y-4"><FormField control={subTopicForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>{t('course_detail.sub_topic_form.title_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={subTopicForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>{t('course_detail.sub_topic_form.description_label')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="submit" disabled={subTopicForm.formState.isSubmitting}>{subTopicForm.formState.isSubmitting ? t('course_detail.sub_topic_form.saving') : t('course_detail.sub_topic_form.save_button')}</Button></form></Form>
        </DialogContent>
      </Dialog>
    </AccordionContent>
  );
};
export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = React.useState(false);
  const [isModuleDialogOpen, setIsModuleDialogOpen] = React.useState(false);
  const [isContentDialogOpen, setIsContentDialogOpen] = React.useState(false);
  const [editingModule, setEditingModule] = React.useState<CourseModule | null>(null);
  const [editingContent, setEditingContent] = React.useState<CourseContent | null>(null);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [isComboboxOpen, setIsComboboxOpen] = React.useState(false);
  const {
    currentCourse, courseModules, courseContent, courseStudents, students: allStudents, loading,
    fetchCourseById, fetchModulesForCourse, fetchCourseContent, fetchStudentsForCourse, fetchStudents,
    enrollStudentInCourse, unenrollStudentFromCourse,
    addModule, updateModule, deleteModule,
    addCourseContent, updateCourseContent, deleteCourseContent,
    fetchStudentProgress, fetchCourseProgress
  } = useStore();
  const moduleForm = useForm<ModuleFormValues>({ resolver: zodResolver(moduleSchema), defaultValues: { title: '', description: '' } });
  const contentForm = useForm<ContentFormValues>({ resolver: zodResolver(contentSchema), defaultValues: { title: '', contentType: 'text', content: '' } });
  const contentType = contentForm.watch('contentType');
  React.useEffect(() => {
    if (courseId) {
      fetchCourseById(courseId);
      fetchModulesForCourse(courseId);
      fetchCourseContent(courseId);
      fetchStudentsForCourse(courseId);
      fetchStudents();
      if (user?.role === 'Student' && user.id) {
        fetchStudentProgress(user.id);
      }
      if (user?.role === 'Admin' || user?.role === 'Instructor') {
        fetchCourseProgress(courseId);
      }
    }
  }, [courseId, user, fetchCourseById, fetchModulesForCourse, fetchCourseContent, fetchStudentsForCourse, fetchStudents, fetchStudentProgress, fetchCourseProgress]);
  React.useEffect(() => {
    if (editingModule) moduleForm.reset(editingModule);
    else moduleForm.reset({ title: '', description: '' });
  }, [editingModule, moduleForm]);
  React.useEffect(() => {
    if (editingContent) contentForm.reset(editingContent);
    else contentForm.reset({ title: '', contentType: 'text', content: '' });
  }, [editingContent, contentForm]);
  const unenrolledStudents = React.useMemo(() => {
    const enrolledIds = new Set(courseStudents.map((s) => s.id));
    return allStudents.filter((s) => !enrolledIds.has(s.id));
  }, [allStudents, courseStudents]);
  const handleEnroll = async () => {
    if (courseId && selectedStudentId) {
      await enrollStudentInCourse(courseId, selectedStudentId);
      setSelectedStudentId(null);
      setIsEnrollDialogOpen(false);
    }
  };
  const handleUnenroll = async (studentId: string) => {
    if (courseId) await unenrollStudentFromCourse(courseId, studentId);
  };
  const handleModuleDialogOpen = (module: CourseModule | null) => {
    setEditingModule(module);
    setIsModuleDialogOpen(true);
  };
  const onModuleSubmit = async (values: ModuleFormValues) => {
    if (!courseId) return;
    const moduleData = { ...values, content: '...' };
    if (editingModule) await updateModule(editingModule.id, moduleData);
    else await addModule(courseId, moduleData);
    setIsModuleDialogOpen(false);
  };
  const handleContentDialogOpen = (content: CourseContent | null) => {
    setEditingContent(content);
    setIsContentDialogOpen(true);
  };
  const onContentSubmit = async (values: ContentFormValues) => {
    if (!courseId) return;
    if (editingContent) await updateCourseContent(editingContent.id, values);
    else await addCourseContent(courseId, values);
    setIsContentDialogOpen(false);
  };
  if (loading.currentCourse && !currentCourse) return <p>Loading...</p>;
  if (!currentCourse) return <p>Course not found.</p>;
  const canManageCourse = user?.role === 'Admin' || user?.id === currentCourse.instructorId;
  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/courses"><ArrowLeft className="mr-2 h-4 w-4" /> {t('course_detail.back_to_courses')}</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{currentCourse.title}</h1>
        <p className="text-muted-foreground mt-1">{currentCourse.description}</p>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <Tabs defaultValue="modules">
            <TabsList>
              <TabsTrigger value="modules">{t('course_detail.tabs.modules')}</TabsTrigger>
              <TabsTrigger value="content">{t('course_detail.tabs.content')}</TabsTrigger>
              <TabsTrigger value="students">{t('course_detail.tabs.enrolled_students')}</TabsTrigger>
            </TabsList>
            <TabsContent value="modules" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t('course_detail.modules_title')}</CardTitle>
                  <CardDescription>{t('course_detail.modules_description')}</CardDescription>
                </div>
                {canManageCourse && <Button size="sm" onClick={() => handleModuleDialogOpen(null)}><PlusCircle className="mr-2 h-4 w-4" />{t('course_detail.add_module')}</Button>}
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {(courseModules[courseId ?? ''] || []).map((module) => (
                    <AccordionItem value={module.id} key={module.id}>
                      <div className="flex items-center justify-between w-full">
                        <AccordionTrigger className="flex-1">{module.title}</AccordionTrigger>
                        {canManageCourse && (
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleModuleDialogOpen(module)}><Edit className="mr-2 h-4 w-4" />{t('course_detail.edit_module')}</DropdownMenuItem>
                                <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />{t('course_detail.delete_module')}</DropdownMenuItem></AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('course_detail.delete_module_confirm.title')}</AlertDialogTitle>
                                <AlertDialogDescription>{t('course_detail.delete_module_confirm.description', { title: module.title })}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('course_detail.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteModule(module.id)} className="bg-destructive hover:bg-destructive/90">{t('course_detail.delete_module')}</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                      <ModuleAccordionContent module={module} canManageCourse={canManageCourse} />
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
            <TabsContent value="content" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t('course_detail.content_title')}</CardTitle>
                    <CardDescription>{t('course_detail.content_description')}</CardDescription>
                  </div>
                  {canManageCourse && <Button size="sm" onClick={() => handleContentDialogOpen(null)}><PlusCircle className="mr-2 h-4 w-4" />{t('course_detail.add_content')}</Button>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courseContent.map(content => (
                      <Card key={content.id}>
                        <CardHeader className="flex flex-row items-start justify-between">
                          <div className="flex items-center gap-3">
                            {content.contentType === 'text' ? <FileText className="h-5 w-5 text-primary" /> : <LinkIcon className="h-5 w-5 text-primary" />}
                            <div>
                              <CardTitle className="text-base">{content.title}</CardTitle>
                            </div>
                          </div>
                          {canManageCourse && (
                            <AlertDialog>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleContentDialogOpen(content)}><Edit className="mr-2 h-4 w-4" />{t('course_detail.edit_content')}</DropdownMenuItem>
                                  <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />{t('course_detail.delete_content')}</DropdownMenuItem></AlertDialogTrigger>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('course_detail.delete_content_confirm.title')}</AlertDialogTitle>
                                  <AlertDialogDescription>{t('course_detail.delete_content_confirm.description', { title: content.title })}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('course_detail.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteCourseContent(content.id)} className="bg-destructive hover:bg-destructive/90">{t('course_detail.delete_content')}</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </CardHeader>
                        <CardContent>
                          {content.contentType === 'text' ? (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content.content}</p>
                          ) : (
                            <a href={content.content} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-2">
                              {content.content} <LinkIcon className="h-4 w-4" />
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="students" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t('course_detail.enrolled_students_title')}</CardTitle>
                    <CardDescription>{t('course_detail.enrolled_students_desc')}</CardDescription>
                  </div>
                  {canManageCourse && (
                    <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
                      <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />{t('course_detail.enroll_student')}</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t('course_detail.enroll_student_dialog_title')}</DialogTitle>
                          <DialogDescription>{t('course_detail.enroll_student_dialog_desc')}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" role="combobox" aria-expanded={isComboboxOpen} className="w-full justify-between">
                                {selectedStudentId ? unenrolledStudents.find((s) => s.id === selectedStudentId)?.name : t('course_detail.select_student')}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput placeholder={t('course_detail.search_student')} />
                                <CommandList>
                                  <CommandEmpty>{t('course_detail.no_student_found')}</CommandEmpty>
                                  <CommandGroup>
                                    {unenrolledStudents.map((student) => (
                                      <CommandItem key={student.id} value={student.name} onSelect={() => { setSelectedStudentId(student.id); setIsComboboxOpen(false); }}>
                                        <Check className={cn("mr-2 h-4 w-4", selectedStudentId === student.id ? "opacity-100" : "opacity-0")} />
                                        {student.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <Button onClick={handleEnroll} disabled={!selectedStudentId}>{t('course_detail.enroll_button')}</Button>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>{t('students.table.header.name')}</TableHead><TableHead>{t('students.table.header.email')}</TableHead><TableHead>{t('students.table.header.join_date')}</TableHead>{canManageCourse && <TableHead className="text-right">{t('course_detail.actions')}</TableHead>}</TableRow></TableHeader>
                    <TableBody>
                      {courseStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarImage src={student.profilePictureUrl || student.avatarUrl} alt={student.name} /><AvatarFallback>{student.name.charAt(0)}</AvatarFallback></Avatar><span className="font-medium">{student.name}</span></div></TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{new Date(student.joinDate).toLocaleDateString()}</TableCell>
                          {canManageCourse && (
                            <TableCell className="text-right">
                              <AlertDialog>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50">{t('course_detail.unenroll')}</DropdownMenuItem></AlertDialogTrigger>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t('course_detail.unenroll_confirm_title')}</AlertDialogTitle>
                                    <AlertDialogDescription>{t('course_detail.unenroll_confirm_desc', { studentName: student.name, courseName: currentCourse.title })}</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t('course_detail.cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleUnenroll(student.id)} className="bg-destructive hover:bg-destructive/90">{t('course_detail.unenroll')}</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>{t('course_detail.course_details')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{currentCourse.instructor?.name}</span></div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{currentCourse.enrolled} {t('course_detail.students_enrolled')}</span></div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{t('course_detail.next_class')}: {currentCourse.nextClass}</span></div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>{t('course_detail.progress')}</span>
                  <Badge className={currentCourse.status === 'On Track' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}>{currentCourse.status}</Badge>
                </div>
                <Progress value={currentCourse.progress} />
                <span className="text-xs text-muted-foreground">{currentCourse.progress}% {t('course_detail.complete')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? t('course_detail.edit_module_dialog.title') : t('course_detail.add_module_dialog.title')}</DialogTitle>
            <DialogDescription>{editingModule ? t('course_detail.edit_module_dialog.description') : t('course_detail.add_module_dialog.description')}</DialogDescription>
          </DialogHeader>
          <Form {...moduleForm}><form onSubmit={moduleForm.handleSubmit(onModuleSubmit)} className="space-y-4"><FormField control={moduleForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>{t('course_detail.module_form.title_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={moduleForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>{t('course_detail.module_form.description_label')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="submit" disabled={moduleForm.formState.isSubmitting}>{moduleForm.formState.isSubmitting ? t('course_detail.module_form.saving') : t('course_detail.module_form.save_button')}</Button></form></Form>
        </DialogContent>
      </Dialog>
      <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingContent ? t('course_detail.edit_content_dialog.title') : t('course_detail.add_content_dialog.title')}</DialogTitle>
            <DialogDescription>{editingContent ? t('course_detail.edit_content_dialog.description') : t('course_detail.add_content_dialog.description')}</DialogDescription>
          </DialogHeader>
          <Form {...contentForm}><form onSubmit={contentForm.handleSubmit(onContentSubmit)} className="space-y-4">
            <FormField control={contentForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>{t('course_detail.content_form.title_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={contentForm.control} name="contentType" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('course_detail.content_form.type_label')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder={t('course_detail.content_form.type_placeholder')} /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="text">{t('course_detail.content_form.type_text')}</SelectItem>
                    <SelectItem value="url">{t('course_detail.content_form.type_url')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={contentForm.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>{contentType === 'text' ? t('course_detail.content_form.content_label') : t('course_detail.content_form.url_label')}</FormLabel>
                <FormControl>
                  {contentType === 'text' ? <Textarea rows={8} {...field} /> : <Input placeholder="https://example.com/resource.pdf" {...field} />}
                </FormControl>
                {contentType === 'url' && <FormDesc className="text-xs">{t('course_detail.content_form.url_desc')}</FormDesc>}
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={contentForm.formState.isSubmitting}>{contentForm.formState.isSubmitting ? t('course_detail.content_form.saving') : t('course_detail.content_form.save_button')}</Button>
          </form></Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}