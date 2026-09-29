"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import type { ViewKey } from "@/lib/nav";
import { Shell } from "@/components/Shell";
import { DashboardView } from "@/components/views/DashboardView";
import { StudentsView } from "@/components/views/StudentsView";
import { IdCardsView } from "@/components/views/IdCardsView";
import { TeachersView } from "@/components/views/TeachersView";
import { ParentsView } from "@/components/views/ParentsView";
import { SubjectsView } from "@/components/views/SubjectsView";
import { ClassroomsView } from "@/components/views/ClassroomsView";
import { ScheduleView } from "@/components/views/ScheduleView";
import { AttendanceView } from "@/components/views/AttendanceView";
import { ExamsView } from "@/components/views/ExamsView";
import { ResultsView } from "@/components/views/ResultsView";
import { UsersView } from "@/components/views/UsersView";
import { NoticesView } from "@/components/views/NoticesView";

const VIEWS: Record<ViewKey, () => React.JSX.Element> = {
  dashboard: DashboardView,
  students: StudentsView,
  idcards: IdCardsView,
  teachers: TeachersView,
  parents: ParentsView,
  subjects: SubjectsView,
  classrooms: ClassroomsView,
  schedule: ScheduleView,
  attendance: AttendanceView,
  exams: ExamsView,
  results: ResultsView,
  users: UsersView,
  notices: NoticesView,
};

export default function Page() {
  const { hydrated } = useApp();
  const [view, setView] = useState<ViewKey>("dashboard");
  const Active = VIEWS[view];

  return (
    <Shell active={view} onNavigate={setView}>
      {hydrated ? <Active /> : null}
    </Shell>
  );
}
