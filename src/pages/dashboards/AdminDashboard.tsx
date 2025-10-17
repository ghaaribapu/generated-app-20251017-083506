import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
const iconMap = {
  'Total Students': <Users className="h-5 w-5 text-muted-foreground" />,
  'Active Courses': <BookOpen className="h-5 w-5 text-muted-foreground" />,
  'Avg. Completion Rate': <CheckCircle className="h-5 w-5 text-muted-foreground" />,
  'Avg. Engagement': <TrendingUp className="h-5 w-5 text-muted-foreground" />,
};
export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { courses, loading: loadingCourses, fetchCourses } = useStore();
  const { analyticsData, loading: loadingAnalytics, fetchAnalyticsData } = useStore();
  React.useEffect(() => {
    fetchCourses();
    fetchAnalyticsData();
  }, [fetchCourses, fetchAnalyticsData]);
  const metrics = analyticsData ? [
    { title: t('analytics.total_students'), value: analyticsData.totalStudents.toString(), icon: iconMap['Total Students'] },
    { title: t('analytics.active_courses'), value: analyticsData.activeCourses.toString(), icon: iconMap['Active Courses'] },
    { title: t('analytics.completion_rate'), value: `${analyticsData.completionRate}%`, icon: iconMap['Avg. Completion Rate'] },
    { title: t('analytics.average_engagement'), value: `${analyticsData.averageEngagement}h/wk`, icon: iconMap['Avg. Engagement'] },
  ] : [];
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.welcome', { name: user?.name.split(' ')[0] })}</h1>
          <p className="text-muted-foreground">{t('dashboard.description')}</p>
        </div>
        <Button>{t('dashboard.view_reports')}</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loadingAnalytics ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-5 w-5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : (
          metrics.map((metric) => (
            <Card key={metric.title} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                {metric.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <div className="grid gap-8">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle>{t('dashboard.ongoing_courses')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dashboard.table.course')}</TableHead>
                  <TableHead>{t('dashboard.table.instructor')}</TableHead>
                  <TableHead>{t('dashboard.table.progress')}</TableHead>
                  <TableHead className="text-right">{t('dashboard.table.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingCourses ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : courses.length > 0 ? (
                  courses.slice(0, 5).map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.instructor?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={course.progress} className="w-24" />
                          <span>{course.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      {t('dashboard.no_courses_found')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}