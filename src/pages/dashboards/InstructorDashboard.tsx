import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Clock, Video } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStore } from '@/lib/store';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
export default function InstructorDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { instructorCourses, loading: loadingCourses, fetchCoursesForInstructor } = useStore();
  const { events, loading: loadingEvents, fetchEvents } = useStore();
  React.useEffect(() => {
    const userId = user?.id;
    if (userId) {
      fetchCoursesForInstructor(userId);
      fetchEvents();
    }
  }, [user?.id, fetchCoursesForInstructor, fetchEvents]);
  const instructorCourseIds = React.useMemo(() => new Set(instructorCourses.map(c => c.id)), [instructorCourses]);
  const totalStudents = instructorCourses.reduce((sum, course) => sum + course.enrolled, 0);
  const { upcomingClasses, pastClasses } = React.useMemo(() => {
    const now = new Date();
    const allClasses = events
      .filter(event => instructorCourseIds.has(event.courseId))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    return {
      upcomingClasses: allClasses.filter(event => event.start >= now),
      pastClasses: allClasses.filter(event => event.start < now).sort((a, b) => b.start.getTime() - a.start.getTime()),
    };
  }, [events, instructorCourseIds]);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('instructor_dashboard.welcome', { name: user?.name.split(' ')[0] })}</h1>
        <p className="text-muted-foreground">{t('instructor_dashboard.description')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('instructor_dashboard.my_courses')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingCourses ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{instructorCourses.length}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('instructor_dashboard.total_students')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingCourses ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{totalStudents}</div>}
          </CardContent>
        </Card>
        <Card>
          <Tabs defaultValue="upcoming">
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">{t('student_dashboard.upcoming_classes')}</TabsTrigger>
                <TabsTrigger value="past">{t('student_dashboard.past_classes')}</TabsTrigger>
              </TabsList>
            </CardHeader>
            <TabsContent value="upcoming">
              <ScrollArea className="h-48">
                <CardContent>
                  {loadingEvents ? <Skeleton className="h-24 w-full" /> : upcomingClasses.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingClasses.slice(0, 5).map(event => (
                        <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                          <p className="font-semibold text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(event.start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                          {user?.googleMeetId && (
                            <Button asChild size="sm" className="mt-2 w-full">
                              <a href={`https://meet.google.com/${user.googleMeetId}`} target="_blank" rel="noopener noreferrer">
                                <Video className="mr-2 h-4 w-4" /> {t('instructor_dashboard.start_meet')}
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
              <ScrollArea className="h-48">
                <CardContent>
                  {loadingEvents ? <Skeleton className="h-24 w-full" /> : pastClasses.length > 0 ? (
                    <div className="space-y-4">
                      {pastClasses.slice(0, 5).map(event => (
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
      <Card>
        <CardHeader>
          <CardTitle>{t('instructor_dashboard.my_courses')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dashboard.table.course')}</TableHead>
                <TableHead>{t('courses.table.header.enrolled')}</TableHead>
                <TableHead>{t('dashboard.table.progress')}</TableHead>
                <TableHead>{t('courses.table.header.next_class')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingCourses ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  </TableRow>
                ))
              ) : instructorCourses.length > 0 ? (
                instructorCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.enrolled}</TableCell>
                    <TableCell>{course.progress}%</TableCell>
                    <TableCell>{course.nextClass}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {t('instructor_dashboard.no_courses_found')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}