export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Admin' | 'Instructor' | 'Student';
  profilePictureUrl?: string;
  phone?: string;
  googleMeetId?: string;
}
export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string;
  gender: 'Male' | 'Female';
  phone?: string;
  googleMeetId?: string;
  profilePictureUrl?: string;
  defaultPassword?: string;
}
export interface Course {
  id: string;
  title: string;
  description?: string;
  instructorId: string;
  instructor?: Instructor;
  progress: number;
  status: 'On Track' | 'At Risk' | 'Completed';
  nextClass: string;
  enrolled: number;
  createdAt: string;
  students?: Student[];
}
export interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  coursesEnrolled: number;
  overallProgress: number;
  joinDate: string;
  createdAt: string;
  courses?: Course[];
  gender: 'Male' | 'Female';
  phone?: string;
  googleMeetId?: string;
  profilePictureUrl?: string;
  defaultPassword?: string;
}
export interface AnalyticsMetric {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
}
export interface EngagementData {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  courseId: string;
  description?: string;
  instructorId?: string;
  instructorGoogleMeetId?: string;
}
export interface SubTopic {
  id: string;
  moduleId: string;
  title: string;
  description: string;
}
export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  content: string;
  subTopics?: SubTopic[];
}
export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
}
export interface AnalyticsData {
  totalStudents: number;
  activeCourses: number;
  completionRate: number;
  averageEngagement: number;
  studentEngagement: { name: string; value: number }[];
  coursePopularity: { name: string; value: number }[];
}
export interface AIPrediction {
  studentId: string;
  predictedGrade: string;
  confidence: number;
  careerPaths: {
    title: string;
    description: string;
    relevance: number;
  }[];
}
export interface Transaction {
  id: string;
  type: 'student_payment' | 'instructor_payout';
  studentName?: string;
  studentId?: string;
  courseName?: string;
  courseId?: string;
  instructorName?: string;
  instructorId?: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  date: string;
}
export interface Idea {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatarUrl: string;
  title: string;
  content: string;
  createdAt: string;
}
export interface CourseContent {
  id: string;
  courseId: string;
  title: string;
  contentType: 'text' | 'url';
  content: string;
}
export interface StudentProgress {
  [courseId: string]: string[]; // Array of completed sub-topic IDs
}
export interface Note {
  id: string;
  studentId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}
export interface CourseProgress {
  [subTopicId: string]: {
    completed: number;
    total: number;
  };
}
export interface UpcomingTopic {
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  topicId: string;
  topicTitle: string;
}