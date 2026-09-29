"use client";

import { useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { useLookups } from "@/lib/lookups";
import { formatDate, orNull, uid } from "@/lib/utils";
import { STATUS_LABEL, STATUS_PILL } from "@/lib/types";
import type { Exam } from "@/lib/types";
import { Crumbs, EmptyRow, FormActions, Pill, RowActions } from "@/components/ui";

const EMPTY_FORM = {
  name: "",
  term: "",
  classRoomId: "",
  subjectId: "",
  examDate: "",
  maxMarks: "100",
  passMarks: "40",
};

export function ExamsView() {
  const { state, update } = useApp();
  const lookups = useLookups(state);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const formRef = useRef<HTMLFormElement>(null);

  function setField(key: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(exam: Exam) {
    setEditingId(exam.id);
    setForm({
      name: exam.name ?? "",
      term: exam.term ?? "",
      classRoomId: exam.classRoomId ?? "",
      subjectId: exam.subjectId ?? "",
      examDate: exam.examDate ?? "",
      maxMarks: String(exam.maxMarks),
      passMarks: String(exam.passMarks),
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function removeExam(id: string) {
    update((draft) => {
      draft.exams = draft.exams.filter((x) => x.id !== id);
      draft.examResults = draft.examResults.filter((r) => r.examId !== id);
    });
    if (editingId === id) cancelEdit();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name || !form.classRoomId || !form.subjectId || !form.examDate) return;

    const payload = {
      name,
      term: orNull(form.term.trim()),
      classRoomId: form.classRoomId,
      subjectId: form.subjectId,
      examDate: form.examDate,
      maxMarks: Number(form.maxMarks || 100),
      passMarks: Number(form.passMarks || 40),
    };

    if (editingId) {
      update((draft) => {
        const exam = draft.exams.find((x) => x.id === editingId);
        if (exam) Object.assign(exam, payload);
      });
      cancelEdit();
      return;
    }

    update((draft) => {
      draft.exams.push({ id: uid(), ...payload, status: "scheduled" });
    });
    cancelEdit();
  }

  const sorted = [...state.exams].sort((a, b) => b.examDate.localeCompare(a.examDate));

  return (
    <>
      <Crumbs title="Exam" />

      <form className="card card-grid" ref={formRef} onSubmit={handleSubmit}>
        <div style={{ gridColumn: "span 2" }}>
          <label>Exam name</label>
          <input
            name="name"
            required
            placeholder="Mid-Term Examination"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>
        <div>
          <label>Term</label>
          <input
            name="term"
            placeholder="Term 2"
            value={form.term}
            onChange={(e) => setField("term", e.target.value)}
          />
        </div>
        <div>
          <label>Class</label>
          <select
            name="classRoomId"
            required
            value={form.classRoomId}
            onChange={(e) => setField("classRoomId", e.target.value)}
          >
            <option value="">—</option>
            {state.classRooms.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Subject</label>
          <select
            name="subjectId"
            required
            value={form.subjectId}
            onChange={(e) => setField("subjectId", e.target.value)}
          >
            <option value="">—</option>
            {state.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Date</label>
          <input
            name="examDate"
            type="date"
            required
            value={form.examDate}
            onChange={(e) => setField("examDate", e.target.value)}
          />
        </div>
        <div>
          <label>Max marks</label>
          <input
            name="maxMarks"
            type="number"
            value={form.maxMarks}
            onChange={(e) => setField("maxMarks", e.target.value)}
          />
        </div>
        <div>
          <label>Pass marks</label>
          <input
            name="passMarks"
            type="number"
            value={form.passMarks}
            onChange={(e) => setField("passMarks", e.target.value)}
          />
        </div>
        <FormActions
          addLabel="Schedule exam"
          updateLabel="Update exam"
          editing={editingId !== null}
          onCancel={cancelEdit}
          wrapClassName=""
        />
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Exam</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {state.exams.length === 0 ? (
              <EmptyRow colSpan={6}>No exams scheduled yet.</EmptyRow>
            ) : (
              sorted.map((exam) => (
                <tr key={exam.id}>
                  <td style={{ fontWeight: 600 }}>
                    {exam.name}
                    {exam.term ? (
                      <span
                        className="muted"
                        style={{ fontSize: 11, marginLeft: 6, fontWeight: 400 }}
                      >
                        {exam.term}
                      </span>
                    ) : null}
                  </td>
                  <td>{lookups.classroomName(exam.classRoomId)}</td>
                  <td>{lookups.subjectName(exam.subjectId)}</td>
                  <td>{formatDate(exam.examDate)}</td>
                  <td>
                    <Pill tone={STATUS_PILL[exam.status]}>{STATUS_LABEL[exam.status]}</Pill>
                  </td>
                  <td>
                    <RowActions
                      actions={[
                        { label: "Edit", onClick: () => startEdit(exam) },
                        {
                          label: "Remove",
                          danger: true,
                          onClick: () => removeExam(exam.id),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
