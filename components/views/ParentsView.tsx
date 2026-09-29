"use client";

import { useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { useLookups } from "@/lib/lookups";
import { orNull, uid } from "@/lib/utils";
import type { Parent } from "@/lib/types";
import { Avatar, Crumbs, EmptyRow, FormActions, RowActions } from "@/components/ui";

const EMPTY_FORM = { name: "", phone: "", email: "", studentId: "" };

export function ParentsView() {
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

  function startEdit(parent: Parent) {
    setEditingId(parent.id);
    setForm({
      name: parent.name ?? "",
      phone: parent.phone ?? "",
      email: parent.email ?? "",
      studentId: parent.studentIds[0] ?? "",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function removeParent(id: string) {
    update((draft) => {
      draft.parents = draft.parents.filter((p) => p.id !== id);
    });
    if (editingId === id) cancelEdit();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    const payload = {
      name,
      phone: orNull(form.phone.trim()),
      email: orNull(form.email.trim()),
      studentIds: form.studentId ? [form.studentId] : [],
    };

    if (editingId) {
      update((draft) => {
        const parent = draft.parents.find((p) => p.id === editingId);
        if (parent) Object.assign(parent, payload);
      });
      cancelEdit();
      return;
    }

    update((draft) => {
      draft.parents.push({ id: uid(), ...payload });
    });
    cancelEdit();
  }

  return (
    <>
      <Crumbs title="Parents" />

      <form className="card card-grid" ref={formRef} onSubmit={handleSubmit}>
        <div>
          <label>Full name</label>
          <input
            name="name"
            required
            placeholder="e.g. Mr. Sokha Chan"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
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
            placeholder="name@email.com"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
          />
        </div>
        <div>
          <label>Linked student</label>
          <select
            name="studentId"
            value={form.studentId}
            onChange={(e) => setField("studentId", e.target.value)}
          >
            <option value="">No linked student</option>
            {state.students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <FormActions
          addLabel="Add parent"
          updateLabel="Update parent"
          editing={editingId !== null}
          onCancel={cancelEdit}
        />
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Parent</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Children</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {state.parents.length === 0 ? (
              <EmptyRow colSpan={5}>No parents registered yet.</EmptyRow>
            ) : (
              state.parents.map((parent) => (
                <tr key={parent.id}>
                  <td>
                    <Avatar name={parent.name} />
                    {parent.name}
                  </td>
                  <td>{parent.phone || "—"}</td>
                  <td>{parent.email || "—"}</td>
                  <td>
                    {parent.studentIds.map(lookups.studentName).join(", ") || "—"}
                  </td>
                  <td>
                    <RowActions
                      actions={[
                        { label: "Edit", onClick: () => startEdit(parent) },
                        {
                          label: "Remove",
                          danger: true,
                          onClick: () => removeParent(parent.id),
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
