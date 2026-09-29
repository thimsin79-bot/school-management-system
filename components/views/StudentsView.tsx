"use client";

import { useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { useLookups } from "@/lib/lookups";
import { printIdCards } from "@/lib/printIdCards";
import { fileToDataURL, orNull, uid } from "@/lib/utils";
import type { Gender, Student } from "@/lib/types";
import { Barcode } from "@/components/Barcode";
import { Avatar, Crumbs, EmptyRow, FormActions, RowActions } from "@/components/ui";

interface StudentFormState {
  name: string;
  studentId: string;
  gender: Gender;
  dob: string;
  classRoomId: string;
  fatherName: string;
  fatherContact: string;
  motherName: string;
  motherContact: string;
}

const EMPTY_FORM: StudentFormState = {
  name: "",
  studentId: "",
  gender: "Female",
  dob: "",
  classRoomId: "",
  fatherName: "",
  fatherContact: "",
  motherName: "",
  motherContact: "",
};

const SEARCHABLE: Array<keyof Student> = [
  "name",
  "studentId",
  "gender",
  "fatherName",
  "fatherContact",
  "motherName",
  "motherContact",
];

export function StudentsView() {
  const { state, update } = useApp();
  const lookups = useLookups(state);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentFormState>(EMPTY_FORM);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const cardRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function setField<K extends keyof StudentFormState>(key: K, value: StudentFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPhoto(null);
    setPhotoFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEdit(student: Student) {
    setEditingId(student.id);
    setForm({
      name: student.name ?? "",
      studentId: student.studentId ?? "",
      gender: student.gender ?? "Female",
      dob: student.dob ?? "",
      classRoomId: student.classRoomId ?? "",
      fatherName: student.fatherName ?? "",
      fatherContact: student.fatherContact ?? "",
      motherName: student.motherName ?? "",
      motherContact: student.motherContact ?? "",
    });
    setPhoto(student.photo ?? null);
    setPhotoFile(null);
    if (fileRef.current) fileRef.current.value = "";
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function removeStudent(id: string) {
    update((draft) => {
      draft.students = draft.students.filter((s) => s.id !== id);
      draft.examResults = draft.examResults.filter((r) => r.studentId !== id);
      draft.attendance = draft.attendance.filter((a) => a.studentId !== id);
    });
    if (editingId === id) cancelEdit();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;

    const payload = {
      name,
      studentId: orNull(form.studentId.trim()),
      gender: form.gender,
      dob: orNull(form.dob),
      classRoomId: orNull(form.classRoomId),
      fatherName: orNull(form.fatherName.trim()),
      fatherContact: orNull(form.fatherContact.trim()),
      motherName: orNull(form.motherName.trim()),
      motherContact: orNull(form.motherContact.trim()),
    };

    let nextPhoto: string | null = editingId ? photo : null;
    if (photoFile && photoFile.size > 0) {
      nextPhoto = await fileToDataURL(photoFile);
    }

    if (editingId) {
      update((draft) => {
        const student = draft.students.find((s) => s.id === editingId);
        if (student) Object.assign(student, payload, { photo: nextPhoto });
      });
      cancelEdit();
      return;
    }

    update((draft) => {
      draft.students.push({ id: uid(), ...payload, photo: nextPhoto });
    });
    cancelEdit();
  }

  const query = search.trim().toLowerCase();
  let list = state.students;
  if (classFilter) list = list.filter((s) => s.classRoomId === classFilter);
  if (query) {
    list = list.filter((s) =>
      SEARCHABLE.some((key) => {
        const value = s[key];
        return value ? String(value).toLowerCase().includes(query) : false;
      }),
    );
  }

  const isFiltered = Boolean(query || classFilter);
  const noStudents = state.students.length === 0;

  return (
    <>
      <Crumbs title="Student" />

      <form className="card card-grid" ref={cardRef} onSubmit={handleSubmit}>
        <div>
          <label>Full name</label>
          <input
            name="name"
            required
            placeholder="e.g. Sopheak Chan"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </div>
        <div>
          <label>Student ID</label>
          <input
            name="studentId"
            placeholder="e.g. STU-1001"
            value={form.studentId}
            onChange={(e) => setField("studentId", e.target.value)}
          />
        </div>
        <div>
          <label>Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={(e) => setField("gender", e.target.value as Gender)}
          >
            <option>Female</option>
            <option>Male</option>
          </select>
        </div>
        <div>
          <label>Date of birth</label>
          <input
            name="dob"
            type="date"
            value={form.dob}
            onChange={(e) => setField("dob", e.target.value)}
          />
        </div>
        <div>
          <label>Photo</label>
          <input
            ref={fileRef}
            name="photo"
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div>
          <label>Class</label>
          <select
            name="classRoomId"
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
          <label>Father name</label>
          <input
            name="fatherName"
            placeholder="Father's full name"
            value={form.fatherName}
            onChange={(e) => setField("fatherName", e.target.value)}
          />
        </div>
        <div>
          <label>Father contact</label>
          <input
            name="fatherContact"
            placeholder="012 345 678"
            value={form.fatherContact}
            onChange={(e) => setField("fatherContact", e.target.value)}
          />
        </div>
        <div>
          <label>Mother name</label>
          <input
            name="motherName"
            placeholder="Mother's full name"
            value={form.motherName}
            onChange={(e) => setField("motherName", e.target.value)}
          />
        </div>
        <div>
          <label>Mother contact</label>
          <input
            name="motherContact"
            placeholder="012 345 678"
            value={form.motherContact}
            onChange={(e) => setField("motherContact", e.target.value)}
          />
        </div>
        <FormActions
          addLabel="Add student"
          updateLabel="Update student"
          editing={editingId !== null}
          onCancel={cancelEdit}
        />
      </form>

      <div className="filter-bar">
        <input
          type="search"
          placeholder="Search name, ID, parent…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="">All classes</option>
          {state.classRooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="filter-count">
          {isFiltered ? `${list.length} of ${state.students.length}` : ""}
        </span>
      </div>

      <div className="table-wrap students-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Barcode</th>
              <th>Gender</th>
              <th>Class</th>
              <th>Father</th>
              <th>Mother</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {noStudents ? (
              <EmptyRow colSpan={8}>No students yet — add the first one above.</EmptyRow>
            ) : list.length === 0 ? (
              <EmptyRow colSpan={8}>No students match your search.</EmptyRow>
            ) : (
              list.map((student) => (
                <tr key={student.id}>
                  <td className="mono">{student.studentId || "—"}</td>
                  <td>
                    <Avatar name={student.name} photo={student.photo} />
                    {student.name}
                  </td>
                  <td>
                    {student.studentId ? (
                      <Barcode value={student.studentId} className="id-barcode" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{student.gender || "—"}</td>
                  <td>{lookups.classroomName(student.classRoomId)}</td>
                  <td>
                    {student.fatherName || student.fatherContact ? (
                      <>
                        {student.fatherName || "—"}
                        {student.fatherContact ? (
                          <>
                            <br />
                            <span className="muted" style={{ fontSize: 11 }}>
                              {student.fatherContact}
                            </span>
                          </>
                        ) : null}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {student.motherName || student.motherContact ? (
                      <>
                        {student.motherName || "—"}
                        {student.motherContact ? (
                          <>
                            <br />
                            <span className="muted" style={{ fontSize: 11 }}>
                              {student.motherContact}
                            </span>
                          </>
                        ) : null}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <RowActions
                      actions={[
                        { label: "Edit", onClick: () => startEdit(student) },
                        {
                          label: "ID Card",
                          onClick: () => printIdCards(state, [student]),
                        },
                        {
                          label: "Remove",
                          danger: true,
                          onClick: () => removeStudent(student.id),
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
