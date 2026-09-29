"use client";

import { useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { useLookups } from "@/lib/lookups";
import { orNull, uid } from "@/lib/utils";
import type { ClassRoom } from "@/lib/types";
import { Crumbs, EmptyRow, FormActions, RowActions } from "@/components/ui";

const EMPTY_FORM = {
  gradeLevel: "",
  section: "",
  roomNumber: "",
  capacity: "30",
  classTeacherId: "",
};

export function ClassroomsView() {
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

  function startEdit(room: ClassRoom) {
    setEditingId(room.id);
    setForm({
      gradeLevel: room.gradeLevel ?? "",
      section: room.section ?? "",
      roomNumber: room.roomNumber ?? "",
      capacity: String(room.capacity || 30),
      classTeacherId: room.classTeacherId ?? "",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function removeClassroom(id: string) {
    update((draft) => {
      draft.classRooms = draft.classRooms.filter((c) => c.id !== id);
      draft.schedule = draft.schedule.filter((s) => s.classRoomId !== id);
      draft.exams = draft.exams.filter((e) => e.classRoomId !== id);
    });
    if (editingId === id) cancelEdit();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const gradeLevel = form.gradeLevel.trim();
    if (!gradeLevel) return;

    const section = form.section.trim();
    const payload = {
      name: section ? `${gradeLevel} - ${section}` : gradeLevel,
      gradeLevel,
      section: orNull(section),
      roomNumber: orNull(form.roomNumber.trim()),
      capacity: Number(form.capacity || 30),
      classTeacherId: orNull(form.classTeacherId),
    };

    if (editingId) {
      update((draft) => {
        const room = draft.classRooms.find((c) => c.id === editingId);
        if (room) Object.assign(room, payload);
      });
      cancelEdit();
      return;
    }

    update((draft) => {
      draft.classRooms.push({ id: uid(), ...payload });
    });
    cancelEdit();
  }

  return (
    <>
      <Crumbs title="Class Room" />

      <form className="card card-grid" ref={formRef} onSubmit={handleSubmit}>
        <div>
          <label>Grade level</label>
          <input
            name="gradeLevel"
            required
            placeholder="Grade 8"
            value={form.gradeLevel}
            onChange={(e) => setField("gradeLevel", e.target.value)}
          />
        </div>
        <div>
          <label>Section</label>
          <input
            name="section"
            placeholder="A"
            value={form.section}
            onChange={(e) => setField("section", e.target.value)}
          />
        </div>
        <div>
          <label>Room no.</label>
          <input
            name="roomNumber"
            placeholder="204"
            value={form.roomNumber}
            onChange={(e) => setField("roomNumber", e.target.value)}
          />
        </div>
        <div>
          <label>Capacity</label>
          <input
            name="capacity"
            type="number"
            min="1"
            value={form.capacity}
            onChange={(e) => setField("capacity", e.target.value)}
          />
        </div>
        <div>
          <label>Class teacher</label>
          <select
            name="classTeacherId"
            value={form.classTeacherId}
            onChange={(e) => setField("classTeacherId", e.target.value)}
          >
            <option value="">Unassigned</option>
            {state.teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <FormActions
          addLabel="Add class"
          updateLabel="Update class"
          editing={editingId !== null}
          onCancel={cancelEdit}
          wrapClassName=""
        />
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Room</th>
              <th>Capacity</th>
              <th>Class teacher</th>
              <th>Students</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {state.classRooms.length === 0 ? (
              <EmptyRow colSpan={6}>No class rooms yet — add the first one above.</EmptyRow>
            ) : (
              state.classRooms.map((room) => (
                <tr key={room.id}>
                  <td style={{ fontWeight: 600 }}>{room.name}</td>
                  <td>{room.roomNumber || "—"}</td>
                  <td>{room.capacity}</td>
                  <td>{lookups.teacherName(room.classTeacherId) || "Unassigned"}</td>
                  <td>{lookups.studentsInClass(room.id).length}</td>
                  <td>
                    <RowActions
                      actions={[
                        { label: "Edit", onClick: () => startEdit(room) },
                        {
                          label: "Remove",
                          danger: true,
                          onClick: () => removeClassroom(room.id),
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
