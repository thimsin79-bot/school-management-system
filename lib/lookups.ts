"use client";

import { useMemo } from "react";
import type { AppState, ClassRoom, Student, Subject, Teacher } from "./types";

export interface Lookups {
  classById: Map<string, ClassRoom>;
  subjectById: Map<string, Subject>;
  teacherById: Map<string, Teacher>;
  studentById: Map<string, Student>;
  classroomName: (id: string | null | undefined) => string;
  subjectName: (id: string | null | undefined) => string;
  teacherName: (id: string | null | undefined) => string | null;
  studentName: (id: string | null | undefined) => string;
  studentsInClass: (id: string | null | undefined) => Student[];
}

function index<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

export function buildLookups(state: AppState): Lookups {
  const classById = index(state.classRooms);
  const subjectById = index(state.subjects);
  const teacherById = index(state.teachers);
  const studentById = index(state.students);

  const studentsByClass = new Map<string, Student[]>();
  for (const student of state.students) {
    if (!student.classRoomId) continue;
    const bucket = studentsByClass.get(student.classRoomId);
    if (bucket) bucket.push(student);
    else studentsByClass.set(student.classRoomId, [student]);
  }

  return {
    classById,
    subjectById,
    teacherById,
    studentById,
    classroomName: (id) => (id ? (classById.get(id)?.name ?? "—") : "—"),
    subjectName: (id) => (id ? (subjectById.get(id)?.name ?? "—") : "—"),
    teacherName: (id) => (id ? (teacherById.get(id)?.name ?? null) : null),
    studentName: (id) => (id ? (studentById.get(id)?.name ?? "—") : "—"),
    studentsInClass: (id) => (id ? (studentsByClass.get(id) ?? []) : []),
  };
}

export function useLookups(state: AppState): Lookups {
  return useMemo(() => buildLookups(state), [state]);
}
