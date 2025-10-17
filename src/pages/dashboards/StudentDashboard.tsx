import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Clock, Video, Book, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
export default function StudentDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { studentCourses, loading: loadingCourses, fetchCoursesForStudent } = useStore();
  const { events, loading: loadingEvents, fetchEvents } = useStore();
  const { upcomingTopics, loading: loadingTopics, fetchUpcomingTopics } = useStore();
  React.useEffect(() => {
    const userId = user?.id;
    if (userId) {
      fetchCoursesForStudent(userId);
      fetchEvents();
      fetchUpcomingTopics();
    }
  }, [user?.id, fetchCoursesForStudent, fetchEvents, fetchUpcomingTopics]);
  const enrolledCourseIds = React.useMemo(() => new Set(studentCourses.map(c => c.id)), [studentCourses]);
  const { upcomingClasses, pastClasses } = React.useMemo(() => {
    const now = new Date();
    const allClasses = events
      .filter(event => enrolledCourseIds.has(event.courseId))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    return {
      upcomingClasses: allClasses.filter(event => event.start >= now),
      pastClasses: allClasses.filter(event => event.start < now).sort((a, b) => b.start.getTime() - a.start.getTime()),
    };
  }, [events, enrolledCourseIds]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('student_dashboard.welcome', { name: user?.name.split(' ')[0] })}</h1>
        <p className="text-muted-foreground">{t('student_dashboard.description')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('student_dashboard.my_courses')}</CardTitle>
              <CardDescription>{t('student_dashboard.courses_description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCourses ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2 mt-2" /></CardContent></Card>
                  ))}
                </div>
              ) : studentCourses.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {studentCourses.map(course => (
                    <Card key={course.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>{course.instructor?.name}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{t('dashboard.table.progress')}</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} />
                        </div>
                      </CardContent>
                      <div className="p-6 pt-0">
                        <Button className="w-full" onClick={() => navigate(`/courses/${course.id}`)}>{t('student_dashboard.view_course')}</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  <p>{t('student_dashboard.no_courses_found')}</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('student_dashboard.upcoming_topics')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTopics ? <Skeleton className="h-24 w-full" /> : upcomingTopics.length > 0 ? (
                <div className="space-y-2">
                  {upcomingTopics.map(topic => (
                    <div key={topic.topicId} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                      <div>
                        <p className="font-semibold text-sm">{topic.topicTitle}</p>
                        <p className="text-xs text-muted-foreground">{topic.courseTitle} - {topic.moduleTitle}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/courses/${topic.courseId}`)}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">{t('student_dashboard.no_upcoming_topics')}</p>}
            </CardContent>
          </Card>
        </div>
        <Card>
          <Tabs defaultValue="upcoming">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">{t('student_dashboard.upcoming_classes')}</TabsTrigger>
                <TabsTrigger value="past">{t('student_dashboard.past_classes')}</TabsTrigger>
              </TabsList>
            </CardHeader>
            <TabsContent value="upcoming">
              <ScrollArea className="h-96">
                <CardContent>
                  {loadingEvents ? <Skeleton className="h-24 w-full" /> : upcomingClasses.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingClasses.map(event => (
                        <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                          <p className="font-semibold text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(event.start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                          {event.instructorGoogleMeetId && (
                            <Button asChild size="sm" className="mt-2 w-full">
                              <a href={`https://meet.google.com/${event.instructorGoogleMeetId}`} target="_blank" rel="noopener noreferrer">
                                <Video className="mr-2 h-4 w-4" /> {t('student_dashboard.join_meet')}
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground text-center py-4">{t('instructor_dashboard.no_upcoming_classes')}</p>}
                </CardContent>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="past">
              <ScrollArea className="h-96">
                <CardContent>
                  {loadingEvents ? <Skeleton className="h-24 w-full" /> : pastClasses.length > 0 ? (
                    <div className="space-y-4">
                      {pastClasses.slice(0, 10).map(event => (
                        <div key={event.id} className="p-3 bg-muted/50 rounded-lg opacity-70">
                          <p className="font-semibold text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(event.start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-muted-foreground text-center py-4">{t('student_dashboard.no_past_classes')}</p>}
                </CardContent>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}