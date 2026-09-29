"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { printIdCards } from "@/lib/printIdCards";
import { Crumbs } from "@/components/ui";

export function IdCardsView() {
  const { state } = useApp();
  const [selected, setSelected] = useState("");

  function handlePrint() {
    if (!selected) {
      if (state.students.length === 0) {
        window.alert("No students to print yet.");
        return;
      }
      printIdCards(state, state.students);
      return;
    }
    const student = state.students.find((s) => s.id === selected);
    if (student) printIdCards(state, [student]);
  }

  return (
    <>
      <Crumbs title="ID Card" dim="Printing" path="Dashboard > ID Card" />
      <div className="card">
        <p className="view-desc" style={{ margin: "0 0 16px" }}>
          Select one student to print a single ID card, or choose &quot;All students&quot; to
          print the whole set as a sheet.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          <div style={{ minWidth: 260, flex: 1, maxWidth: 400 }}>
            <label>Student</label>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">All students</option>
              {state.students.map((s) => (
                <option key={s.id} value={s.id}>
                  {`${s.name} (${s.studentId || "—"})`}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" onClick={handlePrint}>
            Print ID card
          </button>
        </div>
      </div>
    </>
  );
}
