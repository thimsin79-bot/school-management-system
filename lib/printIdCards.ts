import JsBarcode from "jsbarcode";
import { buildLookups } from "./lookups";
import type { AppState, Student } from "./types";
import { escapeHtml, formatDate, initials } from "./utils";

function barcodeMarkup(value: string): string {
  const holder = document.createElement("div");
  try {
    JsBarcode(holder, value, {
      format: "CODE128",
      displayValue: false,
      lineColor: "#ffffff",
      background: "transparent",
      height: 48,
      width: 1.6,
      margin: 0,
    });
  } catch {
    return "";
  }
  return holder.querySelector("svg")?.outerHTML ?? "";
}

function cardMarkup(state: AppState, student: Student, compact: boolean): string {
  const { classroomName } = buildLookups(state);
  const mod = compact ? " compact" : "";
  const name = escapeHtml(student.name || "—");
  const sid = escapeHtml(student.studentId || "—");
  const cls = escapeHtml(classroomName(student.classRoomId));
  const dob = student.dob ? escapeHtml(formatDate(student.dob)) : "—";
  const gender = escapeHtml(student.gender || "—");
  const photo = student.photo
    ? `<img class="photo${mod}" src="${student.photo}" alt="">`
    : `<div class="photo${mod} ph-text">${escapeHtml(initials(student.name))}</div>`;
  const barcode = student.studentId ? barcodeMarkup(student.studentId) : "";

  return (
    `<div class="id-card${mod}">` +
    `<div class="head"><div class="school">Student Management</div>` +
    `<div class="sub">Student ID Card</div><div class="ldiv"></div></div>` +
    `<div class="body">${photo}<div class="name">${name}</div>` +
    `<div class="meta"><div><span class="k">Student ID:</span> ${sid}</div>` +
    `<div><span class="k">Class:</span> ${cls}</div>` +
    `<div><span class="k">Gender:</span> ${gender} &nbsp;·&nbsp; <span class="k">DOB:</span> ${dob}</div></div>` +
    `<div class="barcode-box">${barcode}<div class="bval">${sid}</div></div>` +
    `</div></div>`
  );
}

const PRINT_CSS = `
body{margin:0;background:#dfe7f3;font-family:Arial,Helvetica,sans-serif;padding:20px;}
.card-grid-c{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:16px;max-width:1020px;margin:0 auto;}
.id-card{width:340px;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(10,25,41,0.35);margin:0 auto;}
.id-card.compact{width:100%;box-shadow:0 4px 12px rgba(10,25,41,0.2);}
.head{background:linear-gradient(135deg,#0a1929,#14314f);color:#fff;text-align:center;padding:18px 16px 14px;}
.head .school{font-size:16px;font-weight:700;letter-spacing:.5px;}
.head .sub{font-size:10px;opacity:.85;letter-spacing:3px;margin-top:4px;text-transform:uppercase;}
.head .ldiv{width:38px;height:2px;background:#3b82f6;margin:8px auto 0;border-radius:2px;}
.body{background:#fff;text-align:center;padding:0 18px 16px;}
.photo{width:96px;height:96px;border-radius:50%;object-fit:cover;margin:-48px auto 10px;border:4px solid #fff;background:#eef2f7;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:700;color:#14314f;box-shadow:0 2px 8px rgba(20,49,79,0.2);}
.photo.compact{width:72px;height:72px;margin:-36px auto 8px;font-size:24px;}
.name{font-size:18px;font-weight:700;color:#0a1929;}
.id-card.compact .name{font-size:15px;}
.meta{margin-top:12px;font-size:12px;color:#3f4d63;line-height:1.8;}
.meta .k{color:#14314f;font-weight:700;}
.barcode-box{background:#14314f;border-radius:8px;margin-top:14px;padding:10px 12px 8px;text-align:center;}
.barcode-box svg{max-width:100%;}
.barcode-box .bval{color:#fff;font-size:11px;letter-spacing:2px;margin-top:5px;}
@media print{body{background:#fff;padding:0;}.id-card{box-shadow:none;page-break-inside:avoid;}.card-grid-c{max-width:none;}}
`;

export function printIdCards(state: AppState, students: Student[]): void {
  if (typeof window === "undefined") return;

  const win = window.open("", "_blank", "width=940,height=700");
  if (!win) {
    window.alert("Please allow pop-ups to print ID cards.");
    return;
  }

  const bulk = students.length > 1;
  const cards = students.map((student) => cardMarkup(state, student, bulk)).join("");

  win.document.write(
    `<!DOCTYPE html><html><head><meta charset="UTF-8">` +
      `<title>Student ID Cards</title><style>${PRINT_CSS}</style></head><body>` +
      `${bulk ? `<div class="card-grid-c">${cards}</div>` : cards}` +
      `<script>setTimeout(function(){try{window.focus();window.print();}catch(e){}},600);<\/script>` +
      `</body></html>`,
  );
  win.document.close();
}
