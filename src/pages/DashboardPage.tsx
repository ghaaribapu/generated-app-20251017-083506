import { useAuth } from '@/hooks/use-auth';
import AdminDashboard from './dashboards/AdminDashboard';
import InstructorDashboard from './dashboards/InstructorDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
export default function DashboardPage() {
  const { role } = useAuth();
  switch (role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Instructor':
      return <InstructorDashboard />;
    case 'Student':
      return <StudentDashboard />;
    default:
      // This can be a loading state or a fallback
      return <div>Loading dashboard...</div>;
  }
}