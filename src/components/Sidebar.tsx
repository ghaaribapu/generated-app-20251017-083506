import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  DollarSign,
  Calendar,
  UserCheck,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { Role } from '@/contexts/AuthContextDef';
export function Sidebar() {
  const { t } = useLanguage();
  const { role } = useAuth();
  const allNavItems = [
    { to: '/', icon: LayoutDashboard, label: t('sidebar.dashboard'), roles: ['Admin', 'Instructor', 'Student'] as Role[] },
    { to: '/courses', icon: BookOpen, label: t('sidebar.courses'), roles: ['Admin', 'Instructor', 'Student'] },
    { to: '/students', icon: Users, label: t('sidebar.students'), roles: ['Admin', 'Instructor'] },
    { to: '/instructors', icon: UserCheck, label: t('sidebar.instructors'), roles: ['Admin'] },
    { to: '/collaboration', icon: Lightbulb, label: t('sidebar.collaboration'), roles: ['Admin', 'Instructor', 'Student'] },
    { to: '/calendar', icon: Calendar, label: t('sidebar.calendar'), roles: ['Admin', 'Instructor', 'Student'] },
    { to: '/analytics', icon: BarChart3, label: t('sidebar.analytics'), roles: ['Admin'] },
    { to: '/finance', icon: DollarSign, label: t('sidebar.finance'), roles: ['Admin'] },
    { to: '/settings', icon: Settings, label: t('sidebar.settings'), roles: ['Admin', 'Instructor', 'Student'] },
  ];
  const navItems = allNavItems.filter(item => role && item.roles.includes(role));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'relative flex flex-col h-screen bg-card border-r transition-all duration-300 ease-in-out z-40',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className={cn('flex items-center h-16 border-b px-6', isCollapsed ? 'justify-center' : 'justify-between')}>
          <div className={cn('flex items-center gap-2', isCollapsed && 'justify-center')}>
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className={cn('text-lg font-bold', isCollapsed && 'hidden')}>Zavia AI</span>
          </div>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.to}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-2.5 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10',
                      isActive && 'bg-primary/10 text-primary font-semibold',
                      isCollapsed && 'justify-center'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className={cn('truncate', isCollapsed && 'hidden')}>{item.label}</span>
                  </NavLink>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            );
          })}
        </nav>
        <div className="mt-auto p-4">
          <Button
            onClick={toggleSidebar}
            variant="outline"
            size="icon"
            className="absolute -right-4 top-16 bg-card hover:bg-muted"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}