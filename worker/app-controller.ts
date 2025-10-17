import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, Course, Student, Instructor, User, CalendarEvent, CourseModule, Enrollment, AnalyticsData, AIPrediction, Transaction, Idea, CourseContent, SubTopic, StudentProgress, Note, CourseProgress, UpcomingTopic } from './types';
import type { Env } from './core-utils';
import { mockAdminUser, mockCareerPaths } from '../src/lib/mockData';
const ADMIN_CODE = "ZAVIA_ADMIN_2024";
const INSTRUCTOR_CODE = "ZAVIA_INSTRUCTOR_2024";
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private users = new Map<string, User>();
  private courses = new Map<string, Course>();
  private students = new Map<string, Student>();
  private instructors = new Map<string, Instructor>();
  private events = new Map<string, CalendarEvent>();
  private modules = new Map<string, CourseModule>();
  private subTopics = new Map<string, SubTopic>();
  private enrollments = new Map<string, Enrollment>();
  private transactions = new Map<string, Transaction>();
  private ideas = new Map<string, Idea>();
  private courseContents = new Map<string, CourseContent>();
  private studentProgress = new Map<string, StudentProgress>();
  private notes = new Map<string, Note>();
  private user: User | null = null;
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.list<any>();
      this.sessions = stored.get('sessions') || new Map();
      this.users = stored.get('users') || new Map();
      this.courses = stored.get('courses') || new Map();
      this.students = stored.get('students') || new Map();
      this.instructors = stored.get('instructors') || new Map();
      this.events = stored.get('events') || new Map();
      this.modules = stored.get('modules') || new Map();
      this.subTopics = stored.get('subTopics') || new Map();
      this.enrollments = stored.get('enrollments') || new Map();
      this.transactions = stored.get('transactions') || new Map();
      this.ideas = stored.get('ideas') || new Map();
      this.courseContents = stored.get('courseContents') || new Map();
      this.studentProgress = stored.get('studentProgress') || new Map();
      this.notes = stored.get('notes') || new Map();
      this.user = stored.get('user') || null;
      if (this.users.size === 0) {
        this.seedData();
      }
      this.loaded = true;
    }
  }
  private seedData(): void {
    // Seed only the first admin user
    const adminUser = { ...mockAdminUser, password: 'password123' };
    this.users.set(adminUser.id, adminUser);
    this.user = adminUser; // for settings page compatibility
  }
  private async persist(): Promise<void> {
    await this.ctx.storage.put({
      sessions: this.sessions,
      users: this.users,
      courses: this.courses,
      students: this.students,
      instructors: this.instructors,
      user: this.user,
      events: this.events,
      modules: this.modules,
      subTopics: this.subTopics,
      enrollments: this.enrollments,
      transactions: this.transactions,
      ideas: this.ideas,
      courseContents: this.courseContents,
      studentProgress: this.studentProgress,
      notes: this.notes,
    });
  }
  // --- Course Methods ---
  async addCourse(courseData: Partial<Omit<Course, 'createdAt'>> & { title: string, instructorId: string }): Promise<Course | { error: string }> {
    await this.ensureLoaded();
    let courseId = courseData.id;
    if (courseId) {
      if (this.courses.has(courseId)) {
        return { error: 'Course ID already in use.' };
      }
    } else {
      courseId = `ZAI-${String(this.courses.size + 1).padStart(3, '0')}`;
    }
    const newCourse: Course = {
      id: courseId,
      title: courseData.title,
      instructorId: courseData.instructorId,
      createdAt: new Date().toISOString(),
      enrolled: 0,
      progress: 0,
      status: 'On Track',
      nextClass: 'Not scheduled',
    };
    this.courses.set(newCourse.id, newCourse);
    await this.persist();
    return newCourse;
  }
  async updateCourse(courseId: string, courseData: Partial<Pick<Course, 'title' | 'description'>>): Promise<Course | { error: string }> {
    await this.ensureLoaded();
    const course = this.courses.get(courseId);
    if (!course) {
      return { error: 'Course not found' };
    }
    const updatedCourse = { ...course, ...courseData };
    this.courses.set(courseId, updatedCourse);
    await this.persist();
    return updatedCourse;
  }
  // --- The rest of the methods from previous phases ---
  // (Unchanged methods are omitted for brevity but are still part of the class)
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: true } | { error: string }> {
    await this.ensureLoaded();
    const user = this.users.get(userId);
    if (!user) {
      return { error: 'User not found.' };
    }
    if (user.password !== currentPassword) {
      return { error: 'Incorrect current password.' };
    }
    user.password = newPassword;
    this.users.set(userId, user);
    await this.persist();
    return { success: true };
  }
  async adminResetPassword(userId: string, newPassword: string): Promise<{ success: true } | { error: string }> {
    await this.ensureLoaded();
    const user = this.users.get(userId);
    if (!user) {
      return { error: 'User not found.' };
    }
    user.password = newPassword;
    this.users.set(userId, user);
    await this.persist();
    return { success: true };
  }
  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    await this.ensureLoaded();
    const courseProgress: CourseProgress = {};
    const enrolledStudents = Array.from(this.enrollments.values()).filter(e => e.courseId === courseId);
    const totalStudents = enrolledStudents.length;
    const courseModules = Array.from(this.modules.values()).filter(m => m.courseId === courseId);
    for (const module of courseModules) {
      const moduleSubTopics = Array.from(this.subTopics.values()).filter(st => st.moduleId === module.id);
      for (const subTopic of moduleSubTopics) {
        let completedCount = 0;
        for (const enrollment of enrolledStudents) {
          const progress = this.studentProgress.get(enrollment.studentId);
          if (progress && progress[courseId]?.includes(subTopic.id)) {
            completedCount++;
          }
        }
        courseProgress[subTopic.id] = { completed: completedCount, total: totalStudents };
      }
    }
    return courseProgress;
  }
  async listNotesForStudent(studentId: string): Promise<Note[]> {
    await this.ensureLoaded();
    return Array.from(this.notes.values())
      .filter(note => note.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async addNote(noteData: Omit<Note, 'id' | 'createdAt' | 'authorName'>): Promise<Note | { error: string }> {
    await this.ensureLoaded();
    const author = this.users.get(noteData.authorId);
    if (!author) return { error: 'Author not found' };
    const newNote: Note = {
      ...noteData,
      id: `note-${this.notes.size + 1}`,
      authorName: author.name,
      createdAt: new Date().toISOString(),
    };
    this.notes.set(newNote.id, newNote);
    await this.persist();
    return newNote;
  }
  async deleteNote(noteId: string): Promise<{ success: true } | { error: string }> {
    await this.ensureLoaded();
    if (!this.notes.has(noteId)) return { error: 'Note not found' };
    this.notes.delete(noteId);
    await this.persist();
    return { success: true };
  }
  async registerUser(userData: Omit<User, 'id' | 'avatarUrl'> & { password: string, registrationCode?: string }): Promise<User | { error: string }> {
    await this.ensureLoaded();
    const { email, role, registrationCode } = userData;
    if (role === 'Admin' && registrationCode !== ADMIN_CODE) {
      return { error: 'Invalid registration code for Admin role.' };
    }
    if (role === 'Instructor' && registrationCode !== INSTRUCTOR_CODE) {
      return { error: 'Invalid registration code for Instructor role.' };
    }
    const existingUser = Array.from(this.users.values()).find(u => u.email === email);
    if (existingUser) {
      return { error: 'User with this email already exists.' };
    }
    const newUser: User = {
      id: `user-${this.users.size + 1}`,
      name: userData.name,
      email: userData.email,
      password: userData.password, // In a real app, hash this password
      role: role,
      avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
    };
    this.users.set(newUser.id, newUser);
    if(role === 'Student') {
        const newStudent: Student = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            avatarUrl: newUser.avatarUrl,
            coursesEnrolled: 0,
            overallProgress: 0,
            joinDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            gender: 'Male', // default
        };
        this.students.set(newStudent.id, newStudent);
    } else if (role === 'Instructor') {
        const newInstructor: Instructor = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            avatarUrl: newUser.avatarUrl,
            createdAt: new Date().toISOString(),
            gender: 'Male', // default
        };
        this.instructors.set(newInstructor.id, newInstructor);
    }
    await this.persist();
    const { password, ...userToReturn } = newUser;
    return userToReturn;
  }
  async loginUser(credentials: { email: string; password: string }): Promise<User | { error: string }> {
    await this.ensureLoaded();
    const user = Array.from(this.users.values()).find(u => u.email === credentials.email);
    if (!user || user.password !== credentials.password) {
      return { error: 'Invalid email or password.' };
    }
    const { password, ...userToReturn } = user;
    return userToReturn;
  }
  async getUser(): Promise<User | null> {
    await this.ensureLoaded();
    return this.user;
  }
  async updateUser(userData: Partial<User>): Promise<User | null> {
    await this.ensureLoaded();
    if (this.user) {
      const updatedFields: Partial<User> = {};
      if (userData.name !== undefined) updatedFields.name = userData.name;
      if (userData.email !== undefined) updatedFields.email = userData.email;
      if (userData.profilePictureUrl !== undefined) updatedFields.profilePictureUrl = userData.profilePictureUrl;
      if (userData.phone !== undefined) updatedFields.phone = userData.phone;
      if (userData.googleMeetId !== undefined) updatedFields.googleMeetId = userData.googleMeetId;
      this.user = { ...this.user, ...updatedFields };
      const mainUserRecord = this.users.get(this.user.id);
      if (mainUserRecord) {
        this.users.set(this.user.id, { ...mainUserRecord, ...updatedFields });
      }
      if (this.user.role === 'Student') {
        const studentRecord = this.students.get(this.user.id);
        if (studentRecord) {
          this.students.set(this.user.id, { ...studentRecord, ...updatedFields });
        }
      } else if (this.user.role === 'Instructor') {
        const instructorRecord = this.instructors.get(this.user.id);
        if (instructorRecord) {
          this.instructors.set(this.user.id, { ...instructorRecord, ...updatedFields });
        }
      }
      await this.persist();
    }
    return this.user;
  }
  async listInstructors(): Promise<Instructor[]> {
    await this.ensureLoaded();
    return Array.from(this.instructors.values());
  }
  async addInstructor(instructorData: Omit<Instructor, 'id' | 'createdAt'>): Promise<Instructor> {
    await this.ensureLoaded();
    const defaultPassword = `instr-${Math.random().toString(36).slice(2, 10)}`;
    const newInstructor: Instructor = {
      ...instructorData,
      id: `instr-${this.instructors.size + 1}`,
      createdAt: new Date().toISOString(),
      defaultPassword,
    };
    this.instructors.set(newInstructor.id, newInstructor);
    const newUser: User = {
      id: newInstructor.id,
      name: newInstructor.name,
      email: newInstructor.email,
      avatarUrl: newInstructor.avatarUrl,
      role: 'Instructor',
      password: defaultPassword,
      profilePictureUrl: instructorData.profilePictureUrl,
      phone: instructorData.phone,
      googleMeetId: instructorData.googleMeetId,
    };
    this.users.set(newUser.id, newUser);
    await this.persist();
    return newInstructor;
  }
  async updateInstructor(id: string, instructorData: Partial<Omit<Instructor, 'id' | 'createdAt'>>): Promise<Instructor | { error: string }> {
    await this.ensureLoaded();
    const instructor = this.instructors.get(id);
    if (!instructor) return { error: 'Instructor not found' };
    const updatedInstructor = { ...instructor, ...instructorData };
    this.instructors.set(id, updatedInstructor);
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...instructorData };
      this.users.set(id, updatedUser);
    }
    await this.persist();
    return updatedInstructor;
  }
  async deleteInstructor(id: string): Promise<{ success: true } | { error: string }> {
    await this.ensureLoaded();
    if (!this.instructors.has(id)) return { error: 'Instructor not found' };
    this.instructors.delete(id);
    this.users.delete(id);
    await this.persist();
    return { success: true };
  }
  async listStudents(): Promise<Student[]> {
    await this.ensureLoaded();
    return Array.from(this.students.values());
  }
  async listStudentsForInstructor(instructorId: string): Promise<Student[]> {
    await this.ensureLoaded();
    const instructorCourses = Array.from(this.courses.values()).filter(c => c.instructorId === instructorId);
    const instructorCourseIds = new Set(instructorCourses.map(c => c.id));
    const studentIds = new Set<string>();
    for (const enrollment of this.enrollments.values()) {
      if (instructorCourseIds.has(enrollment.courseId)) {
        studentIds.add(enrollment.studentId);
      }
    }
    return Array.from(studentIds).map(id => this.students.get(id)).filter(Boolean) as Student[];
  }
  async getStudentById(id: string): Promise<Student | null> {
    await this.ensureLoaded();
    return this.students.get(id) || null;
  }
  async addStudent(studentData: Omit<Student, 'id' | 'createdAt'>): Promise<Student> {
    await this.ensureLoaded();
    const defaultPassword = `student-${Math.random().toString(36).slice(2, 10)}`;
    const newStudent: Student = {
      ...studentData,
      id: `S${String(this.students.size + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      coursesEnrolled: 0,
      overallProgress: 0,
      defaultPassword,
    };
    this.students.set(newStudent.id, newStudent);
    const newUser: User = {
      id: newStudent.id,
      name: newStudent.name,
      email: newStudent.email,
      avatarUrl: newStudent.avatarUrl,
      role: 'Student',
      password: defaultPassword,
      profilePictureUrl: studentData.profilePictureUrl,
      phone: studentData.phone,
      googleMeetId: studentData.googleMeetId,
    };
    this.users.set(newUser.id, newUser);
    await this.persist();
    return newStudent;
  }
  async updateStudent(id: string, studentData: Partial<Omit<Student, 'id' | 'createdAt'>>): Promise<Student | { error: string }> {
    await this.ensureLoaded();
    const student = this.students.get(id);
    if (!student) return { error: 'Student not found' };
    const updatedStudent = { ...student, ...studentData };
    this.students.set(id, updatedStudent);
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...studentData };
      this.users.set(id, updatedUser);
    }
    await this.persist();
    return updatedStudent;
  }
  async getStudentProgress(studentId: string): Promise<StudentProgress> {
    await this.ensureLoaded();
    return this.studentProgress.get(studentId) || {};
  }
  async updateSubTopicProgress(studentId: string, courseId: string, subTopicId: string, completed: boolean): Promise<StudentProgress> {
    await this.ensureLoaded();
    const progress = this.studentProgress.get(studentId) || {};
    if (!progress[courseId]) {
      progress[courseId] = [];
    }
    const completedTopics = new Set(progress[courseId]);
    if (completed) {
      completedTopics.add(subTopicId);
    } else {
      completedTopics.delete(subTopicId);
    }
    progress[courseId] = Array.from(completedTopics);
    this.studentProgress.set(studentId, progress);
    await this.persist();
    return progress;
  }
  async listSubTopicsForModule(moduleId: string): Promise<SubTopic[]> {
    await this.ensureLoaded();
    return Array.from(this.subTopics.values()).filter(st => st.moduleId === moduleId);
  }
  async addSubTopic(moduleId: string, subTopicData: Omit<SubTopic, 'id' | 'moduleId'>): Promise<SubTopic> {
    await this.ensureLoaded();
    const newSubTopic: SubTopic = {
      ...subTopicData,
      id: `ST${String(this.subTopics.size + 1).padStart(3, '0')}`,
      moduleId,
    };
    this.subTopics.set(newSubTopic.id, newSubTopic);
    await this.persist();
    return newSubTopic;
  }
  async updateSubTopic(subTopicId: string, subTopicData: Partial<Omit<SubTopic, 'id' | 'moduleId'>>): Promise<SubTopic | { error: string }> {
    await this.ensureLoaded();
    const subTopic = this.subTopics.get(subTopicId);
    if (!subTopic) return { error: 'Sub-topic not found' };
    const updatedSubTopic = { ...subTopic, ...subTopicData };
    this.subTopics.set(subTopicId, updatedSubTopic);
    await this.persist();
    return updatedSubTopic;
  }
  async deleteSubTopic(subTopicId: string): Promise<{ success: true } | { error: string }> {
    await this.ensureLoaded();
    if (!this.subTopics.has(subTopicId)) return { error: 'Sub-topic not found' };
    this.subTopics.delete(subTopicId);
    await this.persist();
    return { success: true };
  }
  async listCourseContent(courseId: string): Promise<CourseContent[]> {
    await this.ensureLoaded();
    return Array.from(this.courseContents.values()).filter(c => c.courseId === courseId);
  }
  async addCourseContent(courseId: string, contentData: Omit<CourseContent, 'id' | 'courseId'>): Promise<CourseContent> {
    await this.ensureLoaded();
    const newContent: CourseContent = {
      ...contentData,
      id: `content-${this.courseContents.size + 1}`,
      courseId,
    };
    this.courseContents.set(newContent.id, newContent);
    await this.persist();
    return newContent;
  }
  async updateCourseContent(contentId: string, contentData: Partial<Omit<CourseContent, 'id' | 'courseId'>>): Promise<CourseContent | { error: string }> {
    await this.ensureLoaded();
    const content = this.courseContents.get(contentId);
    if (!content) return { error: 'Content not found' };
    const updatedContent = { ...content, ...contentData };
    this.courseContents.set(contentId, updatedContent);
    await this.persist();
    return updatedContent;
  }
  async deleteCourseContent(contentId: string): Promise<{ success: true } | { error: string }> {
    await this.ensureLoaded();
    if (!this.courseContents.has(contentId)) return { error: 'Content not found' };
    this.courseContents.delete(contentId);
    await this.persist();
    return { success: true };
  }
  async listIdeas(): Promise<Idea[]> {
    await this.ensureLoaded();
    return Array.from(this.ideas.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async addIdea(ideaData: Omit<Idea, 'id' | 'createdAt' | 'studentName' | 'studentAvatarUrl'>): Promise<Idea | { error: string }> {
    await this.ensureLoaded();
    const student = this.users.get(ideaData.studentId);
    if (!student) {
      return { error: 'Student not found' };
    }
    const newIdea: Idea = {
      ...ideaData,
      id: `idea-${this.ideas.size + 1}`,
      createdAt: new Date().toISOString(),
      studentName: student.name,
      studentAvatarUrl: student.avatarUrl,
    };
    this.ideas.set(newIdea.id, newIdea);
    await this.persist();
    return newIdea;
  }
  async deleteIdea(id: string): Promise<{ success: true } | { error: string }> {
    await this.ensureLoaded();
    if (!this.ideas.has(id)) {
      return { error: 'Idea not found' };
    }
    this.ideas.delete(id);
    await this.persist();
    return { success: true };
  }
  async listUpcomingTopics(userId: string): Promise<UpcomingTopic[]> {
    await this.ensureLoaded();
    const user = this.users.get(userId);
    if (!user || user.role !== 'Student') {
      return [];
    }

    const studentEnrollments = Array.from(this.enrollments.values()).filter(e => e.studentId === userId);
    const studentProgress = this.studentProgress.get(userId) || {};
    const upcomingTopics: UpcomingTopic[] = [];

    for (const enrollment of studentEnrollments) {
      const course = this.courses.get(enrollment.courseId);
      if (!course) continue;

      const courseModules = Array.from(this.modules.values()).filter(m => m.courseId === course.id);
      const completedTopics = new Set(studentProgress[course.id] || []);

      for (const module of courseModules) {
        const moduleSubTopics = Array.from(this.subTopics.values()).filter(st => st.moduleId === module.id);
        const firstUncompleted = moduleSubTopics.find(st => !completedTopics.has(st.id));

        if (firstUncompleted) {
          upcomingTopics.push({
            courseId: course.id, courseTitle: course.title, moduleId: module.id, moduleTitle: module.title,
            topicId: firstUncompleted.id, topicTitle: firstUncompleted.title,
          });
          break; // Move to the next course
        }
      }
    }
    return upcomingTopics;
  }
  async listCourses(): Promise<Course[]> {
    await this.ensureLoaded();
    const coursesArray = Array.from(this.courses.values());
    return coursesArray.map(course => ({
      ...course,
      instructor: this.instructors.get(course.instructorId),
    }));
  }
  async listCoursesForInstructor(instructorId: string): Promise<Course[]> {
    await this.ensureLoaded();
    const coursesArray = Array.from(this.courses.values()).filter(c => c.instructorId === instructorId);
    return coursesArray.map(course => ({
      ...course,
      instructor: this.instructors.get(course.instructorId),
    }));
  }
  async getCourseById(id: string): Promise<Course | null> {
    await this.ensureLoaded();
    const course = this.courses.get(id);
    if (!course) return null;
    return {
      ...course,
      instructor: this.instructors.get(course.instructorId),
    };
  }
  async deleteCourse(courseId: string): Promise<{ success: true } | { error: string }> {
    await this.ensureLoaded();
    if (!this.courses.has(courseId)) {
      return { error: 'Course not found' };
    }
    this.courses.delete(courseId);
    for (const [moduleId, module] of this.modules.entries()) {
      if (module.courseId === courseId) {
        this.modules.delete(moduleId);
      }
    }
    for (const [enrollmentId, enrollment] of this.enrollments.entries()) {
      if (enrollment.courseId === courseId) {
        const student = this.students.get(enrollment.studentId);
        if (student) {
          student.coursesEnrolled = Math.max(0, student.coursesEnrolled - 1);
          this.students.set(student.id, student);
        }
        this.enrollments.delete(enrollmentId);
      }
    }
    await this.persist();
    return { success: true };
  }
  async listModulesForCourse(courseId: string): Promise<CourseModule[]> {
    await this.ensureLoaded();
    return Array.from(this.modules.values()).filter(m => m.courseId === courseId);
  }
  async addModule(courseId: string, moduleData: Omit<CourseModule, 'id' | 'courseId'>): Promise<CourseModule> {
    await this.ensureLoaded();
    const newModule: CourseModule = {
      ...moduleData,
      id: `M${String(this.modules.size + 1).padStart(3, '0')}`,
      courseId,
    };
    this.modules.set(newModule.id, newModule);
    await this.persist();
    return newModule;
  }
  async updateModule(moduleId: string, moduleData: Partial<Omit<CourseModule, 'id' | 'courseId'>>): Promise<CourseModule | { error: string }> {
    await this.ensureLoaded();
    const module = this.modules.get(moduleId);
    if (!module) return { error: 'Module not found' };
    const updatedModule = { ...module, ...moduleData };
    this.modules.set(moduleId, updatedModule);
    await this.persist();
    return updatedModule;
  }
  async deleteModule(moduleId: string): Promise<{ success: true } | { error: string }> {
    await this.ensureLoaded();
    if (!this.modules.has(moduleId)) return { error: 'Module not found' };
    this.modules.delete(moduleId);
    await this.persist();
    return { success: true };
  }
  async listCoursesForStudent(studentId: string): Promise<Course[]> {
    await this.ensureLoaded();
    const studentEnrollments = Array.from(this.enrollments.values()).filter(e => e.studentId === studentId);
    return studentEnrollments.map(e => this.courses.get(e.courseId)).filter(Boolean).map(c => ({...c, instructor: this.instructors.get(c!.instructorId)})) as Course[];
  }
  async listStudentsForCourse(courseId: string): Promise<Student[]> {
    await this.ensureLoaded();
    const courseEnrollments = Array.from(this.enrollments.values()).filter(e => e.courseId === courseId);
    return courseEnrollments.map(e => this.students.get(e.studentId)).filter(Boolean) as Student[];
  }
  async enrollStudentInCourse(courseId: string, studentId: string): Promise<Enrollment | { error: string }> {
    await this.ensureLoaded();
    const course = this.courses.get(courseId);
    const student = this.students.get(studentId);
    if (!course || !student) return { error: 'Course or Student not found' };
    const existing = Array.from(this.enrollments.values()).find(e => e.courseId === courseId && e.studentId === studentId);
    if (existing) return { error: 'Student already enrolled' };
    const newEnrollment: Enrollment = {
      id: `E${String(this.enrollments.size + 1).padStart(3, '0')}`,
      courseId,
      studentId,
      enrollmentDate: new Date().toISOString(),
    };
    this.enrollments.set(newEnrollment.id, newEnrollment);
    course.enrolled += 1;
    this.courses.set(courseId, course);
    student.coursesEnrolled += 1;
    this.students.set(studentId, student);
    await this.persist();
    return newEnrollment;
  }
  async unenrollStudentFromCourse(courseId: string, studentId: string): Promise<{ success: true } | { error: string }> {
    await this.ensureLoaded();
    const course = this.courses.get(courseId);
    const student = this.students.get(studentId);
    if (!course || !student) return { error: 'Course or Student not found' };
    const enrollment = Array.from(this.enrollments.values()).find(e => e.courseId === courseId && e.studentId === studentId);
    if (!enrollment) return { error: 'Enrollment not found' };
    this.enrollments.delete(enrollment.id);
    course.enrolled = Math.max(0, course.enrolled - 1);
    this.courses.set(courseId, course);
    student.coursesEnrolled = Math.max(0, student.coursesEnrolled - 1);
    this.students.set(studentId, student);
    await this.persist();
    return { success: true };
  }
  async getAnalyticsData(): Promise<AnalyticsData> {
    await this.ensureLoaded();
    const totalStudents = this.students.size;
    const activeCourses = this.courses.size;
    const allCourses = Array.from(this.courses.values());
    const completionRate = allCourses.reduce((acc, c) => acc + c.progress, 0) / (allCourses.length || 1);
    const coursePopularity = allCourses
      .sort((a, b) => b.enrolled - a.enrolled)
      .slice(0, 5)
      .map(c => ({ name: c.title, value: c.enrolled }));
    const studentEngagement = Array.from(this.students.values())
      .sort((a, b) => b.overallProgress - a.overallProgress)
      .slice(0, 5)
      .map(s => ({ name: s.name, value: s.overallProgress }));
    return {
      totalStudents,
      activeCourses,
      completionRate: parseFloat(completionRate.toFixed(1)),
      averageEngagement: 7.2, // Mocked for now
      studentEngagement,
      coursePopularity,
    };
  }
  async getAIPrediction(studentId: string): Promise<AIPrediction | { error: string }> {
    await this.ensureLoaded();
    const student = this.students.get(studentId);
    if (!student) return { error: 'Student not found' };
    const progressFactor = student.overallProgress / 100;
    const coursesFactor = Math.min(student.coursesEnrolled / 5, 1);
    const baseScore = (progressFactor * 0.7) + (coursesFactor * 0.3);
    const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'];
    const gradeIndex = Math.floor(baseScore * (grades.length - 1));
    const predictedGrade = grades[grades.length - 1 - gradeIndex];
    const confidence = 0.85 + (Math.random() * 0.14);
    const shuffledPaths = [...mockCareerPaths].sort((a, b) => {
      const hashA = studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0) + a.title.charCodeAt(0), 0);
      const hashB = studentId.split('').reduce((acc, char) => acc + char.charCodeAt(0) + b.title.charCodeAt(0), 0);
      return (hashA % 100) - (hashB % 100);
    });
    const careerPaths = shuffledPaths.slice(0, 3).map((path, index) => ({
      ...path,
      relevance: 0.9 - (index * 0.15)
    }));
    return {
      studentId,
      predictedGrade,
      confidence,
      careerPaths,
    };
  }
  async listEvents(): Promise<CalendarEvent[]> {
    await this.ensureLoaded();
    return Array.from(this.events.values());
  }
  async addEvent(eventData: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    await this.ensureLoaded();
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event-${this.events.size + 1}`,
    };
    this.events.set(newEvent.id, newEvent as any);
    await this.persist();
    return newEvent;
  }
  async updateEvent(id: string, eventData: Partial<Omit<CalendarEvent, 'id'>>): Promise<CalendarEvent | { error: string }> {
    await this.ensureLoaded();
    const event = this.events.get(id);
    if (!event) return { error: 'Event not found' };
    const updatedEvent = { ...event, ...eventData };
    this.events.set(id, updatedEvent as any);
    await this.persist();
    return updatedEvent;
  }
  async deleteEvent(id: string): Promise<{ success: true } | { error: string }> {
    await this.ensureLoaded();
    if (!this.events.has(id)) return { error: 'Event not found' };
    this.events.delete(id);
    await this.persist();
    return { success: true };
  }
  async listTransactions(): Promise<Transaction[]> {
    await this.ensureLoaded();
    return Array.from(this.transactions.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  async addTransaction(txData: Omit<Transaction, 'id'>): Promise<Transaction> {
    await this.ensureLoaded();
    const newTx: Transaction = {
      ...txData,
      id: `tx-${this.transactions.size + 1}`,
    };
    this.transactions.set(newTx.id, newTx);
    await this.persist();
    return newTx;
  }
  async updateTransaction(id: string, txData: Partial<Omit<Transaction, 'id'>>): Promise<Transaction | { error: string }> {
    await this.ensureLoaded();
    const tx = this.transactions.get(id);
    if (!tx) return { error: 'Transaction not found' };
    const updatedTx = { ...tx, ...txData };
    this.transactions.set(id, updatedTx);
    await this.persist();
    return updatedTx;
  }
  async deleteTransaction(id: string): Promise<{ success: true } | { error: string }> {
    await this.ensureLoaded();
    if (!this.transactions.has(id)) return { error: 'Transaction not found' };
    this.transactions.delete(id);
    await this.persist();
    return { success: true };
  }
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    });
    await this.persist();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.persist();
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persist();
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      await this.persist();
      return true;
    }
    return false;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async getSessionCount(): Promise<number> {
    await this.ensureLoaded();
    return this.sessions.size;
  }
  async getSession(sessionId: string): Promise<SessionInfo | null> {
    await this.ensureLoaded();
    return this.sessions.get(sessionId) || null;
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = this.sessions.size;
    this.sessions.clear();
    await this.persist();
    return count;
  }
}