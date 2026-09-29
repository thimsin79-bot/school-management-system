import type { ReactNode } from "react";
import { cx, initials } from "@/lib/utils";

export function Crumbs({
  title,
  dim,
  path,
}: {
  title: string;
  dim?: string;
  path?: string;
}) {
  return (
    <div className="crumbs">
      <h1>
        {title}
        {dim ? <span className="dim">{dim}</span> : null}
      </h1>
      {path ? <div className="crumb-path">{path}</div> : null}
    </div>
  );
}

export function Avatar({ name, photo }: { name: string; photo?: string | null }) {
  return (
    <span className="avatar-sm">
      {photo ? <img src={photo} alt="" /> : initials(name)}
    </span>
  );
}

export function Pill({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={cx("pill", tone)}>{children}</span>;
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr className="empty-row">
      <td colSpan={colSpan}>{children}</td>
    </tr>
  );
}

export interface RowAction {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

export function RowActions({ actions }: { actions: RowAction[] }) {
  return (
    <div className="row-actions">
      {actions.map((action, index) => (
        <span key={action.label}>
          {index > 0 ? " · " : null}
          <button
            type="button"
            className={cx("link-btn", action.danger && "danger")}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        </span>
      ))}
    </div>
  );
}

export function StatCards({ cards }: { cards: Array<{ n: ReactNode; l: string; cls: string; g: string }> }) {
  return (
    <div className="stat-cards">
      {cards.map((card) => (
        <div key={card.l} className={cx("stat-card", card.cls)}>
          <div className="num">{card.n}</div>
          <div className="lbl">{card.l}</div>
          <div className="glyph">{card.g}</div>
        </div>
      ))}
    </div>
  );
}

export function FormActions({
  addLabel,
  updateLabel,
  editing,
  onCancel,
  wrapClassName = "full",
}: {
  addLabel: string;
  updateLabel: string;
  editing: boolean;
  onCancel: () => void;
  wrapClassName?: string;
}) {
  return (
    <div className={wrapClassName} style={{ display: "flex", gap: 10 }}>
      <button className="btn" type="submit">
        {editing ? updateLabel : addLabel}
      </button>
      {editing ? (
        <button type="button" className="link-btn" onClick={onCancel}>
          Cancel edit
        </button>
      ) : null}
    </div>
  );
}
