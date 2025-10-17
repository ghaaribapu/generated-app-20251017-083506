import * as React from 'react';
import { useStore } from '@/lib/store';
import { Course, CourseModule, SubTopic } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/use-language';
const ModuleAccordionItem = ({ module, studentId, courseId, canManage }: { module: CourseModule, studentId: string, courseId: string, canManage: boolean }) => {
  const { t } = useLanguage();
  const { moduleSubTopics, studentProgress, fetchSubTopicsForModule, updateSubTopicProgress, loading } = useStore();
  const [updatingProgress, setUpdatingProgress] = React.useState<Record<string, boolean>>({});
  const subTopics = moduleSubTopics[module.id] || [];
  React.useEffect(() => {
    fetchSubTopicsForModule(module.id);
  }, [module.id, fetchSubTopicsForModule]);
  const handleProgressChange = async (subTopicId: string, checked: boolean) => {
    if (canManage) {
      setUpdatingProgress(prev => ({ ...prev, [subTopicId]: true }));
      await updateSubTopicProgress(studentId, courseId, subTopicId, checked);
      setUpdatingProgress(prev => ({ ...prev, [subTopicId]: false }));
    }
  };
  const completedSubTopics = studentProgress?.[courseId] || [];
  return (
    <AccordionItem value={module.id}>
      <AccordionTrigger>{module.title}</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-2 pl-4">
          {loading.moduleSubTopics && !subTopics.length ? (
            <Skeleton className="h-10 w-full" />
          ) : subTopics.length > 0 ? (
            subTopics.map(subTopic => (
              <div key={subTopic.id} className="flex items-center space-x-3">
                {updatingProgress[subTopic.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Checkbox
                    id={`subtopic-${subTopic.id}`}
                    disabled={!canManage || updatingProgress[subTopic.id]}
                    checked={completedSubTopics.includes(subTopic.id)}
                    onCheckedChange={(checked) => handleProgressChange(subTopic.id, !!checked)}
                  />
                )}
                <label htmlFor={`subtopic-${subTopic.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {subTopic.title}
                </label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{t('student_detail.no_subtopics_found')}</p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
export const CourseCurriculum = ({ course, studentId, canManage }: { course: Course, studentId: string, canManage: boolean }) => {
  const { t } = useLanguage();
  const { courseModules, fetchModulesForCourse, loading } = useStore();
  React.useEffect(() => {
    fetchModulesForCourse(course.id);
  }, [course.id, fetchModulesForCourse]);
  const modulesForCourse = courseModules[course.id] || [];
  return (
    <div>
      <h4 className="font-semibold mb-2">{t('student_detail.curriculum_and_progress')}</h4>
      {loading.courseModules && !modulesForCourse.length ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : modulesForCourse.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {modulesForCourse.map(module => (
            <ModuleAccordionItem
              key={module.id}
              module={module}
              studentId={studentId}
              courseId={course.id}
              canManage={canManage}
            />
          ))}
        </Accordion>
      ) : (
        <p className="text-sm text-muted-foreground">{t('student_detail.no_modules_found')}</p>
      )}
    </div>
  );
};