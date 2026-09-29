import type { IconName } from "@/components/icons";

export type ViewKey =
  | "dashboard"
  | "students"
  | "idcards"
  | "teachers"
  | "parents"
  | "subjects"
  | "classrooms"
  | "schedule"
  | "attendance"
  | "exams"
  | "results"
  | "users"
  | "notices";

export interface NavEntry {
  key: ViewKey;
  label: string;
  icon: IconName;
}

export const NAV: NavEntry[] = [
  { key: "dashboard", label: "Statistics", icon: "statistics" },
  { key: "students", label: "Student", icon: "student" },
  { key: "idcards", label: "ID Card", icon: "idCard" },
  { key: "teachers", label: "Teacher", icon: "teacher" },
  { key: "parents", label: "Parents", icon: "parents" },
  { key: "subjects", label: "Subject", icon: "subject" },
  { key: "classrooms", label: "Class Room", icon: "classroom" },
  { key: "schedule", label: "Schedule", icon: "schedule" },
  { key: "attendance", label: "Attendance", icon: "attendance" },
  { key: "exams", label: "Exam", icon: "exam" },
  { key: "results", label: "Exam Results", icon: "results" },
  { key: "users", label: "Users", icon: "users" },
  { key: "notices", label: "Notice", icon: "notice" },
];
