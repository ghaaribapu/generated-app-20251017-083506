import { User } from './types';
export const mockAdminUser: User = {
  id: 'user-1',
  name: 'Admin',
  email: 'admin@zavia.ai',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  role: 'Admin',
};
export const mockInstructorUser: User & { gender: 'Male' | 'Female', phone: string, googleMeetId: string } = {
  id: 'instr-1',
  name: 'Ghaarib Khurshid',
  email: 'ghaarib.k@zavia.ai',
  avatarUrl: 'https://i.pravatar.cc/150?u=instr-1',
  role: 'Instructor',
  gender: 'Male',
  phone: '+1234567890',
  googleMeetId: 'ghaarib-khurshid-meet'
};
export const mockStudentUser: User & { gender: 'Male' | 'Female', phone: string, googleMeetId: string } = {
  id: 'S001',
  name: 'Charlie Brown',
  email: 'charlie.b@acadia.edu',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026701d',
  role: 'Student',
  gender: 'Male',
  phone: '+1987654321',
  googleMeetId: 'charlie-brown-meet'
};
export const mockCareerPaths = [
  { title: 'AI/ML Engineer', description: 'Designs and develops machine learning and deep learning systems.' },
  { title: 'Data Scientist', description: 'Analyzes and interprets complex data to help organizations make better decisions.' },
  { title: 'Robotics Engineer', description: 'Builds and tests robots, and develops applications for them.' },
  { title: 'NLP Scientist', description: 'Specializes in the interaction between computers and human language.' },
  { title: 'Computer Vision Engineer', description: 'Develops algorithms to help computers understand and interpret visual information.' },
];