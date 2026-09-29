"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useLookups } from "@/lib/lookups";
import { uid } from "@/lib/utils";
import { Crumbs, EmptyRow, Pill } from "@/components/ui";

export function ResultsView() {
  const { state, update } = useApp();
  const lookups = useLookups(state);

  const [selectedExam, setSelectedExam] = useState("");
  const [marks, setMarks] = useState<Record<string, string>>({});

  const sortedExams = [...state.exams].sort((a, b) => b.examDate.localeCompare(a.examDate));
  const examId = sortedExams.some((e) => e.id === selectedExam)
    ? selectedExam
    : (sortedExams[0]?.id ?? "");
  const exam = sortedExams.find((e) => e.id === examId) ?? null;

  const storedMarks: Record<string, number | null> = {};
  for (const result of state.examResults) {
    if (result.examId === examId) storedMarks[result.studentId] = result.marksObtained;
  }

  const roster = exam ? lookups.studentsInClass(exam.classRoomId) : [];

  function rawValue(studentId: string): string {
    if (studentId in marks) return marks[studentId];
    const stored = storedMarks[studentId];
    return stored == null ? "" : String(stored);
  }

  function numericValue(studentId: string): number | null {
    const raw = rawValue(studentId).trim();
    return raw === "" ? null : Number(raw);
  }

  const graded = roster.filter((s) => numericValue(s.id) !== null);
  const passed = graded.filter((s) => (numericValue(s.id) ?? 0) >= (exam?.passMarks ?? 0));
  const average = graded.length
    ? (
        graded.reduce((sum, s) => sum + (numericValue(s.id) ?? 0), 0) / graded.length
      ).toFixed(1)
    : "—";

  const published = exam?.status === "results_published";

  function handleSaveMarks() {
    if (!exam) return;
    const snapshot = roster.map((s) => ({ studentId: s.id, marksObtained: numericValue(s.id) }));

    update((draft) => {
      for (const entry of snapshot) {
        const existing = draft.examResults.find(
          (r) => r.examId === exam.id && r.studentId === entry.studentId,
        );
        if (existing) existing.marksObtained = entry.marksObtained;
        else if (entry.marksObtained !== null) {
          draft.examResults.push({
            id: uid(),
            examId: exam.id,
            studentId: entry.studentId,
            marksObtained: entry.marksObtained,
          });
        }
      }
      const target = draft.exams.find((x) => x.id === exam.id);
      if (target && target.status === "scheduled") target.status = "ongoing";
    });

    setMarks({});
  }

  function handlePublish() {
    if (!exam) return;
    update((draft) => {
      const target = draft.exams.find((x) => x.id === exam.id);
      if (target) target.status = "results_published";
    });
  }

  const statStyle = { padding: "16px 18px 12px" } as const;

  return (
    <>
      <Crumbs title="Exam Results" />

      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ margin: 0 }}>Exam</label>
        <select
          value={examId}
          onChange={(e) => {
            setSelectedExam(e.target.value);
            setMarks({});
          }}
          style={{ maxWidth: 320 }}
        >
          {sortedExams.map((e) => (
            <option key={e.id} value={e.id}>
              {`${e.name} — ${lookups.classroomName(e.classRoomId)}`}
            </option>
          ))}
        </select>
      </div>

      <div
        className="stat-cards"
        style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 18 }}
      >
        {exam ? (
          <>
            <div className="stat-card blue" style={statStyle}>
              <div className="num" style={{ fontSize: 26 }}>
                {graded.length}/{roster.length}
              </div>
              <div className="lbl">Graded</div>
            </div>
            <div className="stat-card green" style={statStyle}>
              <div className="num" style={{ fontSize: 26 }}>
                {passed.length}
              </div>
              <div className="lbl">Passed</div>
            </div>
            <div className="stat-card orange" style={statStyle}>
              <div className="num" style={{ fontSize: 26 }}>
                {average}
              </div>
              <div className="lbl">Class average</div>
            </div>
          </>
        ) : null}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Marks obtained</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {!exam ? (
              <EmptyRow colSpan={3}>Schedule an exam first.</EmptyRow>
            ) : roster.length === 0 ? (
              <EmptyRow colSpan={3}>No students enrolled in this class yet.</EmptyRow>
            ) : (
              roster.map((student) => {
                const value = rawValue(student.id);
                const isPass = value !== "" && (numericValue(student.id) ?? 0) >= exam.passMarks;
                return (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 600 }}>{student.name}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={exam.maxMarks}
                        value={value}
                        onChange={(e) =>
                          setMarks((prev) => ({ ...prev, [student.id]: e.target.value }))
                        }
                        className="marks-input"
                      />{" "}
                      <span className="muted" style={{ fontSize: 11 }}>
                        / {exam.maxMarks}
                      </span>
                    </td>
                    <td>
                      {value === "" ? (
                        <Pill tone="gray">Not graded</Pill>
                      ) : isPass ? (
                        <Pill tone="green">Pass</Pill>
                      ) : (
                        <Pill tone="red">Fail</Pill>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button className="btn" onClick={handleSaveMarks} disabled={!exam || roster.length === 0}>
          Save marks
        </button>
        <button
          className="btn green"
          onClick={handlePublish}
          disabled={!exam || roster.length === 0 || published}
        >
          {published ? "Results published" : "Publish results"}
        </button>
      </div>
    </>
  );
}
