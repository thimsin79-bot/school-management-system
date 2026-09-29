"use client";

import { useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { useLookups } from "@/lib/lookups";
import { uid } from "@/lib/utils";
import { AUDIENCE_LABEL } from "@/lib/types";
import type { Notice, NoticeAudience } from "@/lib/types";
import { Crumbs, RowActions } from "@/components/ui";

const EMPTY_FORM: {
  title: string;
  body: string;
  audience: NoticeAudience;
  classRoomId: string;
  pinned: boolean;
} = {
  title: "",
  body: "",
  audience: "all",
  classRoomId: "",
  pinned: false,
};

export function NoticesView() {
  const { state, update } = useApp();
  const lookups = useLookups(state);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const formRef = useRef<HTMLFormElement>(null);

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(notice: Notice) {
    setEditingId(notice.id);
    setForm({
      title: notice.title ?? "",
      body: notice.body ?? "",
      audience: notice.audience ?? "all",
      classRoomId: notice.classRoomId ?? "",
      pinned: Boolean(notice.pinned),
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function removeNotice(id: string) {
    update((draft) => {
      draft.notices = draft.notices.filter((n) => n.id !== id);
    });
    if (editingId === id) cancelEdit();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();
    const body = form.body.trim();
    if (!title || !body) return;

    const payload = {
      title,
      body,
      audience: form.audience,
      classRoomId: form.audience === "class" ? (form.classRoomId || null) : null,
      pinned: form.pinned,
    };

    if (editingId) {
      update((draft) => {
        const notice = draft.notices.find((n) => n.id === editingId);
        if (notice) Object.assign(notice, payload);
      });
      cancelEdit();
      return;
    }

    update((draft) => {
      draft.notices.push({ id: uid(), ...payload, publishedAt: Date.now() });
    });
    cancelEdit();
  }

  const sorted = [...state.notices].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt - a.publishedAt,
  );

  return (
    <>
      <Crumbs title="Notice" />

      <form
        className="card"
        ref={formRef}
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <div>
          <label>Title</label>
          <input
            name="title"
            required
            placeholder="Sports Day — schedule change"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
          />
        </div>
        <div>
          <label>Notice</label>
          <textarea
            name="body"
            rows={3}
            required
            placeholder="Write the notice as it should appear to readers…"
            value={form.body}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            alignItems: "flex-end",
          }}
        >
          <div>
            <label>Audience</label>
            <select
              name="audience"
              value={form.audience}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  audience: e.target.value as NoticeAudience,
                }))
              }
            >
              <option value="all">Everyone</option>
              <option value="students">Students</option>
              <option value="teachers">Teachers</option>
              <option value="parents">Parents</option>
              <option value="class">One class</option>
            </select>
          </div>
          <div>
            <label>Class (if audience is a class)</label>
            <select
              name="classRoomId"
              value={form.classRoomId}
              onChange={(e) => setForm((prev) => ({ ...prev, classRoomId: e.target.value }))}
            >
              <option value="">—</option>
              {state.classRooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--text-dim)",
              marginBottom: 8,
            }}
          >
            <input
              type="checkbox"
              name="pinned"
              style={{ width: "auto" }}
              checked={form.pinned}
              onChange={(e) => setForm((prev) => ({ ...prev, pinned: e.target.checked }))}
            />
            Pin to top
          </label>
          {editingId !== null ? (
            <button type="button" className="link-btn" onClick={cancelEdit}>
              Cancel edit
            </button>
          ) : null}
          <button className="btn" type="submit" style={{ marginLeft: "auto" }}>
            {editingId !== null ? "Update notice" : "Post notice"}
          </button>
        </div>
      </form>

      <div>
        {sorted.length === 0 ? (
          <p className="muted" style={{ textAlign: "center", padding: "40px 0", fontSize: 13 }}>
            No notices posted yet.
          </p>
        ) : (
          sorted.map((notice) => (
            <article key={notice.id} className={notice.pinned ? "notice pinned" : "notice"}>
              <div className="notice-head">
                <div>
                  <h3>
                    {notice.pinned ? (
                      <>
                        <span style={{ color: "var(--orange)" }}>●</span>{" "}
                      </>
                    ) : null}
                    {notice.title}
                  </h3>
                  <div className="meta">
                    {AUDIENCE_LABEL[notice.audience]}
                    {notice.audience === "class" && notice.classRoomId
                      ? ` — ${lookups.classroomName(notice.classRoomId)}`
                      : ""}{" "}
                    · {new Date(notice.publishedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ whiteSpace: "nowrap" }}>
                  <RowActions
                    actions={[
                      { label: "Edit", onClick: () => startEdit(notice) },
                      {
                        label: "Remove",
                        danger: true,
                        onClick: () => removeNotice(notice.id),
                      },
                    ]}
                  />
                </div>
              </div>
              <p>{notice.body}</p>
            </article>
          ))
        )}
      </div>
    </>
  );
}
