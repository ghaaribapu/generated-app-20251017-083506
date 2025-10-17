import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Calendar, BookOpen, BrainCircuit, Lightbulb, Trash2, Phone, Video, User as UserIcon, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CourseCurriculum } from '@/components/CourseCurriculum';
const noteSchema = z.object({
  content: z.string().min(10, 'Note must be at least 10 characters.')
});
type NoteFormValues = z.infer<typeof noteSchema>;
export default function StudentDetailPage() {
  const { studentId } = useParams<{studentId: string;}>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const {
    currentStudent, studentCourses, currentStudentPrediction, ideas, studentNotes, loading,
    fetchStudentById, fetchCoursesForStudent, fetchAIPrediction, fetchIdeas, deleteIdea,
    fetchNotesForStudent, addNoteForStudent, deleteNote, fetchStudentProgress
  } = useStore();
  const noteForm = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { content: '' }
  });
  React.useEffect(() => {
    if (studentId) {
      fetchStudentById(studentId);
      fetchCoursesForStudent(studentId);
      fetchAIPrediction(studentId);
      fetchIdeas();
      fetchNotesForStudent(studentId);
      fetchStudentProgress(studentId);
    }
  }, [studentId, fetchStudentById, fetchCoursesForStudent, fetchAIPrediction, fetchIdeas, fetchNotesForStudent, fetchStudentProgress]);
  const studentIdeas = React.useMemo(() => {
    return ideas.filter((idea) => idea.studentId === studentId);
  }, [ideas, studentId]);
  const onNoteSubmit = async (values: NoteFormValues) => {
    if (user && studentId) {
      await addNoteForStudent(studentId, { content: values.content, authorId: user.id });
      noteForm.reset();
    }
  };
  if (loading.currentStudent && !currentStudent) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1"><Skeleton className="h-64 w-full" /></div>
          <div className="md:col-span-2"><Skeleton className="h-80 w-full" /></div>
        </div>
      </div>);
  }
  if (!currentStudent) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">{t('student_detail.not_found_title')}</h2>
        <p className="text-muted-foreground mt-2">{t('student_detail.not_found_desc')}</p>
        <Button asChild className="mt-4"><Link to="/students">{t('student_detail.back_to_students')}</Link></Button>
      </div>);
  }
  const canManageNotes = user?.role === 'Admin' || user?.role === 'Instructor';
  const canManageProgress = user?.role === 'Admin' || user?.role === 'Instructor';
  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-4"><Link to="/students"><ArrowLeft className="mr-2 h-4 w-4" /> {t('student_detail.back_to_students')}</Link></Button>
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20"><AvatarImage src={currentStudent.avatarUrl} alt={currentStudent.name} /><AvatarFallback>{currentStudent.name.charAt(0)}</AvatarFallback></Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{currentStudent.name}</h1>
            <p className="text-muted-foreground">{currentStudent.email}</p>
          </div>
        </div>
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('student_detail.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="courses">{t('student_detail.tabs.enrolled_courses')}</TabsTrigger>
          <TabsTrigger value="ai_insights">{t('student_detail.tabs.ai_insights')}</TabsTrigger>
          <TabsTrigger value="ideas">{t('student_detail.tabs.ideas')}</TabsTrigger>
          {canManageNotes && <TabsTrigger value="notes">{t('notes.tab_title')}</TabsTrigger>}
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader><CardTitle>{t('student_detail.profile_details')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{currentStudent.email}</span></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{currentStudent.phone || 'N/A'}</span></div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                {currentStudent.googleMeetId ?
                <div className="flex items-center gap-2">
                    <a href={`https://meet.google.com/${currentStudent.googleMeetId}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">{currentStudent.googleMeetId}</a>
                    <Button asChild size="sm" variant="outline"><a href={`https://meet.google.com/${currentStudent.googleMeetId}`} target="_blank" rel="noopener noreferrer"><Video className="mr-2 h-4 w-4" /> {t('student_detail.start_meet')}</a></Button>
                  </div> :
                <span className="text-sm">N/A</span>}
              </div>
              <div className="flex items-center gap-2"><UserIcon className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{currentStudent.gender}</span></div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{t('student_detail.join_date')}: {new Date(currentStudent.joinDate).toLocaleDateString()}</span></div>
              <div className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{currentStudent.coursesEnrolled} {t('student_detail.courses_enrolled')}</span></div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm"><span>{t('student_detail.overall_progress')}</span></div>
                <Progress value={currentStudent.overallProgress} />
                <span className="text-xs text-muted-foreground">{currentStudent.overallProgress}% {t('student_detail.complete')}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="courses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('student_detail.tabs.enrolled_courses')}</CardTitle>
              <CardDescription>{t('student_detail.enrolled_courses_desc', { name: currentStudent.name })}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.studentCourses ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : studentCourses.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {studentCourses.map((course) => (
                    <AccordionItem value={course.id} key={course.id}>
                      <AccordionTrigger>{course.title}</AccordionTrigger>
                      <AccordionContent>
                        <CourseCurriculum course={course} studentId={currentStudent.id} canManage={canManageProgress} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{t('student_detail.no_courses')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai_insights" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary" />{t('student_detail.ai_insights_title')}</CardTitle><CardDescription>{t('student_detail.ai_insights_desc', { name: currentStudent.name })}</CardDescription></CardHeader>
            <CardContent>
              {loading.prediction ?
              <div className="flex flex-col items-center justify-center space-y-4 py-10"><Lightbulb className="h-10 w-10 animate-pulse text-primary" /><p className="text-muted-foreground">{t('student_detail.generating_insights')}</p></div> :
              currentStudentPrediction ?
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t('analytics.predicted_grade')}</p>
                    <p className="text-6xl font-bold text-primary my-2">{currentStudentPrediction.predictedGrade}</p>
                    <div className="w-full mt-2"><Progress value={currentStudentPrediction.confidence * 100} className="h-2" /><p className="text-xs text-muted-foreground mt-1 text-center">{t('analytics.confidence')}: {(currentStudentPrediction.confidence * 100).toFixed(1)}%</p></div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">{t('analytics.career_paths')}</h4>
                    {currentStudentPrediction.careerPaths.map((path) => <div key={path.title} className="p-3 border rounded-lg"><p className="font-medium text-sm">{path.title}</p><p className="text-xs text-muted-foreground">{path.description}</p></div>)}
                  </div>
                </div> :
              <div className="text-center py-10"><p>{t('student_detail.no_insights')}</p></div>}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ideas" className="mt-4">
          <Card>
            <CardHeader><CardTitle>{t('student_detail.tabs.ideas')}</CardTitle><CardDescription>{t('student_detail.ideas_desc', { name: currentStudent.name })}</CardDescription></CardHeader>
            <CardContent>
              {loading.ideas ? <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div> : studentIdeas.length > 0 ?
              <div className="space-y-4">
                  {studentIdeas.map((idea) =>
                <Card key={idea.id}>
                      <CardHeader className="flex flex-row items-start justify-between">
                        <div><CardTitle>{idea.title}</CardTitle><CardDescription>Posted on {new Date(idea.createdAt).toLocaleDateString()}</CardDescription></div>
                        {(user?.role === 'Admin' || user?.id === idea.studentId) && <Button variant="ghost" size="icon" onClick={() => deleteIdea(idea.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                      </CardHeader>
                      <CardContent><p className="text-sm">{idea.content}</p></CardContent>
                    </Card>
                )}
                </div> :
              <p className="text-sm text-muted-foreground">{t('student_detail.no_ideas')}</p>}
            </CardContent>
          </Card>
        </TabsContent>
        {canManageNotes &&
        <TabsContent value="notes" className="mt-4">
            <Card>
              <CardHeader><CardTitle>{t('notes.title')}</CardTitle><CardDescription>{t('notes.description', { name: currentStudent.name })}</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <Form {...noteForm}>
                  <form onSubmit={noteForm.handleSubmit(onNoteSubmit)} className="space-y-4">
                    <FormField control={noteForm.control} name="content" render={({ field }) => <FormItem><FormMessage /><FormControl><Textarea placeholder={t('notes.form.placeholder')} {...field} /></FormControl></FormItem>} />
                    <Button type="submit" disabled={noteForm.formState.isSubmitting}>{noteForm.formState.isSubmitting ? t('notes.form.submitting') : t('notes.form.submit_button')}</Button>
                  </form>
                </Form>
                <div className="space-y-4">
                  {loading.studentNotes ? <Skeleton className="h-20 w-full" /> : studentNotes.length > 0 ?
                studentNotes.map((note) =>
                <div key={note.id} className="flex items-start gap-4">
                        <Avatar className="h-9 w-9"><AvatarFallback>{note.authorName.charAt(0)}</AvatarFallback></Avatar>
                        <div className="grid gap-1.5 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2"><p className="font-semibold">{note.authorName}</p><p className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</p></div>
                            {(user?.role === 'Admin' || user?.id === note.authorId) && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteNote(note.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                          </div>
                          <p className="text-sm text-muted-foreground">{note.content}</p>
                        </div>
                      </div>
                ) :
                <p className="text-sm text-muted-foreground text-center py-4">{t('notes.no_notes')}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        }
      </Tabs>
    </div>);
}