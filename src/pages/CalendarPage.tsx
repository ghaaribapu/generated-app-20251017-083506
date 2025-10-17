import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useStore } from '@/lib/store';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarEvent } from '@/lib/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  courseId: z.string().min(1, 'Course is required'),
  instructorId: z.string().optional(),
  description: z.string().optional(),
  start: z.date(),
  end: z.date(),
}).refine(data => data.end > data.start, {
  message: "End date must be after start date",
  path: ["end"],
});
type EventFormValues = z.infer<typeof eventSchema>;
export default function CalendarPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { events, loading, fetchEvents, addEvent, updateEvent, deleteEvent } = useStore();
  const { courses, fetchCourses } = useStore();
  const { instructors, fetchInstructors } = useStore();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [slotInfo, setSlotInfo] = React.useState<{ start: Date, end: Date } | null>(null);
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
  });
  const courseIdWatcher = form.watch('courseId');
  const canManageCalendar = user?.role === 'Admin' || user?.role === 'Instructor';
  const instructorCourses = user?.role === 'Instructor' ? courses.filter(c => c.instructorId === user.id) : courses;
  React.useEffect(() => {
    fetchEvents();
    fetchCourses();
    fetchInstructors();
  }, [fetchEvents, fetchCourses, fetchInstructors]);
  React.useEffect(() => {
    if (courseIdWatcher) {
      const selectedCourse = courses.find(c => c.id === courseIdWatcher);
      if (selectedCourse && selectedCourse.instructorId) {
        form.setValue('instructorId', selectedCourse.instructorId);
      }
    }
  }, [courseIdWatcher, courses, form]);
  React.useEffect(() => {
    if (selectedEvent) {
      form.reset({
        title: selectedEvent.title,
        courseId: selectedEvent.courseId,
        instructorId: selectedEvent.instructorId || '',
        description: selectedEvent.description || '',
        start: new Date(selectedEvent.start),
        end: new Date(selectedEvent.end),
      });
    } else if (slotInfo) {
      form.reset({
        title: '',
        courseId: '',
        instructorId: user?.role === 'Instructor' ? user.id : '',
        description: '',
        start: slotInfo.start,
        end: slotInfo.end,
      });
    } else {
      form.reset({
        title: '',
        courseId: '',
        instructorId: user?.role === 'Instructor' ? user.id : '',
        description: '',
        start: new Date(),
        end: new Date(new Date().getTime() + 60 * 60 * 1000),
      });
    }
  }, [selectedEvent, slotInfo, form, user]);
  const handleSelectEvent = React.useCallback((event: CalendarEvent) => {
    if (user?.role === 'Admin' || (user?.role === 'Instructor' && event.instructorId === user.id)) {
      setSelectedEvent(event);
      setSlotInfo(null);
      setDialogOpen(true);
    }
  }, [user]);
  const handleSelectSlot = React.useCallback(({ start, end }: { start: Date, end: Date }) => {
    if (canManageCalendar) {
      setSlotInfo({ start, end });
      setSelectedEvent(null);
      setDialogOpen(true);
    }
  }, [canManageCalendar]);
  const onSubmit = async (values: EventFormValues) => {
    const instructor = instructors.find(i => i.id === values.instructorId);
    const eventData = {
      ...values,
      instructorId: instructor?.id,
      instructorGoogleMeetId: instructor?.googleMeetId,
    };
    if (selectedEvent) {
      await updateEvent(selectedEvent.id, eventData);
    } else {
      await addEvent(eventData as Omit<CalendarEvent, 'id'>);
    }
    setDialogOpen(false);
  };
  const handleDelete = async () => {
    if (selectedEvent) {
      await deleteEvent(selectedEvent.id);
      setDialogOpen(false);
    }
  };
  const eventStyleGetter = () => ({
    style: {
      backgroundColor: 'hsl(var(--primary))',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'hsl(var(--primary-foreground))',
      border: '0px',
      display: 'block',
    },
  });
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('calendar.title')}</h1>
          <p className="text-muted-foreground">{t('calendar.description')}</p>
        </div>
        {canManageCalendar && (
          <Button onClick={() => { setSelectedEvent(null); setSlotInfo(null); setDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('calendar.add_event')}
          </Button>
        )}
      </div>
      <Card>
        <CardHeader><CardTitle>{t('calendar.card_title')}</CardTitle></CardHeader>
        <CardContent>
          {loading.events ? (
            <Skeleton className="h-[70vh] w-full" />
          ) : (
            <div className="h-[70vh]">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent as any}
                onSelectSlot={handleSelectSlot}
                selectable={canManageCalendar}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              />
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent ? t('calendar.edit_event') : t('calendar.add_event')}</DialogTitle>
            <DialogDescription>{t('calendar.event_details')}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>{t('calendar.form.title')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>{t('calendar.form.description')}</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="courseId" render={({ field }) => (<FormItem><FormLabel>{t('calendar.form.course')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('calendar.form.select_course')} /></SelectTrigger></FormControl><SelectContent>{instructorCourses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              {user?.role === 'Admin' && <FormField control={form.control} name="instructorId" render={({ field }) => (<FormItem><FormLabel>{t('calendar.form.instructor')}</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('calendar.form.select_instructor')} /></SelectTrigger></FormControl><SelectContent>{instructors.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />}
              <div className="flex gap-4">
                <FormField control={form.control} name="start" render={({ field }) => (<FormItem className="flex-1"><FormLabel>{t('calendar.form.start_time')}</FormLabel><FormControl><Input type="datetime-local" value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''} onChange={e => field.onChange(new Date(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="end" render={({ field }) => (<FormItem className="flex-1"><FormLabel>{t('calendar.form.end_time')}</FormLabel><FormControl><Input type="datetime-local" value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''} onChange={e => field.onChange(new Date(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  {selectedEvent && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('calendar.delete_confirm.title')}</AlertDialogTitle>
                          <AlertDialogDescription>{t('calendar.delete_confirm.description')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('course_detail.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">{t('instructors.actions.delete')}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>{t('course_detail.cancel')}</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? t('instructors.form.saving') : t('instructors.form.save_button')}</Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}