import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, CheckCircle, BrainCircuit, TrendingUp, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#FFBB28', '#FF8042', '#00C49F'];
export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const analyticsData = useStore((state) => state.analyticsData);
  const loadingAnalytics = useStore((state) => state.loading.analytics);
  const fetchAnalyticsData = useStore((state) => state.fetchAnalyticsData);
  const students = useStore((state) => state.students);
  const fetchStudents = useStore((state) => state.fetchStudents);
  const prediction = useStore((state) => state.currentStudentPrediction);
  const loadingPrediction = useStore((state) => state.loading.prediction);
  const fetchAIPrediction = useStore((state) => state.fetchAIPrediction);
  useEffect(() => {
    fetchAnalyticsData();
    fetchStudents();
  }, [fetchAnalyticsData, fetchStudents]);
  const handlePrediction = () => {
    if (selectedStudentId) {
      fetchAIPrediction(selectedStudentId);
    }
  };
  const metrics = analyticsData ? [
    { title: t('analytics.total_students'), value: analyticsData.totalStudents.toString(), icon: <Users className="h-5 w-5 text-muted-foreground" /> },
    { title: t('analytics.active_courses'), value: analyticsData.activeCourses.toString(), icon: <BookOpen className="h-5 w-5 text-muted-foreground" /> },
    { title: t('analytics.completion_rate'), value: `${analyticsData.completionRate}%`, icon: <CheckCircle className="h-5 w-5 text-muted-foreground" /> },
    { title: t('analytics.average_engagement'), value: `${analyticsData.averageEngagement}h/wk`, icon: <TrendingUp className="h-5 w-5 text-muted-foreground" /> },
  ] : [];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('analytics.title')}</h1>
        <p className="text-muted-foreground">{t('analytics.description')}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loadingAnalytics ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
        )) : metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.engagement_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {loadingAnalytics ? <Skeleton className="h-full w-full" /> : (
                  <BarChart data={analyticsData?.studentEngagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" name={t('analytics.progress')} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.popularity_title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                {loadingAnalytics ? <Skeleton className="h-full w-full" /> : (
                  <PieChart>
                    <Pie data={analyticsData?.coursePopularity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {analyticsData?.coursePopularity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary" />{t('analytics.prediction_title')}</CardTitle>
              <CardDescription>{t('analytics.prediction_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select onValueChange={setSelectedStudentId} value={selectedStudentId || ''}>
                <SelectTrigger><SelectValue placeholder={t('analytics.select_student')} /></SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handlePrediction} disabled={!selectedStudentId || loadingPrediction} className="w-full">
                {loadingPrediction ? t('analytics.predicting') : t('analytics.predict_button')}
              </Button>
              {loadingPrediction && <div className="flex justify-center pt-4"><Lightbulb className="h-8 w-8 animate-pulse text-primary" /></div>}
              {prediction && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t('analytics.predicted_grade')}</p>
                    <p className="text-4xl font-bold text-primary">{prediction.predictedGrade}</p>
                    <div className="mt-2">
                      <Progress value={prediction.confidence * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{t('analytics.confidence')}: {(prediction.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{t('analytics.career_paths')}</h4>
                    <div className="space-y-2">
                      {prediction.careerPaths.map(path => (
                        <div key={path.title} className="p-3 bg-muted/50 rounded-lg">
                          <p className="font-medium text-sm">{path.title}</p>
                          <p className="text-xs text-muted-foreground">{path.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}