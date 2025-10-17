import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, CreditCard, TrendingDown, PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transaction } from "@/lib/types";
const transactionSchema = z.object({
  type: z.enum(['student_payment', 'instructor_payout']),
  studentId: z.string().optional(),
  courseId: z.string().optional(),
  instructorId: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be positive"),
  status: z.enum(['Paid', 'Pending', 'Failed']),
  date: z.string().refine(d => !isNaN(Date.parse(d)), "Invalid date"),
}).refine(data => data.type === 'student_payment' ? !!data.studentId && !!data.courseId : true, {
  message: "Student and Course are required for payments",
  path: ["studentId"],
}).refine(data => data.type === 'instructor_payout' ? !!data.instructorId : true, {
  message: "Instructor is required for payouts",
  path: ["instructorId"],
});
type TransactionFormValues = z.infer<typeof transactionSchema>;
export default function FinancePage() {
  const { t } = useLanguage();
  const { transactions, loading, fetchTransactions, addTransaction, updateTransaction, deleteTransaction } = useStore();
  const { students, fetchStudents } = useStore();
  const { courses, fetchCourses } = useStore();
  const { instructors, fetchInstructors } = useStore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingTx, setEditingTx] = React.useState<Transaction | null>(null);
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'student_payment',
      amount: 0,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    }
  });
  const transactionType = form.watch('type');
  React.useEffect(() => {
    fetchTransactions();
    fetchStudents();
    fetchCourses();
    fetchInstructors();
  }, [fetchTransactions, fetchStudents, fetchCourses, fetchInstructors]);
  React.useEffect(() => {
    if (editingTx) {
      form.reset({
        ...editingTx,
        amount: editingTx.amount,
        date: new Date(editingTx.date).toISOString().split('T')[0],
      });
    } else {
      form.reset({
        type: 'student_payment',
        studentId: '',
        courseId: '',
        instructorId: '',
        amount: 0,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [editingTx, form]);
  const financialSummary = React.useMemo(() => {
    if (!transactions) return { totalRevenue: 0, outstanding: 0, failed: 0 };
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.status === 'Paid') {
          if (transaction.type === 'student_payment') acc.totalRevenue += transaction.amount;
        } else if (transaction.status === 'Pending') {
          acc.outstanding += transaction.amount;
        } else if (transaction.status === 'Failed') {
          acc.failed += transaction.amount;
        }
        return acc;
      },
      { totalRevenue: 0, outstanding: 0, failed: 0 }
    );
  }, [transactions]);
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const handleDialogOpen = (tx: Transaction | null) => {
    setEditingTx(tx);
    setIsDialogOpen(true);
  };
  const onSubmit = async (values: TransactionFormValues) => {
    let txData: any = { ...values };
    if (values.type === 'student_payment') {
      const student = students.find(s => s.id === values.studentId);
      const course = courses.find(c => c.id === values.courseId);
      if (!student || !course) return;
      txData = { ...txData, studentName: student.name, courseName: course.title };
    } else if (values.type === 'instructor_payout') {
      const instructor = instructors.find(i => i.id === values.instructorId);
      if (!instructor) return;
      txData = { ...txData, instructorName: instructor.name };
    }
    if (editingTx) {
      await updateTransaction(editingTx.id, txData);
    } else {
      await addTransaction(txData);
    }
    setIsDialogOpen(false);
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('finance.title')}</h1>
          <p className="text-muted-foreground">{t('finance.description')}</p>
        </div>
        <Button onClick={() => handleDialogOpen(null)}><PlusCircle className="mr-2 h-4 w-4" />{t('finance.add_transaction')}</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading.transactions ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /></CardContent></Card>
          ))
        ) : (
          <>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('finance.revenue')}</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(financialSummary.totalRevenue)}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('finance.outstanding')}</CardTitle><CreditCard className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(financialSummary.outstanding)}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{t('finance.failed_transactions')}</CardTitle><TrendingDown className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(financialSummary.failed)}</div></CardContent></Card>
          </>
        )}
      </div>
      <Card>
        <CardHeader><CardTitle>{t('finance.transaction_history')}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>{t('finance.table.student')}/{t('finance.table.instructor')}</TableHead><TableHead>{t('finance.table.course')}</TableHead><TableHead>{t('finance.table.amount')}</TableHead><TableHead>{t('finance.table.status')}</TableHead><TableHead>{t('finance.table.date')}</TableHead><TableHead className="text-right">{t('course_detail.actions')}</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading.transactions ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell><Skeleton className="h-5 w-32" /></TableCell><TableCell><Skeleton className="h-5 w-48" /></TableCell><TableCell><Skeleton className="h-5 w-20" /></TableCell><TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell></TableRow>
                ))
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.studentName || tx.instructorName}</TableCell><TableCell>{tx.courseName || 'N/A'}</TableCell><TableCell>{formatCurrency(tx.amount)}</TableCell>
                    <TableCell><Badge className={cn({ 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': tx.status === 'Paid', 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': tx.status === 'Pending', 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300': tx.status === 'Failed' })}>{tx.status}</Badge></TableCell>
                    <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDialogOpen(tx)}><Edit className="mr-2 h-4 w-4" />{t('instructors.actions.edit')}</DropdownMenuItem>
                            <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />{t('instructors.actions.delete')}</DropdownMenuItem></AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>{t('finance.delete_confirm.title')}</AlertDialogTitle><AlertDialogDescription>{t('finance.delete_confirm.description')}</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>{t('course_detail.cancel')}</AlertDialogCancel><AlertDialogAction onClick={() => deleteTransaction(tx.id)} className="bg-destructive hover:bg-destructive/90">{t('instructors.actions.delete')}</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingTx ? t('finance.edit_transaction') : t('finance.add_transaction')}</DialogTitle><DialogDescription>{t('finance.dialog_description')}</DialogDescription></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>{t('finance.form.type')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('finance.form.select_type')} /></SelectTrigger></FormControl><SelectContent><SelectItem value="student_payment">{t('finance.form.student_payment')}</SelectItem><SelectItem value="instructor_payout">{t('finance.form.instructor_payout')}</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              {transactionType === 'student_payment' && (
                <>
                  <FormField control={form.control} name="studentId" render={({ field }) => (<FormItem><FormLabel>{t('finance.form.student')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('finance.form.select_student')} /></SelectTrigger></FormControl><SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="courseId" render={({ field }) => (<FormItem><FormLabel>{t('finance.form.course')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('finance.form.select_course')} /></SelectTrigger></FormControl><SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                </>
              )}
              {transactionType === 'instructor_payout' && (
                <FormField control={form.control} name="instructorId" render={({ field }) => (<FormItem><FormLabel>{t('finance.form.instructor')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('finance.form.select_instructor')} /></SelectTrigger></FormControl><SelectContent>{instructors.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
              )}
              <FormField control={form.control} name="amount" render={({ field }) => (<FormItem><FormLabel>{t('finance.form.amount')}</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>{t('finance.form.status')}</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder={t('finance.form.select_status')} /></SelectTrigger></FormControl><SelectContent><SelectItem value="Paid">Paid</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Failed">Failed</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="date" render={({ field }) => (<FormItem><FormLabel>{t('finance.form.date')}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? t('instructors.form.saving') : t('instructors.form.save_button')}</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}