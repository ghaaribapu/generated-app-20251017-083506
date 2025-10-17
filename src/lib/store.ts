import { create } from 'zustand';
import { Course, Student, User, CalendarEvent, CourseModule, Instructor, AnalyticsData, AIPrediction, Transaction, Idea, CourseContent, SubTopic, StudentProgress, Note, CourseProgress, UpcomingTopic } from './types';
import { toast } from 'sonner';
interface AppState {
  courses: Course[];
  instructorCourses: Course[];
  students: Student[];
  instructors: Instructor[];
  instructorStudents: Student[];
  user: User | null;
  events: CalendarEvent[];
  currentCourse: Course | null;
  courseModules: Record<string, CourseModule[]>;
  moduleSubTopics: Record<string, SubTopic[]>;
  courseContent: CourseContent[];
  currentStudent: Student | null;
  studentCourses: Course[];
  courseStudents: Student[];
  studentNotes: Note[];
  analyticsData: AnalyticsData | null;
  currentStudentPrediction: AIPrediction | null;
  transactions: Transaction[];
  ideas: Idea[];
  studentProgress: StudentProgress | null;
  courseProgress: CourseProgress | null;
  upcomingTopics: UpcomingTopic[];
  loading: {
    courses: boolean;
    instructorCourses: boolean;
    students: boolean;
    instructors: boolean;
    instructorStudents: boolean;
    user: boolean;
    events: boolean;
    currentCourse: boolean;
    courseModules: boolean;
    moduleSubTopics: boolean;
    courseContent: boolean;
    currentStudent: boolean;
    studentCourses: boolean;
    courseStudents: boolean;
    studentNotes: boolean;
    analytics: boolean;
    prediction: boolean;
    transactions: boolean;
    ideas: boolean;
    studentProgress: boolean;
    courseProgress: boolean;
    upcomingTopics: boolean;
  };
  error: {
    courses: string | null;
    instructorCourses: string | null;
    students: string | null;
    instructors: string | null;
    instructorStudents: string | null;
    user: string | null;
    events: string | null;
    currentCourse: string | null;
    courseModules: string | null;
    moduleSubTopics: string | null;
    courseContent: string | null;
    currentStudent: string | null;
    studentCourses: string | null;
    courseStudents: string | null;
    studentNotes: string | null;
    analytics: string | null;
    prediction: string | null;
    transactions: string | null;
    ideas: string | null;
    studentProgress: string | null;
    courseProgress: string | null;
    upcomingTopics: string | null;
  };
  changePassword: (passwords: { userId: string, currentPassword: string, newPassword: string }) => Promise<void>;
  adminResetPassword: (userId: string, newPassword: string) => Promise<void>;
  fetchCourses: () => Promise<void>;
  fetchCoursesForInstructor: (instructorId: string) => Promise<void>;
  addCourse: (courseData: Partial<Omit<Course, 'createdAt' | 'enrolled' | 'progress' | 'status' | 'nextClass'>> & { title: string, instructorId: string }) => Promise<void>;
  updateCourse: (courseId: string, courseData: Partial<Pick<Course, 'title' | 'description'>>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  fetchStudents: () => Promise<void>;
  fetchStudentsForInstructor: (instructorId: string) => Promise<void>;
  addStudent: (studentData: Omit<Student, 'id' | 'createdAt' | 'coursesEnrolled' | 'overallProgress'>) => Promise<void>;
  updateStudent: (id: string, studentData: Partial<Omit<Student, 'id' | 'createdAt'>>) => Promise<void>;
  fetchInstructors: () => Promise<void>;
  addInstructor: (instructorData: Omit<Instructor, 'id' | 'createdAt'>) => Promise<void>;
  updateInstructor: (id: string, instructorData: Partial<Omit<Instructor, 'id' | 'createdAt'>>) => Promise<void>;
  deleteInstructor: (id: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  fetchEvents: () => Promise<void>;
  addEvent: (eventData: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<Omit<CalendarEvent, 'id'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  fetchCourseById: (id: string) => Promise<void>;
  fetchModulesForCourse: (courseId: string) => Promise<void>;
  addModule: (courseId: string, moduleData: Omit<CourseModule, 'id' | 'courseId' | 'content'>) => Promise<void>;
  updateModule: (moduleId: string, moduleData: Partial<Omit<CourseModule, 'id' | 'courseId' | 'content'>>) => Promise<void>;
  deleteModule: (moduleId: string) => Promise<void>;
  fetchSubTopicsForModule: (moduleId: string) => Promise<void>;
  addSubTopic: (moduleId: string, subTopicData: Omit<SubTopic, 'id' | 'moduleId'>) => Promise<void>;
  updateSubTopic: (subTopicId: string, subTopicData: Partial<Omit<SubTopic, 'id' | 'moduleId'>>) => Promise<void>;
  deleteSubTopic: (subTopicId: string) => Promise<void>;
  fetchCourseContent: (courseId: string) => Promise<void>;
  addCourseContent: (courseId: string, contentData: Omit<CourseContent, 'id' | 'courseId'>) => Promise<void>;
  updateCourseContent: (contentId: string, contentData: Partial<Omit<CourseContent, 'id' | 'courseId'>>) => Promise<void>;
  deleteCourseContent: (contentId: string) => Promise<void>;
  fetchStudentById: (id: string) => Promise<void>;
  fetchCoursesForStudent: (studentId: string) => Promise<void>;
  fetchStudentsForCourse: (courseId: string) => Promise<void>;
  fetchNotesForStudent: (studentId: string) => Promise<void>;
  addNoteForStudent: (studentId: string, noteData: { content: string; authorId: string }) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  enrollStudentInCourse: (courseId: string, studentId: string) => Promise<void>;
  unenrollStudentFromCourse: (courseId: string, studentId: string) => Promise<void>;
  fetchAnalyticsData: () => Promise<void>;
  fetchAIPrediction: (studentId: string) => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addTransaction: (txData: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, txData: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchIdeas: () => Promise<void>;
  addIdea: (ideaData: Omit<Idea, 'id' | 'createdAt' | 'studentName' | 'studentAvatarUrl'>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  fetchStudentProgress: (studentId: string) => Promise<void>;
  updateSubTopicProgress: (studentId: string, courseId: string, subTopicId: string, completed: boolean) => Promise<void>;
  fetchCourseProgress: (courseId: string) => Promise<void>;
  fetchUpcomingTopics: () => Promise<void>;
}
export const useStore = create<AppState>((set, get) => ({
  courses: [],
  instructorCourses: [],
  students: [],
  instructors: [],
  instructorStudents: [],
  user: null,
  events: [],
  currentCourse: null,
  courseModules: {},
  moduleSubTopics: {},
  courseContent: [],
  currentStudent: null,
  studentCourses: [],
  courseStudents: [],
  studentNotes: [],
  analyticsData: null,
  currentStudentPrediction: null,
  transactions: [],
  ideas: [],
  studentProgress: null,
  courseProgress: null,
  upcomingTopics: [],
  loading: {
    courses: false, instructorCourses: false, students: false, instructors: false, instructorStudents: false, user: false, events: false,
    currentCourse: false, courseModules: false, moduleSubTopics: false, courseContent: false, currentStudent: false, studentCourses: false,
    courseStudents: false, studentNotes: false, analytics: false, prediction: false, transactions: false, ideas: false, studentProgress: false, courseProgress: false,
    upcomingTopics: false,
  },
  error: {
    courses: null, instructorCourses: null, students: null, instructors: null, instructorStudents: null, user: null, events: null,
    currentCourse: null, courseModules: null, moduleSubTopics: null, courseContent: null, currentStudent: null, studentCourses: null,
    courseStudents: null, studentNotes: null, analytics: null, prediction: null, transactions: null, ideas: null, studentProgress: null, courseProgress: null,
    upcomingTopics: null,
  },
  fetchUpcomingTopics: async () => {
    set(state => ({ loading: { ...state.loading, upcomingTopics: true }, error: { ...state.error, upcomingTopics: null } }));
    try {
      const response = await fetch('/api/user/upcoming-topics');
      if (!response.ok) throw new Error('Failed to fetch upcoming topics');
      const data = await response.json();
      set({ upcomingTopics: data.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, upcomingTopics: errorMessage } }));
      toast.error('Failed to load upcoming topics.');
    } finally {
      set(state => ({ loading: { ...state.loading, upcomingTopics: false } }));
    }
  },
  fetchModulesForCourse: async (courseId: string) => {
    set(state => ({ loading: { ...state.loading, courseModules: true }, error: { ...state.error, courseModules: null } }));
    try {
      const response = await fetch(`/api/courses/${courseId}/modules`);
      if (!response.ok) throw new Error('Failed to fetch course modules');
      const data = await response.json();
      set(state => ({
        courseModules: {
          ...state.courseModules,
          [courseId]: data.data || [],
        }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, courseModules: errorMessage } }));
      toast.error('Failed to load course modules.');
    } finally {
      set(state => ({ loading: { ...state.loading, courseModules: false } }));
    }
  },
  // --- The rest of the actions from previous phases ---
  // (Unchanged actions are omitted for brevity but are still part of the store)
  addCourse: async (courseData) => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to add course');
      }
      toast.success('Course added successfully!');
      await get().fetchCourses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to add course: ${errorMessage}`);
    }
  },
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });
      if (!response.ok) {
        throw new Error('Failed to update course');
      }
      toast.success('Course updated successfully!');
      await get().fetchCourseById(courseId);
      await get().fetchCourses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to update course: ${errorMessage}`);
    }
  },
  changePassword: async (passwords) => {
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to change password');
      }
      toast.success('Password changed successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Error: ${errorMessage}`);
      throw error;
    }
  },
  adminResetPassword: async (userId, newPassword) => {
    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }
      toast.success('Password has been reset successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Error: ${errorMessage}`);
      throw error;
    }
  },
  fetchCourseProgress: async (courseId: string) => {
    set(state => ({ loading: { ...state.loading, courseProgress: true }, error: { ...state.error, courseProgress: null } }));
    try {
      const response = await fetch(`/api/courses/${courseId}/progress`);
      if (!response.ok) throw new Error('Failed to fetch course progress');
      const data = await response.json();
      set({ courseProgress: data.data || {} });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, courseProgress: errorMessage } }));
      toast.error('Failed to load course progress.');
    } finally {
      set(state => ({ loading: { ...state.loading, courseProgress: false } }));
    }
  },
  fetchNotesForStudent: async (studentId) => {
    set(state => ({ loading: { ...state.loading, studentNotes: true }, error: { ...state.error, studentNotes: null } }));
    try {
      const response = await fetch(`/api/students/${studentId}/notes`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      set({ studentNotes: data.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, studentNotes: errorMessage } }));
      toast.error('Failed to load notes.');
    } finally {
      set(state => ({ loading: { ...state.loading, studentNotes: false } }));
    }
  },
  addNoteForStudent: async (studentId, noteData) => {
    try {
      const response = await fetch(`/api/students/${studentId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });
      if (!response.ok) throw new Error('Failed to add note');
      toast.success('Note added successfully!');
      await get().fetchNotesForStudent(studentId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to add note: ${errorMessage}`);
    }
  },
  deleteNote: async (noteId) => {
    const studentId = get().currentStudent?.id;
    try {
      const response = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete note');
      toast.success('Note deleted successfully!');
      if (studentId) await get().fetchNotesForStudent(studentId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to delete note: ${errorMessage}`);
    }
  },
  fetchStudentProgress: async (studentId: string) => {
    set(state => ({ loading: { ...state.loading, studentProgress: true }, error: { ...state.error, studentProgress: null } }));
    try {
      const response = await fetch(`/api/progress/${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch student progress');
      const data = await response.json();
      set({ studentProgress: data.data || {} });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, studentProgress: errorMessage } }));
      toast.error('Failed to load student progress.');
    } finally {
      set(state => ({ loading: { ...state.loading, studentProgress: false } }));
    }
  },
  updateSubTopicProgress: async (studentId, courseId, subTopicId, completed) => {
    try {
      const response = await fetch(`/api/progress/${studentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, subTopicId, completed }),
      });
      if (!response.ok) throw new Error('Failed to update progress');
      await get().fetchStudentProgress(studentId);
      toast.success('Progress updated!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to update progress: ${errorMessage}`);
      await get().fetchStudentProgress(studentId);
    }
  },
  fetchIdeas: async () => {
    set(state => ({ loading: { ...state.loading, ideas: true }, error: { ...state.error, ideas: null } }));
    try {
      const response = await fetch('/api/ideas');
      if (!response.ok) throw new Error('Failed to fetch ideas');
      const data = await response.json();
      set({ ideas: data.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, ideas: errorMessage } }));
      toast.error('Failed to load ideas.');
    } finally {
      set(state => ({ loading: { ...state.loading, ideas: false } }));
    }
  },
  addIdea: async (ideaData) => {
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ideaData),
      });
      if (!response.ok) throw new Error('Failed to add idea');
      toast.success('Idea posted successfully!');
      await get().fetchIdeas();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to post idea: ${errorMessage}`);
    }
  },
  deleteIdea: async (id) => {
    try {
      const response = await fetch(`/api/ideas/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete idea');
      toast.success('Idea deleted successfully!');
      await get().fetchIdeas();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to delete idea: ${errorMessage}`);
    }
  },
  fetchCourses: async () => {
    set(state => ({ loading: { ...state.loading, courses: true }, error: { ...state.error, courses: null } }));
    try {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      const data = await response.json();
      set({ courses: data.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, courses: errorMessage } }));
      toast.error('Failed to load courses.');
    } finally {
      set(state => ({ loading: { ...state.loading, courses: false } }));
    }
  },
  fetchCoursesForInstructor: async (instructorId: string) => {
    set(state => ({ loading: { ...state.loading, instructorCourses: true }, error: { ...state.error, instructorCourses: null } }));
    try {
      const response = await fetch(`/api/instructors/${instructorId}/courses`);
      if (!response.ok) throw new Error("Failed to fetch instructor's courses");
      const data = await response.json();
      set({ instructorCourses: data.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, instructorCourses: errorMessage } }));
      toast.error("Failed to load instructor's courses.");
    } finally {
      set(state => ({ loading: { ...state.loading, instructorCourses: false } }));
    }
  },
  deleteCourse: async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete course');
      toast.success('Course deleted successfully!');
      await get().fetchCourses();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to delete course: ${errorMessage}`);
    }
  },
  fetchStudents: async () => {
    set(state => ({ loading: { ...state.loading, students: true }, error: { ...state.error, students: null } }));
    try {
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      set({ students: data.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, students: errorMessage } }));
      toast.error('Failed to load students.');
    } finally {
      set(state => ({ loading: { ...state.loading, students: false } }));
    }
  },
  fetchStudentsForInstructor: async (instructorId: string) => {
    set(state => ({ loading: { ...state.loading, instructorStudents: true }, error: { ...state.error, instructorStudents: null } }));
    try {
      const response = await fetch(`/api/instructors/${instructorId}/students`);
      if (!response.ok) throw new Error("Failed to fetch instructor's students");
      const data = await response.json();
      set({ instructorStudents: data.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, instructorStudents: errorMessage } }));
      toast.error("Failed to load instructor's students.");
    } finally {
      set(state => ({ loading: { ...state.loading, instructorStudents: false } }));
    }
  },
  addStudent: async (studentData) => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      if (!response.ok) throw new Error('Failed to add student');
      const newStudent = await response.json();
      toast.success(`Student ${newStudent.data.name} created!`, {
        description: `Default Password: ${newStudent.data.defaultPassword}`,
        duration: 10000,
      });
      await get().fetchStudents();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to add student: ${errorMessage}`);
    }
  },
  updateStudent: async (id, studentData) => {
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      if (!response.ok) throw new Error('Failed to update student');
      toast.success('Student updated successfully!');
      await get().fetchStudents();
      if (get().currentStudent?.id === id) {
        await get().fetchStudentById(id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to update student: ${errorMessage}`);
    }
  },
  fetchInstructors: async () => {
    set(state => ({ loading: { ...state.loading, instructors: true }, error: { ...state.error, instructors: null } }));
    try {
      const response = await fetch('/api/instructors');
      if (!response.ok) throw new Error('Failed to fetch instructors');
      const data = await response.json();
      set({ instructors: data.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, instructors: errorMessage } }));
      toast.error('Failed to load instructors.');
    } finally {
      set(state => ({ loading: { ...state.loading, instructors: false } }));
    }
  },
  addInstructor: async (instructorData) => {
    try {
      const response = await fetch('/api/instructors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instructorData),
      });
      if (!response.ok) throw new Error('Failed to add instructor');
      const newInstructor = await response.json();
      toast.success(`Instructor ${newInstructor.data.name} created!`, {
        description: `Default Password: ${newInstructor.data.defaultPassword}`,
        duration: 10000,
      });
      await get().fetchInstructors();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to add instructor: ${errorMessage}`);
    }
  },
  updateInstructor: async (id, instructorData) => {
    try {
      const response = await fetch(`/api/instructors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instructorData),
      });
      if (!response.ok) throw new Error('Failed to update instructor');
      toast.success('Instructor updated successfully!');
      await get().fetchInstructors();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to update instructor: ${errorMessage}`);
    }
  },
  deleteInstructor: async (id) => {
    try {
      const response = await fetch(`/api/instructors/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete instructor');
      toast.success('Instructor deleted successfully!');
      await get().fetchInstructors();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to delete instructor: ${errorMessage}`);
    }
  },
  fetchUser: async () => {
    set(state => ({ loading: { ...state.loading, user: true }, error: { ...state.error, user: null } }));
    try {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      set({ user: data.data || null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, user: errorMessage } }));
      toast.error('Failed to load user profile.');
    } finally {
      set(state => ({ loading: { ...state.loading, user: false } }));
    }
  },
  updateUser: async (userData) => {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to update user profile');
      const data = await response.json();
      set({ user: data.data });
      toast.success('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to update profile: ${errorMessage}`);
    }
  },
  fetchEvents: async () => {
    set(state => ({ loading: { ...state.loading, events: true }, error: { ...state.error, events: null } }));
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch calendar events');
      const data = await response.json();
      const parsedEvents = (data.data || []).map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      set({ events: parsedEvents });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, events: errorMessage } }));
      toast.error('Failed to load calendar events.');
    } finally {
      set(state => ({ loading: { ...state.loading, events: false } }));
    }
  },
  addEvent: async (eventData) => {
    try {
      const payload = {
        ...eventData,
        start: eventData.start.toISOString(),
        end: eventData.end.toISOString(),
      };
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to add event');
      toast.success('Event added successfully!');
      await get().fetchEvents();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to add event: ${errorMessage}`);
    }
  },
  updateEvent: async (id, eventData) => {
    try {
      const payload = {
        ...eventData,
        ...(eventData.start && { start: eventData.start.toISOString() }),
        ...(eventData.end && { end: eventData.end.toISOString() }),
      };
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update event');
      toast.success('Event updated successfully!');
      await get().fetchEvents();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to update event: ${errorMessage}`);
    }
  },
  deleteEvent: async (id) => {
    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete event');
      toast.success('Event deleted successfully!');
      await get().fetchEvents();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to delete event: ${errorMessage}`);
    }
  },
  fetchCourseById: async (id: string) => {
    set(state => ({ loading: { ...state.loading, currentCourse: true }, error: { ...state.error, currentCourse: null } }));
    try {
      const response = await fetch(`/api/courses/${id}`);
      if (!response.ok) throw new Error('Failed to fetch course details');
      const data = await response.json();
      set({ currentCourse: data.data || null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, currentCourse: errorMessage } }));
      toast.error('Failed to load course details.');
    } finally {
      set(state => ({ loading: { ...state.loading, currentCourse: false } }));
    }
  },
  addModule: async (courseId, moduleData) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleData),
      });
      if (!response.ok) throw new Error('Failed to add module');
      toast.success('Module added successfully!');
      await get().fetchModulesForCourse(courseId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to add module: ${errorMessage}`);
    }
  },
  updateModule: async (moduleId, moduleData) => {
    const courseId = get().currentCourse?.id;
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moduleData),
      });
      if (!response.ok) throw new Error('Failed to update module');
      toast.success('Module updated successfully!');
      if (courseId) await get().fetchModulesForCourse(courseId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to update module: ${errorMessage}`);
    }
  },
  deleteModule: async (moduleId) => {
    const courseId = get().currentCourse?.id;
    try {
      const response = await fetch(`/api/modules/${moduleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete module');
      toast.success('Module deleted successfully!');
      if (courseId) await get().fetchModulesForCourse(courseId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to delete module: ${errorMessage}`);
    }
  },
  fetchSubTopicsForModule: async (moduleId: string) => {
    set(state => ({ loading: { ...state.loading, moduleSubTopics: true }, error: { ...state.error, moduleSubTopics: null } }));
    try {
      const response = await fetch(`/api/modules/${moduleId}/subtopics`);
      if (!response.ok) throw new Error('Failed to fetch sub-topics');
      const data = await response.json();
      set(state => ({ moduleSubTopics: { ...state.moduleSubTopics, [moduleId]: data.data || [] } }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, moduleSubTopics: errorMessage } }));
      toast.error('Failed to load sub-topics.');
    } finally {
      set(state => ({ loading: { ...state.loading, moduleSubTopics: false } }));
    }
  },
  addSubTopic: async (moduleId, subTopicData) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}/subtopics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subTopicData),
      });
      if (!response.ok) throw new Error('Failed to add sub-topic');
      toast.success('Sub-topic added successfully!');
      await get().fetchSubTopicsForModule(moduleId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to add sub-topic: ${errorMessage}`);
    }
  },
  updateSubTopic: async (subTopicId, subTopicData) => {
    const moduleId = Object.keys(get().moduleSubTopics).find(key => get().moduleSubTopics[key].some(st => st.id === subTopicId));
    try {
      const response = await fetch(`/api/subtopics/${subTopicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subTopicData),
      });
      if (!response.ok) throw new Error('Failed to update sub-topic');
      toast.success('Sub-topic updated successfully!');
      if (moduleId) await get().fetchSubTopicsForModule(moduleId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to update sub-topic: ${errorMessage}`);
    }
  },
  deleteSubTopic: async (subTopicId) => {
    const moduleId = Object.keys(get().moduleSubTopics).find(key => get().moduleSubTopics[key].some(st => st.id === subTopicId));
    try {
      const response = await fetch(`/api/subtopics/${subTopicId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete sub-topic');
      toast.success('Sub-topic deleted successfully!');
      if (moduleId) await get().fetchSubTopicsForModule(moduleId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to delete sub-topic: ${errorMessage}`);
    }
  },
  fetchCourseContent: async (courseId: string) => {
    set(state => ({ loading: { ...state.loading, courseContent: true }, error: { ...state.error, courseContent: null } }));
    try {
      const response = await fetch(`/api/courses/${courseId}/content`);
      if (!response.ok) throw new Error('Failed to fetch course content');
      const data = await response.json();
      set({ courseContent: data.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, courseContent: errorMessage } }));
      toast.error('Failed to load course content.');
    } finally {
      set(state => ({ loading: { ...state.loading, courseContent: false } }));
    }
  },
  addCourseContent: async (courseId, contentData) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData),
      });
      if (!response.ok) throw new Error('Failed to add content');
      toast.success('Content added successfully!');
      await get().fetchCourseContent(courseId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to add content: ${errorMessage}`);
    }
  },
  updateCourseContent: async (contentId, contentData) => {
    const courseId = get().currentCourse?.id;
    try {
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData),
      });
      if (!response.ok) throw new Error('Failed to update content');
      toast.success('Content updated successfully!');
      if (courseId) await get().fetchCourseContent(courseId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to update content: ${errorMessage}`);
    }
  },
  deleteCourseContent: async (contentId) => {
    const courseId = get().currentCourse?.id;
    try {
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete content');
      toast.success('Content deleted successfully!');
      if (courseId) await get().fetchCourseContent(courseId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to delete content: ${errorMessage}`);
    }
  },
  fetchStudentById: async (id: string) => {
    set(state => ({ loading: { ...state.loading, currentStudent: true }, error: { ...state.error, currentStudent: null } }));
    try {
      const response = await fetch(`/api/students/${id}`);
      if (!response.ok) throw new Error('Failed to fetch student details');
      const data = await response.json();
      set({ currentStudent: data.data || null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, currentStudent: errorMessage } }));
      toast.error('Failed to load student details.');
    } finally {
      set(state => ({ loading: { ...state.loading, currentStudent: false } }));
    }
  },
  fetchCoursesForStudent: async (studentId: string) => {
    set(state => ({ loading: { ...state.loading, studentCourses: true }, error: { ...state.error, studentCourses: null } }));
    try {
      const response = await fetch(`/api/students/${studentId}/courses`);
      if (!response.ok) throw new Error("Failed to fetch student's courses");
      const data = await response.json();
      set({ studentCourses: data.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, studentCourses: errorMessage } }));
      toast.error("Failed to load student's courses.");
    } finally {
      set(state => ({ loading: { ...state.loading, studentCourses: false } }));
    }
  },
  fetchStudentsForCourse: async (courseId: string) => {
    set(state => ({ loading: { ...state.loading, courseStudents: true }, error: { ...state.error, courseStudents: null } }));
    try {
      const response = await fetch(`/api/courses/${courseId}/students`);
      if (!response.ok) throw new Error("Failed to fetch course's students");
      const data = await response.json();
      set({ courseStudents: data.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, courseStudents: errorMessage } }));
      toast.error("Failed to load course's students.");
    } finally {
      set(state => ({ loading: { ...state.loading, courseStudents: false } }));
    }
  },
  enrollStudentInCourse: async (courseId, studentId) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId }),
      });
      if (!response.ok) throw new Error('Failed to enroll student');
      toast.success('Student enrolled successfully!');
      await Promise.all([
        get().fetchStudentsForCourse(courseId),
        get().fetchCourseById(courseId),
        get().fetchStudents(),
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to enroll student: ${errorMessage}`);
    }
  },
  unenrollStudentFromCourse: async (courseId, studentId) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/students/${studentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to unenroll student');
      toast.success('Student unenrolled successfully!');
      await Promise.all([
        get().fetchStudentsForCourse(courseId),
        get().fetchCourseById(courseId),
        get().fetchStudents(),
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to unenroll student: ${errorMessage}`);
    }
  },
  fetchAnalyticsData: async () => {
    set(state => ({ loading: { ...state.loading, analytics: true }, error: { ...state.error, analytics: null } }));
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      const data = await response.json();
      set({ analyticsData: data.data || null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, analytics: errorMessage } }));
      toast.error('Failed to load analytics data.');
    } finally {
      set(state => ({ loading: { ...state.loading, analytics: false } }));
    }
  },
  fetchAIPrediction: async (studentId: string) => {
    set(state => ({ loading: { ...state.loading, prediction: true }, error: { ...state.error, prediction: null }, currentStudentPrediction: null }));
    try {
      const response = await fetch(`/api/students/${studentId}/prediction`);
      if (!response.ok) throw new Error('Failed to fetch AI prediction');
      const data = await response.json();
      set({ currentStudentPrediction: data.data || null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, prediction: errorMessage } }));
      toast.error('Failed to load AI prediction.');
    } finally {
      set(state => ({ loading: { ...state.loading, prediction: false } }));
    }
  },
  fetchTransactions: async () => {
    set(state => ({ loading: { ...state.loading, transactions: true }, error: { ...state.error, transactions: null } }));
    try {
      const response = await fetch('/api/finance/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      set({ transactions: data.data || [] });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      set(state => ({ error: { ...state.error, transactions: errorMessage } }));
      toast.error('Failed to load transactions.');
    } finally {
      set(state => ({ loading: { ...state.loading, transactions: false } }));
    }
  },
  addTransaction: async (txData) => {
    try {
      const response = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData),
      });
      if (!response.ok) throw new Error('Failed to add transaction');
      toast.success('Transaction added successfully!');
      await get().fetchTransactions();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to add transaction: ${errorMessage}`);
    }
  },
  updateTransaction: async (id, txData) => {
    try {
      const response = await fetch(`/api/finance/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData),
      });
      if (!response.ok) throw new Error('Failed to update transaction');
      toast.success('Transaction updated successfully!');
      await get().fetchTransactions();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to update transaction: ${errorMessage}`);
    }
  },
  deleteTransaction: async (id) => {
    try {
      const response = await fetch(`/api/finance/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete transaction');
      toast.success('Transaction deleted successfully!');
      await get().fetchTransactions();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Failed to delete transaction: ${errorMessage}`);
    }
  },
}));