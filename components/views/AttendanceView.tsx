"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { useLookups } from "@/lib/lookups";
import { todayISO, uid } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/types";
import { Avatar, Crumbs } from "@/components/ui";

const OPTIONS: Array<{ value: AttendanceStatus; label: string }> = [
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
];

export function AttendanceView() {
  const { state, update } = useApp();
  const lookups = useLookups(state);

  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(todayISO);
  const [pending, setPending] = useState<Record<string, AttendanceStatus>>({});
  const [justSaved, setJustSaved] = useState(false);

  const activeClassId = state.classRooms.some((c) => c.id === selectedClass)
    ? selectedClass
    : (state.classRooms[0]?.id ?? "");

  const stored = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    for (const record of state.attendance) {
      if (record.classRoomId === activeClassId && record.date === date) {
        map[record.studentId] = record.status;
      }
    }
    return map;
  }, [state.attendance, activeClassId, date]);

  const roster = lookups.studentsInClass(activeClassId);
  const statuses: Record<string, AttendanceStatus> = { ...stored, ...pending };

  function handleSave() {
    if (!activeClassId) return;
    const snapshot = { ...stored, ...pending };

    update((draft) => {
      for (const student of roster) {
        const status = snapshot[student.id] ?? "present";
        const existing = draft.attendance.find(
          (a) =>
            a.classRoomId === activeClassId &&
            a.date === date &&
            a.studentId === student.id,
        );
        if (existing) existing.status = status;
        else {
          draft.attendance.push({
            id: uid(),
            classRoomId: activeClassId,
            date,
            studentId: student.id,
            status,
          });
        }
      }
    });

    setPending({});
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 1200);
  }

  return (
    <>
      <Crumbs title="Attendance" />

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <label style={{ margin: "0 0 4px" }}>Class</label>
          <select
            value={activeClassId}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setPending({});
            }}
            style={{ maxWidth: 220 }}
          >
            {state.classRooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ margin: "0 0 4px" }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ maxWidth: 170 }}
          />
        </div>
      </div>

      <div className="table-wrap">
        {!activeClassId ? (
          <div className="empty-block">Add a class room first.</div>
        ) : roster.length === 0 ? (
          <div className="empty-block">No students in this class yet.</div>
        ) : (
          roster.map((student) => (
            <div key={student.id} className="att-row">
              <div>
                <Avatar name={student.name} photo={student.photo} />
                {student.name}
              </div>
              <div className="att-opts">
                {OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={
                      statuses[student.id] === option.value ? `att-opt sel-${option.value}` : "att-opt"
                    }
                    onClick={() =>
                      setPending((prev) => ({ ...prev, [student.id]: option.value }))
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        className="btn green"
        onClick={handleSave}
        disabled={!activeClassId || roster.length === 0}
        style={{ marginTop: 16 }}
      >
        {justSaved ? "Saved ✓" : "Save attendance"}
      </button>
    </>
  );
}
