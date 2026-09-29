"use client";

import { useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { useLookups } from "@/lib/lookups";
import { orNull, uid } from "@/lib/utils";
import type { Teacher } from "@/lib/types";
import { Avatar, Crumbs, EmptyRow, FormActions, RowActions } from "@/components/ui";

const EMPTY_FORM = { name: "", subjectId: "", phone: "", email: "" };

export function TeachersView() {
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

  function startEdit(teacher: Teacher) {
    setEditingId(teacher.id);
    setForm({
      name: teacher.name ?? "",
      subjectId: teacher.subjectId ?? "",
      phone: teacher.phone ?? "",
      email: teacher.email ?? "",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function removeTeacher(id: string) {
    update((draft) => {
      draft.teachers = draft.teachers.filter((t) => t.id !== id);
      for (const room of draft.classRooms) {
        if (room.classTeacherId === id) room.classTeacherId = null;
      }
      for (const slot of draft.schedule) {
        if (slot.teacherId === id) slot.teacherId = null;
      }
    });
    if (editingId === id) cancelEdit();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    const payload = {
      name,
      subjectId: orNull(form.subjectId),
      phone: orNull(form.phone.trim()),
      email: orNull(form.email.trim()),
    };

    if (editingId) {
      update((draft) => {
        const teacher = draft.teachers.find((t) => t.id === editingId);
        if (teacher) Object.assign(teacher, payload);
      });
      cancelEdit();
      return;
    }

    update((draft) => {
      draft.teachers.push({ id: uid(), ...payload });
    });
    cancelEdit();
  }

  return (
    <>
      <Crumbs title="Teacher" />

      <form className="card card-grid" ref={formRef} onSubmit={handleSubmit}>
        <div>
          <label>Full name</label>
          <input
            name="name"
            required
            placeholder="e.g. Mrs. Sreymom Heng"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>
        <div>
          <label>Subject</label>
          <select value={form.subjectId} onChange={(e) => setField("subjectId", e.target.value)}>
            <option value="">Unassigned</option>
            {state.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Phone</label>
          <input
            name="phone"
            placeholder="012 345 678"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
          />
        </div>
        <div>
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="name@school.edu"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>
        <FormActions
          addLabel="Add teacher"
          updateLabel="Update teacher"
          editing={editingId !== null}
          onCancel={cancelEdit}
        />
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Subject</th>
              <th>Phone</th>
              <th>Email</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {state.teachers.length === 0 ? (
              <EmptyRow colSpan={5}>No teachers yet — add the first one above.</EmptyRow>
            ) : (
              state.teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <Avatar name={teacher.name} />
                    {teacher.name}
                  </td>
                  <td>{lookups.subjectName(teacher.subjectId)}</td>
                  <td>{teacher.phone || "—"}</td>
                  <td>{teacher.email || "—"}</td>
                  <td>
                    <RowActions
                      actions={[
                        { label: "Edit", onClick: () => startEdit(teacher) },
                        {
                          label: "Remove",
                          danger: true,
                          onClick: () => removeTeacher(teacher.id),
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
