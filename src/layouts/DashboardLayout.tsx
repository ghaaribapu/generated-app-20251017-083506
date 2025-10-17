import * as React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/sonner';
import { useLanguage } from '@/hooks/use-language';
import { ChatAssistant } from '@/components/ChatAssistant';
import { useAuth } from '@/hooks/use-auth';
export function DashboardLayout() {
  const { language } = useLanguage();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const dir = language === 'ar' || language === 'ur' ? 'rtl' : 'ltr';
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  if (loading || !user) {
    // You can render a loading spinner here
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-2xl font-semibold">Loading...</div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen w-full bg-background" dir={dir}>
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <ChatAssistant />
      <Toaster richColors />
    </div>
  );
}