"use client";

import { useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { uid } from "@/lib/utils";
import type { User, UserRole } from "@/lib/types";
import { Avatar, Crumbs, EmptyRow, FormActions, Pill, RowActions } from "@/components/ui";

const EMPTY_FORM: { name: string; email: string; role: UserRole } = {
  name: "",
  email: "",
  role: "Admin",
};

function roleTone(role: UserRole): string {
  if (role === "Admin") return "orange";
  if (role === "Teacher") return "green";
  return "gray";
}

export function UsersView() {
  const { state, update } = useApp();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const formRef = useRef<HTMLFormElement>(null);

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(user: User) {
    setEditingId(user.id);
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role ?? "Admin",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function removeUser(id: string) {
    update((draft) => {
      draft.users = draft.users.filter((u) => u.id !== id);
    });
    if (editingId === id) cancelEdit();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    if (!name || !email) return;

    const payload = { name, email, role: form.role };

    if (editingId) {
      update((draft) => {
        const user = draft.users.find((u) => u.id === editingId);
        if (user) Object.assign(user, payload);
      });
      cancelEdit();
      return;
    }

    update((draft) => {
      draft.users.push({ id: uid(), ...payload });
    });
    cancelEdit();
  }

  return (
    <>
      <Crumbs title="Users" />

      <form className="card card-grid" ref={formRef} onSubmit={handleSubmit}>
        <div>
          <label>Full name</label>
          <input
            name="name"
            required
            placeholder="e.g. Nimal Soyza"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <label>Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="name@school.edu"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>
        <div>
          <label>Role</label>
          <select
            name="role"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
          >
            <option>Admin</option>
            <option>Teacher</option>
            <option>Parent</option>
            <option>Student</option>
          </select>
        </div>
        <FormActions
          addLabel="Add user"
          updateLabel="Update user"
          editing={editingId !== null}
          onCancel={cancelEdit}
        />
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {state.users.length === 0 ? (
              <EmptyRow colSpan={4}>No users yet.</EmptyRow>
            ) : (
              state.users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Avatar name={user.name} />
                    {user.name}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <Pill tone={roleTone(user.role)}>{user.role}</Pill>
                  </td>
                  <td>
                    <RowActions
                      actions={[
                        { label: "Edit", onClick: () => startEdit(user) },
                        {
                          label: "Remove",
                          danger: true,
                          onClick: () => removeUser(user.id),
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
