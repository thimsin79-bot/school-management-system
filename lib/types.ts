export type Gender = "Female" | "Male";

export interface Student {
  id: string;
  studentId: string | null;
  name: string;
  gender: Gender;
  dob: string | null;
  photo: string | null;
  classRoomId: string | null;
  fatherName: string | null;
  fatherContact: string | null;
  motherName: string | null;
  motherContact: string | null;
}

export interface Teacher {
  id: string;
  name: string;
  subjectId: string | null;
  phone: string | null;
  email: string | null;
}

export interface Parent {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  studentIds: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string | null;
  creditHours: number;
}

export interface ClassRoom {
  id: string;
  name: string;
  gradeLevel: string;
  section: string | null;
  roomNumber: string | null;
  capacity: number;
  classTeacherId: string | null;
}

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export interface ScheduleSlot {
  id: string;
  classRoomId: string;
  subjectId: string;
  teacherId: string | null;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  roomNumber: string | null;
}

export type AttendanceStatus = "present" | "late" | "absent";

export interface AttendanceRecord {
  id: string;
  classRoomId: string;
  date: string;
  studentId: string;
  status: AttendanceStatus;
}

export type ExamStatus = "scheduled" | "ongoing" | "completed" | "results_published";

export interface Exam {
  id: string;
  name: string;
  term: string | null;
  classRoomId: string;
  subjectId: string;
  examDate: string;
  maxMarks: number;
  passMarks: number;
  status: ExamStatus;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  marksObtained: number | null;
}

export type UserRole = "Admin" | "Teacher" | "Parent" | "Student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type NoticeAudience = "all" | "students" | "teachers" | "parents" | "class";

export interface Notice {
  id: string;
  title: string;
  body: string;
  audience: NoticeAudience;
  classRoomId: string | null;
  pinned: boolean;
  publishedAt: number;
}

export interface AppState {
  teachers: Teacher[];
  students: Student[];
  parents: Parent[];
  subjects: Subject[];
  classRooms: ClassRoom[];
  schedule: ScheduleSlot[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  examResults: ExamResult[];
  users: User[];
  notices: Notice[];
}

export const DAY_LABEL: Record<Weekday, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

export const STATUS_LABEL: Record<ExamStatus, string> = {
  scheduled: "Scheduled",
  ongoing: "Ongoing",
  completed: "Completed",
  results_published: "Results published",
};

export const STATUS_PILL: Record<ExamStatus, string> = {
  scheduled: "gray",
  ongoing: "orange",
  completed: "green",
  results_published: "green",
};

export const AUDIENCE_LABEL: Record<NoticeAudience, string> = {
  all: "Everyone",
  students: "Students",
  teachers: "Teachers",
  parents: "Parents",
  class: "One class",
};
