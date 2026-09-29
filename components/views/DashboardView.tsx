"use client";

import { useApp } from "@/lib/store";
import { Crumbs, StatCards } from "@/components/ui";

export function DashboardView() {
  const { state } = useApp();

  const cards = [
    { n: state.students.length, l: "Total Students", cls: "blue", g: "◉" },
    { n: state.teachers.length, l: "Total Teachers", cls: "green", g: "◈" },
    { n: state.subjects.length, l: "Total Subjects", cls: "orange", g: "▤" },
    { n: state.parents.length, l: "Registered Parents", cls: "red", g: "◐" },
  ];

  return (
    <>
      <Crumbs title="School" dim="Overview" path="School > Stat" />
      <StatCards cards={cards} />
    </>
  );
}
