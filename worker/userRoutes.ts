import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
        const sessionId = c.req.param('sessionId');
        const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
        const url = new URL(c.req.url);
        url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
        return agent.fetch(new Request(url.toString(), {
            method: c.req.method,
            headers: c.req.header(),
            body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
        }));
        } catch (error) {
        console.error('Agent routing error:', error);
        return c.json({
            success: false,
            error: API_RESPONSES.AGENT_ROUTING_FAILED
        }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    const controller = (c: any) => getAppController(c.env);
    app.put('/api/user/change-password', async (c) => {
        const body = await c.req.json();
        const { userId, currentPassword, newPassword } = body;
        if (!userId || !currentPassword || !newPassword) {
            return c.json({ success: false, error: 'Missing required fields' }, 400);
        }
        const result = await controller(c).changePassword(userId, currentPassword, newPassword);
        if ('error' in result) return c.json({ success: false, error: result.error }, 400);
        return c.json({ success: true, data: result });
    });
    app.put('/api/users/:id/reset-password', async (c) => {
        const userId = c.req.param('id');
        const { newPassword } = await c.req.json();
        if (!newPassword) {
            return c.json({ success: false, error: 'New password is required' }, 400);
        }
        const result = await controller(c).adminResetPassword(userId, newPassword);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.get('/api/user/upcoming-topics', async (c) => {
        // This is a placeholder for getting the authenticated user's ID
        const tempUserId = 'S001'; // In a real app, get this from auth context
        const topics = await controller(c).listUpcomingTopics(tempUserId);
        return c.json({ success: true, data: topics });
    });
    app.get('/api/courses/:id/progress', async (c) => {
        const { id } = c.req.param();
        const progress = await controller(c).getCourseProgress(id);
        return c.json({ success: true, data: progress });
    });
    app.get('/api/students/:studentId/notes', async (c) => {
        const { studentId } = c.req.param();
        const notes = await controller(c).listNotesForStudent(studentId);
        return c.json({ success: true, data: notes });
    });
    app.post('/api/students/:studentId/notes', async (c) => {
        const studentId = c.req.param('studentId');
        const body = await c.req.json();
        const result = await controller(c).addNote({ ...body, studentId });
        if ('error' in result) return c.json({ success: false, error: result.error }, 400);
        return c.json({ success: true, data: result }, 201);
    });
    app.delete('/api/notes/:noteId', async (c) => {
        const { noteId } = c.req.param();
        const result = await controller(c).deleteNote(noteId);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.get('/api/progress/:studentId', async (c) => {
        const { studentId } = c.req.param();
        const progress = await controller(c).getStudentProgress(studentId);
        return c.json({ success: true, data: progress });
    });
    app.post('/api/progress/:studentId', async (c) => {
        const { studentId } = c.req.param();
        const { courseId, subTopicId, completed } = await c.req.json();
        if (!courseId || !subTopicId || typeof completed !== 'boolean') {
            return c.json({ success: false, error: 'Missing required fields' }, 400);
        }
        const progress = await controller(c).updateSubTopicProgress(studentId, courseId, subTopicId, completed);
        return c.json({ success: true, data: progress });
    });
    app.post('/api/auth/register', async (c) => {
        const body = await c.req.json();
        const result = await controller(c).registerUser(body);
        if ('error' in result) return c.json({ success: false, error: result.error }, 400);
        return c.json({ success: true, data: result }, 201);
    });
    app.post('/api/auth/login', async (c) => {
        const body = await c.req.json();
        const result = await controller(c).loginUser(body);
        if ('error' in result) return c.json({ success: false, error: result.error }, 401);
        return c.json({ success: true, data: result });
    });
    app.get('/api/ideas', async (c) => {
        const ideas = await controller(c).listIdeas();
        return c.json({ success: true, data: ideas });
    });
    app.post('/api/ideas', async (c) => {
        const body = await c.req.json();
        const result = await controller(c).addIdea(body);
        if ('error' in result) return c.json({ success: false, error: result.error }, 400);
        return c.json({ success: true, data: result }, 201);
    });
    app.delete('/api/ideas/:id', async (c) => {
        const { id } = c.req.param();
        const result = await controller(c).deleteIdea(id);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.get('/api/user', async (c) => {
        const user = await controller(c).getUser();
        return c.json({ success: true, data: user });
    });
    app.put('/api/user', async (c) => {
        const body = await c.req.json();
        const updatedUser = await controller(c).updateUser(body);
        return c.json({ success: true, data: updatedUser });
    });
    app.get('/api/instructors', async (c) => {
        const instructors = await controller(c).listInstructors();
        return c.json({ success: true, data: instructors });
    });
    app.get('/api/instructors/:id/courses', async (c) => {
        const { id } = c.req.param();
        const courses = await controller(c).listCoursesForInstructor(id);
        return c.json({ success: true, data: courses });
    });
    app.get('/api/instructors/:id/students', async (c) => {
        const { id } = c.req.param();
        const students = await controller(c).listStudentsForInstructor(id);
        return c.json({ success: true, data: students });
    });
    app.post('/api/instructors', async (c) => {
        const body = await c.req.json();
        const newInstructor = await controller(c).addInstructor(body);
        return c.json({ success: true, data: newInstructor }, 201);
    });
    app.put('/api/instructors/:id', async (c) => {
        const { id } = c.req.param();
        const body = await c.req.json();
        const result = await controller(c).updateInstructor(id, body);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.delete('/api/instructors/:id', async (c) => {
        const { id } = c.req.param();
        const result = await controller(c).deleteInstructor(id);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.get('/api/courses', async (c) => {
        const courses = await controller(c).listCourses();
        return c.json({ success: true, data: courses });
    });
    app.post('/api/courses', async (c) => {
        const body = await c.req.json();
        const result = await controller(c).addCourse(body);
        if ('error' in result) return c.json({ success: false, error: result.error }, 400);
        return c.json({ success: true, data: result }, 201);
    });
    app.get('/api/courses/:id', async (c) => {
        const { id } = c.req.param();
        const course = await controller(c).getCourseById(id);
        if (!course) return c.json({ success: false, error: 'Course not found' }, 404);
        return c.json({ success: true, data: course });
    });
    app.put('/api/courses/:id', async (c) => {
        const { id } = c.req.param();
        const body = await c.req.json();
        const result = await controller(c).updateCourse(id, body);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.delete('/api/courses/:id', async (c) => {
        const { id } = c.req.param();
        const result = await controller(c).deleteCourse(id);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.get('/api/courses/:id/modules', async (c) => {
        const { id } = c.req.param();
        const modules = await controller(c).listModulesForCourse(id);
        return c.json({ success: true, data: modules });
    });
    app.post('/api/courses/:id/modules', async (c) => {
        const courseId = c.req.param('id');
        const body = await c.req.json();
        const newModule = await controller(c).addModule(courseId, body);
        return c.json({ success: true, data: newModule }, 201);
    });
    app.get('/api/courses/:id/students', async (c) => {
        const { id } = c.req.param();
        const students = await controller(c).listStudentsForCourse(id);
        return c.json({ success: true, data: students });
    });
    app.get('/api/courses/:id/content', async (c) => {
        const { id } = c.req.param();
        const content = await controller(c).listCourseContent(id);
        return c.json({ success: true, data: content });
    });
    app.post('/api/courses/:id/content', async (c) => {
        const courseId = c.req.param('id');
        const body = await c.req.json();
        const newContent = await controller(c).addCourseContent(courseId, body);
        return c.json({ success: true, data: newContent }, 201);
    });
    app.put('/api/content/:contentId', async (c) => {
        const { contentId } = c.req.param();
        const body = await c.req.json();
        const result = await controller(c).updateCourseContent(contentId, body);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.delete('/api/content/:contentId', async (c) => {
        const { contentId } = c.req.param();
        const result = await controller(c).deleteCourseContent(contentId);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.put('/api/modules/:moduleId', async (c) => {
        const { moduleId } = c.req.param();
        const body = await c.req.json();
        const result = await controller(c).updateModule(moduleId, body);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.delete('/api/modules/:moduleId', async (c) => {
        const { moduleId } = c.req.param();
        const result = await controller(c).deleteModule(moduleId);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.get('/api/modules/:moduleId/subtopics', async (c) => {
        const { moduleId } = c.req.param();
        const subTopics = await controller(c).listSubTopicsForModule(moduleId);
        return c.json({ success: true, data: subTopics });
    });
    app.post('/api/modules/:moduleId/subtopics', async (c) => {
        const { moduleId } = c.req.param();
        const body = await c.req.json();
        const newSubTopic = await controller(c).addSubTopic(moduleId, body);
        return c.json({ success: true, data: newSubTopic }, 201);
    });
    app.put('/api/subtopics/:subTopicId', async (c) => {
        const { subTopicId } = c.req.param();
        const body = await c.req.json();
        const result = await controller(c).updateSubTopic(subTopicId, body);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.delete('/api/subtopics/:subTopicId', async (c) => {
        const { subTopicId } = c.req.param();
        const result = await controller(c).deleteSubTopic(subTopicId);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.get('/api/students', async (c) => {
        const students = await controller(c).listStudents();
        return c.json({ success: true, data: students });
    });
    app.post('/api/students', async (c) => {
        const body = await c.req.json();
        const newStudent = await controller(c).addStudent(body);
        return c.json({ success: true, data: newStudent }, 201);
    });
    app.get('/api/students/:id', async (c) => {
        const { id } = c.req.param();
        const student = await controller(c).getStudentById(id);
        if (!student) return c.json({ success: false, error: 'Student not found' }, 404);
        return c.json({ success: true, data: student });
    });
    app.put('/api/students/:id', async (c) => {
        const { id } = c.req.param();
        const body = await c.req.json();
        const result = await controller(c).updateStudent(id, body);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.get('/api/students/:id/courses', async (c) => {
        const { id } = c.req.param();
        const courses = await controller(c).listCoursesForStudent(id);
        return c.json({ success: true, data: courses });
    });
    app.get('/api/students/:id/prediction', async (c) => {
        const { id } = c.req.param();
        const prediction = await controller(c).getAIPrediction(id);
        if ('error' in prediction) return c.json({ success: false, error: prediction.error }, 404);
        return c.json({ success: true, data: prediction });
    });
    app.post('/api/courses/:id/students', async (c) => {
        const courseId = c.req.param('id');
        const { studentId } = await c.req.json();
        if (!studentId) return c.json({ success: false, error: 'studentId is required' }, 400);
        const result = await controller(c).enrollStudentInCourse(courseId, studentId);
        if ('error' in result) return c.json({ success: false, error: result.error }, 400);
        return c.json({ success: true, data: result }, 201);
    });
    app.delete('/api/courses/:courseId/students/:studentId', async (c) => {
        const { courseId, studentId } = c.req.param();
        const result = await controller(c).unenrollStudentFromCourse(courseId, studentId);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.get('/api/events', async (c) => {
        const events = await controller(c).listEvents();
        return c.json({ success: true, data: events });
    });
    app.post('/api/events', async (c) => {
        const body = await c.req.json();
        const newEvent = await controller(c).addEvent(body);
        return c.json({ success: true, data: newEvent }, 201);
    });
    app.put('/api/events/:id', async (c) => {
        const { id } = c.req.param();
        const body = await c.req.json();
        const result = await controller(c).updateEvent(id, body);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.delete('/api/events/:id', async (c) => {
        const { id } = c.req.param();
        const result = await controller(c).deleteEvent(id);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.get('/api/analytics', async (c) => {
        const data = await controller(c).getAnalyticsData();
        return c.json({ success: true, data });
    });
    app.get('/api/finance/transactions', async (c) => {
        const data = await controller(c).listTransactions();
        return c.json({ success: true, data });
    });
    app.post('/api/finance/transactions', async (c) => {
        const body = await c.req.json();
        const newTx = await controller(c).addTransaction(body);
        return c.json({ success: true, data: newTx }, 201);
    });
    app.put('/api/finance/transactions/:id', async (c) => {
        const { id } = c.req.param();
        const body = await c.req.json();
        const result = await controller(c).updateTransaction(id, body);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.delete('/api/finance/transactions/:id', async (c) => {
        const { id } = c.req.param();
        const result = await controller(c).deleteTransaction(id);
        if ('error' in result) return c.json({ success: false, error: result.error }, 404);
        return c.json({ success: true, data: result });
    });
    app.get('/api/sessions', async (c) => {
        try {
            const sessions = await controller(c).listSessions();
            return c.json({ success: true, data: sessions });
        } catch (error) {
            console.error('Failed to list sessions:', error);
            return c.json({ success: false, error: 'Failed to retrieve sessions' }, { status: 500 });
        }
    });
    app.post('/api/sessions', async (c) => {
        try {
            const body = await c.req.json().catch(() => ({}));
            const { title, sessionId: providedSessionId, firstMessage } = body;
            const sessionId = providedSessionId || crypto.randomUUID();
            let sessionTitle = title;
            if (!sessionTitle) {
                const now = new Date();
                const dateTime = now.toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                if (firstMessage && firstMessage.trim()) {
                    const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
                    const truncated = cleanMessage.length > 40 ? cleanMessage.slice(0, 37) + '...' : cleanMessage;
                    sessionTitle = `${truncated} • ${dateTime}`;
                } else {
                    sessionTitle = `Chat ${dateTime}`;
                }
            }
            await registerSession(c.env, sessionId, sessionTitle);
            return c.json({ success: true, data: { sessionId, title: sessionTitle } });
        } catch (error) {
            console.error('Failed to create session:', error);
            return c.json({ success: false, error: 'Failed to create session' }, { status: 500 });
        }
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const deleted = await unregisterSession(c.env, sessionId);
            if (!deleted) {
                return c.json({ success: false, error: 'Session not found' }, { status: 404 });
            }
            return c.json({ success: true, data: { deleted: true } });
        } catch (error) {
            console.error('Failed to delete session:', error);
            return c.json({ success: false, error: 'Failed to delete session' }, { status: 500 });
        }
    });
    app.put('/api/sessions/:sessionId/title', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const { title } = await c.req.json();
            if (!title || typeof title !== 'string') {
                return c.json({ success: false, error: 'Title is required' }, { status: 400 });
            }
            const updated = await controller(c).updateSessionTitle(sessionId, title);
            if (!updated) {
                return c.json({ success: false, error: 'Session not found' }, { status: 404 });
            }
            return c.json({ success: true, data: { title } });
        } catch (error) {
            console.error('Failed to update session title:', error);
            return c.json({ success: false, error: 'Failed to update session title' }, { status: 500 });
        }
    });
    app.delete('/api/sessions', async (c) => {
        try {
            const deletedCount = await controller(c).clearAllSessions();
            return c.json({ success: true, data: { deletedCount } });
        } catch (error) {
            console.error('Failed to clear all sessions:', error);
            return c.json({ success: false, error: 'Failed to clear all sessions' }, { status: 500 });
        }
    });
}