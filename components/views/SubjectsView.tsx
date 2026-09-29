"use client";

import { useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { orNull, uid } from "@/lib/utils";
import type { Subject } from "@/lib/types";
import { Crumbs, EmptyRow, FormActions, RowActions } from "@/components/ui";

const EMPTY_FORM = { name: "", code: "", creditHours: "1", department: "" };

export function SubjectsView() {
  const { state, update } = useApp();

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

  function startEdit(subject: Subject) {
    setEditingId(subject.id);
    setForm({
      name: subject.name ?? "",
      code: subject.code ?? "",
      creditHours: String(subject.creditHours || 1),
      department: subject.department ?? "",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function removeSubject(id: string) {
    update((draft) => {
      draft.subjects = draft.subjects.filter((s) => s.id !== id);
    });
    if (editingId === id) cancelEdit();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    if (!name || !code) return;

    const payload = {
      name,
      code,
      department: orNull(form.department.trim()),
      creditHours: Number(form.creditHours || 1),
    };

    if (editingId) {
      update((draft) => {
        const subject = draft.subjects.find((s) => s.id === editingId);
        if (subject) Object.assign(subject, payload);
      });
      cancelEdit();
      return;
    }

    update((draft) => {
      draft.subjects.push({ id: uid(), ...payload });
    });
    cancelEdit();
  }

  const sorted = [...state.subjects].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <Crumbs title="Subject" />

      <form className="card card-grid" ref={formRef} onSubmit={handleSubmit}>
        <div style={{ gridColumn: "span 2" }}>
          <label>Subject name</label>
          <input
            name="name"
            required
            placeholder="e.g. Mathematics"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>
        <div>
          <label>Code</label>
          <input
            name="code"
            required
            placeholder="MATH101"
            value={form.code}
            onChange={(e) => setField("code", e.target.value)}
          />
        </div>
        <div>
          <label>Credit hours</label>
          <input
            name="creditHours"
            type="number"
            min="1"
            value={form.creditHours}
            onChange={(e) => setField("creditHours", e.target.value)}
          />
        </div>
        <div className="full">
          <label>Department (optional)</label>
          <input
            name="department"
            placeholder="e.g. Sciences"
            value={form.department}
            onChange={(e) => setField("department", e.target.value)}
          />
        </div>
        <FormActions
          addLabel="Add subject"
          updateLabel="Update subject"
          editing={editingId !== null}
          onCancel={cancelEdit}
          wrapClassName=""
        />
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject</th>
              <th>Department</th>
              <th>Credit hrs</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {state.subjects.length === 0 ? (
              <EmptyRow colSpan={5}>No subjects yet — add the first one above.</EmptyRow>
            ) : (
              sorted.map((subject) => (
                <tr key={subject.id}>
                  <td className="mono">{subject.code}</td>
                  <td style={{ fontWeight: 600 }}>{subject.name}</td>
                  <td>{subject.department || "—"}</td>
                  <td>{subject.creditHours}</td>
                  <td>
                    <RowActions
                      actions={[
                        { label: "Edit", onClick: () => startEdit(subject) },
                        {
                          label: "Remove",
                          danger: true,
                          onClick: () => removeSubject(subject.id),
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
