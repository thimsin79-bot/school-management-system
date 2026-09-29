"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useLookups } from "@/lib/lookups";
import { orNull, uid } from "@/lib/utils";
import { DAY_LABEL, WEEKDAYS } from "@/lib/types";
import type { Weekday } from "@/lib/types";
import { Crumbs } from "@/components/ui";

const EMPTY_SLOT = {
  subjectId: "",
  teacherId: "",
  weekday: "monday" as Weekday,
  roomNumber: "",
  startTime: "",
  endTime: "",
};

export function ScheduleView() {
  const { state, update } = useApp();
  const lookups = useLookups(state);

  const [selectedClass, setSelectedClass] = useState("");
  const [slot, setSlot] = useState(EMPTY_SLOT);

  const activeClassId = state.classRooms.some((c) => c.id === selectedClass)
    ? selectedClass
    : (state.classRooms[0]?.id ?? "");

  const slots = state.schedule.filter((s) => s.classRoomId === activeClassId);

  function removeSlot(id: string) {
    update((draft) => {
      draft.schedule = draft.schedule.filter((s) => s.id !== id);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeClassId) {
      window.alert("Add a class room first.");
      return;
    }
    if (slot.endTime <= slot.startTime) {
      window.alert("End time must be after start time.");
      return;
    }

    update((draft) => {
      draft.schedule.push({
        id: uid(),
        classRoomId: activeClassId,
        subjectId: slot.subjectId,
        teacherId: orNull(slot.teacherId),
        weekday: slot.weekday,
        startTime: slot.startTime,
        endTime: slot.endTime,
        roomNumber: orNull(slot.roomNumber.trim()),
      });
    });
    setSlot(EMPTY_SLOT);
  }

  return (
    <>
      <Crumbs title="Schedule" />

      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <label style={{ margin: 0 }}>Class</label>
        <select
          value={activeClassId}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{ maxWidth: 220 }}
        >
          {state.classRooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {activeClassId ? (
        <div className="week-grid-scroll">
          <div className="week-grid">
            {WEEKDAYS.map((day) => {
              const daySlots = slots
                .filter((s) => s.weekday === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div key={day} className="day-col">
                  <div className="day-head">{DAY_LABEL[day]}</div>
                  <div className="day-body">
                    {daySlots.length === 0 ? (
                      <div className="no-period">No periods</div>
                    ) : (
                      daySlots.map((s) => {
                        const teacher = lookups.teacherName(s.teacherId);
                        return (
                          <div key={s.id} className="slot-card">
                            <button
                              type="button"
                              className="slot-remove"
                              onClick={() => removeSlot(s.id)}
                            >
                              ✕
                            </button>
                            <div className="t1">{lookups.subjectName(s.subjectId)}</div>
                            <div className="t2">
                              {s.startTime}–{s.endTime}
                            </div>
                            {teacher ? <div className="t3">{teacher}</div> : null}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="empty-block">Add a class room first.</div>
      )}

      <form className="card card-grid" onSubmit={handleSubmit}>
        <div style={{ gridColumn: "span 2" }}>
          <label>Subject</label>
          <select
            name="subjectId"
            required
            value={slot.subjectId}
            onChange={(e) => setSlot((prev) => ({ ...prev, subjectId: e.target.value }))}
          >
            <option value="">—</option>
            {state.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <label>Teacher</label>
          <select
            name="teacherId"
            value={slot.teacherId}
            onChange={(e) => setSlot((prev) => ({ ...prev, teacherId: e.target.value }))}
          >
            <option value="">Unassigned</option>
            {state.teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Day</label>
          <select
            name="weekday"
            value={slot.weekday}
            onChange={(e) => setSlot((prev) => ({ ...prev, weekday: e.target.value as Weekday }))}
          >
            {WEEKDAYS.map((day) => (
              <option key={day} value={day}>
                {DAY_LABEL[day]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Room</label>
          <input
            name="roomNumber"
            placeholder="204"
            value={slot.roomNumber}
            onChange={(e) => setSlot((prev) => ({ ...prev, roomNumber: e.target.value }))}
          />
        </div>
        <div>
          <label>Start</label>
          <input
            name="startTime"
            type="time"
            required
            value={slot.startTime}
            onChange={(e) => setSlot((prev) => ({ ...prev, startTime: e.target.value }))}
          />
        </div>
        <div>
          <label>End</label>
          <input
            name="endTime"
            type="time"
            required
            value={slot.endTime}
            onChange={(e) => setSlot((prev) => ({ ...prev, endTime: e.target.value }))}
          />
        </div>
        <div>
          <button className="btn" type="submit">
            Add period
          </button>
        </div>
      </form>
    </>
  );
}
