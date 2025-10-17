import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
const ideaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
});
type IdeaFormValues = z.infer<typeof ideaSchema>;
export default function CollaborationPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const ideas = useStore((state) => state.ideas);
  const loading = useStore((state) => state.loading.ideas);
  const { fetchIdeas, addIdea, deleteIdea } = useStore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: { title: '', content: '' },
  });
  React.useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);
  const onSubmit = async (values: IdeaFormValues) => {
    if (!user) return;
    await addIdea({ ...values, studentId: user.id });
    form.reset();
    setIsDialogOpen(false);
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('collaboration.title')}</h1>
          <p className="text-muted-foreground">{t('collaboration.description')}</p>
        </div>
        {user?.role === 'Student' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('collaboration.add_idea')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('collaboration.dialog.title')}</DialogTitle>
                <DialogDescription>{t('collaboration.dialog.description')}</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>{t('collaboration.form.title_label')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem><FormLabel>{t('collaboration.form.content_label')}</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>{t('collaboration.cancel')}</Button>
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? t('collaboration.form.submitting') : t('collaboration.form.submit_button')}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
        ) : ideas.length > 0 ? (
          ideas.map((idea) => (
            <Card key={idea.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={idea.studentAvatarUrl} alt={idea.studentName} />
                      <AvatarFallback>{idea.studentName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{idea.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(idea.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {(user?.role === 'Admin' || user?.id === idea.studentId) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('collaboration.delete_confirm.title')}</AlertDialogTitle>
                          <AlertDialogDescription>{t('collaboration.delete_confirm.description')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('collaboration.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteIdea(idea.id)} className="bg-destructive hover:bg-destructive/90">{t('collaboration.delete')}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <h3 className="font-semibold text-lg mb-2">{idea.title}</h3>
                <p className="text-sm text-muted-foreground">{idea.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="py-10 text-center">
                <h3 className="text-xl font-semibold">{t('collaboration.no_ideas_title')}</h3>
                <p className="text-muted-foreground mt-2">{t('collaboration.no_ideas_desc')}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}