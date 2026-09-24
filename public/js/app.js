(function(){
  "use strict";
  const KEY = "sms_full_app_v1";
  const WEEKDAYS = ["monday","tuesday","wednesday","thursday","friday","saturday"];
  const DAY_LABEL = {monday:"Monday",tuesday:"Tuesday",wednesday:"Wednesday",thursday:"Thursday",friday:"Friday",saturday:"Saturday"};

  function uid(){ return Math.random().toString(36).slice(2,9) + Date.now().toString(36); }
  function todayISO(){ return new Date().toISOString().slice(0,10); }
  function escapeHtml(str){ return String(str).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }
  function formatDate(iso){ const d = new Date(iso+"T00:00:00"); return isNaN(d) ? iso : d.toLocaleDateString(); }
  function initials(name){ return (name||"").split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(); }

  function seedData(){
    const t1 = uid(), t2 = uid();
    const c1 = uid();
    const sMath = uid(), sEng = uid(), sSci = uid();
    const students = [
      {id: uid(), studentId:"STU-1001", name:"Sopheak Chan", gender:"Male", dob:"2012-03-11", classRoomId:c1, fatherName:"Mr. Sokha Chan", fatherContact:"012 345 111", motherName:"Mrs. Chanthy Chan", motherContact:"012 345 211"},
      {id: uid(), studentId:"STU-1002", name:"Dara Meas", gender:"Female", dob:"2012-06-20", classRoomId:c1, fatherName:"Mr. Bora Meas", fatherContact:"012 345 112", motherName:"Mrs. Lina Meas", motherContact:"012 345 212"},
      {id: uid(), studentId:"STU-1003", name:"Vanna Sok", gender:"Male", dob:"2012-01-02", classRoomId:c1, fatherName:"Mr. Piseth Sok", fatherContact:"012 345 113", motherName:"Mrs. Kanha Sok", motherContact:"012 345 213"},
      {id: uid(), studentId:"STU-1004", name:"Bopha Ly", gender:"Female", dob:"2012-09-14", classRoomId:c1, fatherName:"Mr. Chetra Ly", fatherContact:"012 345 114", motherName:"Mrs. Sreynich Ly", motherContact:"012 345 214"},
      {id: uid(), studentId:"STU-1005", name:"Rithy Pen", gender:"Male", dob:"2012-11-30", classRoomId:c1, fatherName:"Mr. Vuthy Pen", fatherContact:"012 345 115", motherName:"Mrs. Sopheap Pen", motherContact:"012 345 215"},
    ];
    return {
      teachers: [
        {id:t1, name:"Mrs. Sreymom Heng", subjectId: sMath, phone:"012 900 001", email:"sreymom.heng@school.edu"},
        {id:t2, name:"Mr. Vibol Chea", subjectId: sEng, phone:"012 900 002", email:"vibol.chea@school.edu"},
      ],
      students: students,
      parents: [
        {id: uid(), name:"Mr. Sokha Chan", phone:"012 345 111", email:"sokha.chan@email.com", studentIds:[students[0].id]},
      ],
      subjects: [
        {id:sMath, name:"Mathematics", code:"MATH101", department:"Sciences", creditHours:4},
        {id:sEng, name:"English Language", code:"ENG101", department:"Humanities", creditHours:3},
        {id:sSci, name:"General Science", code:"SCI101", department:"Sciences", creditHours:4},
      ],
      classRooms: [
        {id:c1, name:"Grade 8 - A", gradeLevel:"Grade 8", section:"A", roomNumber:"204", capacity:32, classTeacherId:t1},
      ],
      schedule: [
        {id: uid(), classRoomId:c1, subjectId:sMath, teacherId:t1, weekday:"monday", startTime:"08:00", endTime:"08:45", roomNumber:"204"},
        {id: uid(), classRoomId:c1, subjectId:sEng, teacherId:t2, weekday:"monday", startTime:"08:45", endTime:"09:30", roomNumber:"204"},
      ],
      attendance: [],
      exams: [
        {id: uid(), name:"Mid-Term Examination", term:"Term 2", classRoomId:c1, subjectId:sSci, examDate:"2026-10-15", maxMarks:100, passMarks:40, status:"scheduled"},
      ],
      examResults: [],
      users: [
        {id: uid(), name:"Nimal Soyza", email:"nimal.soyza@school.edu", role:"Admin"},
        {id: uid(), name:"Mrs. Sreymom Heng", email:"sreymom.heng@school.edu", role:"Teacher"},
      ],
      notices: [
        {id: uid(), title:"Mid-term exam schedule posted", body:"The Term 2 mid-term timetable is now on the notice board. Please check your class's exam dates under Exam Results.", audience:"students", classRoomId:null, pinned:true, publishedAt: Date.now()},
      ],
    };
  }
  function load(){
    try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch(e){}
    const seeded = seedData(); save(seeded); return seeded;
  }
  function save(state){ try { localStorage.setItem(KEY, JSON.stringify(state)); } catch(e){} }
  let state = load();

  // ---------- Nav ----------
  const views = document.querySelectorAll(".view");
  const navItems = document.querySelectorAll(".nav-item");
  const sidebar = document.getElementById("sidebar");
  function showView(name){
    views.forEach(v => v.classList.toggle("active", v.id === "view-"+name));
    navItems.forEach(n => n.classList.toggle("active", n.dataset.view === name));
    sidebar.classList.remove("open");
    renderAll();
  }
  navItems.forEach(n => n.addEventListener("click", () => showView(n.dataset.view)));
  document.getElementById("menuToggle").addEventListener("click", () => sidebar.classList.toggle("open"));

  // ---------- Lookups ----------
  function classroomName(id){ const c = state.classRooms.find(c=>c.id===id); return c?c.name:"—"; }
  function subjectName(id){ const s = state.subjects.find(s=>s.id===id); return s?s.name:"—"; }
  function teacherName(id){ const t = state.teachers.find(t=>t.id===id); return t?t.name:null; }
  function studentName(id){ const s = state.students.find(s=>s.id===id); return s?s.name:"—"; }
  function studentsInClass(id){ return state.students.filter(s=>s.classRoomId===id); }
  function fillSelect(select, items, placeholder){
    select.innerHTML = (placeholder ? `<option value="">${placeholder}</option>` : "") + items.map(i=>`<option value="${i.id}">${i.label}</option>`).join("");
  }

  // ---------- DASHBOARD ----------
  function renderDashboard(){
    const cards = [
      {n: state.students.length, l:"Total Students", cls:"blue", g:"◉"},
      {n: state.teachers.length, l:"Total Teachers", cls:"green", g:"◈"},
      {n: state.subjects.length, l:"Total Subjects", cls:"orange", g:"▤"},
      {n: state.parents.length, l:"Registered Parents", cls:"red", g:"◐"},
    ];
    document.getElementById("statCards").innerHTML = cards.map(c=>`
      <div class="stat-card ${c.cls}"><div class="num">${c.n}</div><div class="lbl">${c.l}</div><div class="glyph">${c.g}</div></div>`).join("");
  }

  // ---------- STUDENTS ----------
  let editingStudentId = null;
  function renderStudents(){
    fillSelect(document.getElementById("studentClassSelect"), state.classRooms.map(c=>({id:c.id,label:c.name})));
    const body = document.getElementById("studentsBody");
    if (state.students.length===0){ body.innerHTML = `<tr class="empty-row"><td colspan="7">No students yet — add the first one above.</td></tr>`; return; }
    body.innerHTML = state.students.map(s=>`
      <tr>
        <td class="mono">${escapeHtml(s.studentId||"—")}${s.studentId?`<svg class="id-barcode" data-barcode="${escapeHtml(s.studentId)}"></svg>`:""}</td>
        <td><span class="avatar-sm">${initials(s.name)}</span>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.gender||"—")}</td>
        <td>${escapeHtml(classroomName(s.classRoomId))}</td>
        <td>${s.fatherName||s.fatherContact ? `${escapeHtml(s.fatherName||"—")}${s.fatherContact?`<br><span class="muted" style="font-size:11px;">${escapeHtml(s.fatherContact)}</span>`:""}` : "—"}</td>
        <td>${s.motherName||s.motherContact ? `${escapeHtml(s.motherName||"—")}${s.motherContact?`<br><span class="muted" style="font-size:11px;">${escapeHtml(s.motherContact)}</span>`:""}` : "—"}</td>
        <td style="text-align:right; white-space:nowrap;"><button class="link-btn" data-edit-student="${s.id}">Edit</button> &nbsp;·&nbsp; <button class="link-btn danger" data-del-student="${s.id}">Remove</button></td>
      </tr>`).join("");
    body.querySelectorAll("[data-barcode]").forEach(svg=>{
      try { JsBarcode(svg, svg.dataset.barcode, {format:"CODE128", displayValue:false, height:28, width:1.5, margin:0, background:"transparent"}); } catch(e){}
    });
    body.querySelectorAll("[data-del-student]").forEach(b=>b.addEventListener("click", ()=>{
      const id = b.dataset.delStudent;
      state.students = state.students.filter(s=>s.id!==id);
      state.examResults = state.examResults.filter(r=>r.studentId!==id);
      state.attendance = state.attendance.filter(a=>a.studentId!==id);
      if (editingStudentId === id) cancelStudentEdit();
      save(state); renderAll();
    }));
    body.querySelectorAll("[data-edit-student]").forEach(b=>b.addEventListener("click", ()=>{
      const s = state.students.find(x=>x.id===b.dataset.editStudent);
      if (!s) return;
      editingStudentId = s.id;
      const f = document.getElementById("studentForm");
      f.name.value = s.name||""; f.studentId.value = s.studentId||""; f.gender.value = s.gender||"Female"; f.dob.value = s.dob||"";
      f.classRoomId.value = s.classRoomId||""; f.fatherName.value = s.fatherName||""; f.fatherContact.value = s.fatherContact||"";
      f.motherName.value = s.motherName||""; f.motherContact.value = s.motherContact||"";
      document.getElementById("studentSubmitBtn").textContent = "Update student";
      document.getElementById("studentCancelBtn").style.display = "inline";
      f.scrollIntoView({behavior:"smooth", block:"start"});
    }));
  }
  function cancelStudentEdit(){
    editingStudentId = null;
    document.getElementById("studentForm").reset();
    document.getElementById("studentSubmitBtn").textContent = "Add student";
    document.getElementById("studentCancelBtn").style.display = "none";
  }
  document.getElementById("studentCancelBtn").addEventListener("click", cancelStudentEdit);
  document.getElementById("studentForm").addEventListener("submit", e=>{
    e.preventDefault(); const f = new FormData(e.target);
    const name = f.get("name").trim(); if(!name) return;
    const payload = {name, studentId:f.get("studentId").trim()||null, gender:f.get("gender"), dob:f.get("dob")||null, classRoomId:f.get("classRoomId")||null, fatherName:f.get("fatherName").trim()||null, fatherContact:f.get("fatherContact").trim()||null, motherName:f.get("motherName").trim()||null, motherContact:f.get("motherContact").trim()||null};
    if (editingStudentId){
      const s = state.students.find(x=>x.id===editingStudentId);
      if (s) Object.assign(s, payload);
      cancelStudentEdit();
    } else {
      state.students.push({id:uid(), ...payload});
      e.target.reset();
    }
    save(state); renderAll();
  });

  // ---------- TEACHERS ----------
  let editingTeacherId = null;
  function renderTeachers(){
    fillSelect(document.getElementById("teacherSubjectSelect"), state.subjects.map(s=>({id:s.id,label:s.name})), "Unassigned");
    const body = document.getElementById("teachersBody");
    if (state.teachers.length===0){ body.innerHTML = `<tr class="empty-row"><td colspan="5">No teachers yet — add the first one above.</td></tr>`; return; }
    body.innerHTML = state.teachers.map(t=>`
      <tr>
        <td><span class="avatar-sm">${initials(t.name)}</span>${escapeHtml(t.name)}</td>
        <td>${escapeHtml(subjectName(t.subjectId))}</td>
        <td>${escapeHtml(t.phone||"—")}</td>
        <td>${escapeHtml(t.email||"—")}</td>
        <td style="text-align:right; white-space:nowrap;"><button class="link-btn" data-edit-teacher="${t.id}">Edit</button> &nbsp;·&nbsp; <button class="link-btn danger" data-del-teacher="${t.id}">Remove</button></td>
      </tr>`).join("");
    body.querySelectorAll("[data-del-teacher]").forEach(b=>b.addEventListener("click", ()=>{
      const id = b.dataset.delTeacher;
      state.teachers = state.teachers.filter(t=>t.id!==id);
      state.classRooms.forEach(c=>{ if(c.classTeacherId===id) c.classTeacherId=null; });
      state.schedule.forEach(s=>{ if(s.teacherId===id) s.teacherId=null; });
      if (editingTeacherId === id) cancelTeacherEdit();
      save(state); renderAll();
    }));
    body.querySelectorAll("[data-edit-teacher]").forEach(b=>b.addEventListener("click", ()=>{
      const t = state.teachers.find(x=>x.id===b.dataset.editTeacher);
      if (!t) return;
      editingTeacherId = t.id;
      const f = document.getElementById("teacherForm");
      f.name.value = t.name||""; f.subjectId.value = t.subjectId||""; f.phone.value = t.phone||""; f.email.value = t.email||"";
      document.getElementById("teacherSubmitBtn").textContent = "Update teacher";
      document.getElementById("teacherCancelBtn").style.display = "inline";
      f.scrollIntoView({behavior:"smooth", block:"start"});
    }));
  }
  function cancelTeacherEdit(){
    editingTeacherId = null;
    document.getElementById("teacherForm").reset();
    document.getElementById("teacherSubmitBtn").textContent = "Add teacher";
    document.getElementById("teacherCancelBtn").style.display = "none";
  }
  document.getElementById("teacherCancelBtn").addEventListener("click", cancelTeacherEdit);
  document.getElementById("teacherForm").addEventListener("submit", e=>{
    e.preventDefault(); const f = new FormData(e.target);
    const name = f.get("name").trim(); if(!name) return;
    const payload = {name, subjectId:f.get("subjectId")||null, phone:f.get("phone").trim()||null, email:f.get("email").trim()||null};
    if (editingTeacherId){
      const t = state.teachers.find(x=>x.id===editingTeacherId);
      if (t) Object.assign(t, payload);
      cancelTeacherEdit();
    } else {
      state.teachers.push({id:uid(), ...payload});
      e.target.reset();
    }
    save(state); renderAll();
  });

  // ---------- PARENTS ----------
  let editingParentId = null;
  function renderParents(){
    fillSelect(document.getElementById("parentStudentSelect"), state.students.map(s=>({id:s.id,label:s.name})), "No linked student");
    const body = document.getElementById("parentsBody");
    if (state.parents.length===0){ body.innerHTML = `<tr class="empty-row"><td colspan="5">No parents registered yet.</td></tr>`; return; }
    body.innerHTML = state.parents.map(p=>`
      <tr>
        <td><span class="avatar-sm">${initials(p.name)}</span>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.phone||"—")}</td>
        <td>${escapeHtml(p.email||"—")}</td>
        <td>${p.studentIds.map(id=>escapeHtml(studentName(id))).join(", ")||"—"}</td>
        <td style="text-align:right; white-space:nowrap;"><button class="link-btn" data-edit-parent="${p.id}">Edit</button> &nbsp;·&nbsp; <button class="link-btn danger" data-del-parent="${p.id}">Remove</button></td>
      </tr>`).join("");
    body.querySelectorAll("[data-del-parent]").forEach(b=>b.addEventListener("click", ()=>{
      const id = b.dataset.delParent;
      state.parents = state.parents.filter(p=>p.id!==id);
      if (editingParentId === id) cancelParentEdit();
      save(state); renderAll();
    }));
    body.querySelectorAll("[data-edit-parent]").forEach(b=>b.addEventListener("click", ()=>{
      const p = state.parents.find(x=>x.id===b.dataset.editParent);
      if (!p) return;
      editingParentId = p.id;
      const f = document.getElementById("parentForm");
      f.name.value = p.name||""; f.phone.value = p.phone||""; f.email.value = p.email||""; f.studentId.value = p.studentIds[0]||"";
      document.getElementById("parentSubmitBtn").textContent = "Update parent";
      document.getElementById("parentCancelBtn").style.display = "inline";
      f.scrollIntoView({behavior:"smooth", block:"start"});
    }));
  }
  function cancelParentEdit(){
    editingParentId = null;
    document.getElementById("parentForm").reset();
    document.getElementById("parentSubmitBtn").textContent = "Add parent";
    document.getElementById("parentCancelBtn").style.display = "none";
  }
  document.getElementById("parentCancelBtn").addEventListener("click", cancelParentEdit);
  document.getElementById("parentForm").addEventListener("submit", e=>{
    e.preventDefault(); const f = new FormData(e.target);
    const name = f.get("name").trim(); if(!name) return;
    const sid = f.get("studentId");
    if (editingParentId){
      const p = state.parents.find(x=>x.id===editingParentId);
      if (p) Object.assign(p, {name, phone:f.get("phone").trim()||null, email:f.get("email").trim()||null, studentIds: sid?[sid]:[]});
      cancelParentEdit();
    } else {
      state.parents.push({id:uid(), name, phone:f.get("phone").trim()||null, email:f.get("email").trim()||null, studentIds: sid?[sid]:[]});
      e.target.reset();
    }
    save(state); renderAll();
  });

  // ---------- SUBJECTS ----------
  let editingSubjectId = null;
  function renderSubjects(){
    const body = document.getElementById("subjectsBody");
    if (state.subjects.length===0){ body.innerHTML = `<tr class="empty-row"><td colspan="5">No subjects yet — add the first one above.</td></tr>`; return; }
    body.innerHTML = state.subjects.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(s=>`
      <tr>
        <td class="mono">${escapeHtml(s.code)}</td>
        <td style="font-weight:600;">${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.department||"—")}</td>
        <td>${s.creditHours}</td>
        <td style="text-align:right; white-space:nowrap;"><button class="link-btn" data-edit-subject="${s.id}">Edit</button> &nbsp;·&nbsp; <button class="link-btn danger" data-del-subject="${s.id}">Remove</button></td>
      </tr>`).join("");
    body.querySelectorAll("[data-del-subject]").forEach(b=>b.addEventListener("click", ()=>{
      const id = b.dataset.delSubject;
      state.subjects = state.subjects.filter(s=>s.id!==id);
      if (editingSubjectId === id) cancelSubjectEdit();
      save(state); renderAll();
    }));
    body.querySelectorAll("[data-edit-subject]").forEach(b=>b.addEventListener("click", ()=>{
      const s = state.subjects.find(x=>x.id===b.dataset.editSubject);
      if (!s) return;
      editingSubjectId = s.id;
      const f = document.getElementById("subjectForm");
      f.name.value = s.name||""; f.code.value = s.code||""; f.creditHours.value = s.creditHours||1; f.department.value = s.department||"";
      document.getElementById("subjectSubmitBtn").textContent = "Update subject";
      document.getElementById("subjectCancelBtn").style.display = "inline";
      f.scrollIntoView({behavior:"smooth", block:"start"});
    }));
  }
  function cancelSubjectEdit(){
    editingSubjectId = null;
    document.getElementById("subjectForm").reset();
    document.getElementById("subjectSubmitBtn").textContent = "Add subject";
    document.getElementById("subjectCancelBtn").style.display = "none";
  }
  document.getElementById("subjectCancelBtn").addEventListener("click", cancelSubjectEdit);
  document.getElementById("subjectForm").addEventListener("submit", e=>{
    e.preventDefault(); const f = new FormData(e.target);
    const name = f.get("name").trim(), code = f.get("code").trim().toUpperCase();
    if(!name||!code) return;
    const payload = {name, code, department:f.get("department").trim()||null, creditHours:Number(f.get("creditHours")||1)};
    if (editingSubjectId){
      const s = state.subjects.find(x=>x.id===editingSubjectId);
      if (s) Object.assign(s, payload);
      cancelSubjectEdit();
    } else {
      state.subjects.push({id:uid(), ...payload});
      e.target.reset();
    }
    save(state); renderAll();
  });

  // ---------- CLASS ROOMS ----------
  let editingClassroomId = null;
  function renderClassrooms(){
    fillSelect(document.getElementById("classTeacherSelect"), state.teachers.map(t=>({id:t.id,label:t.name})), "Unassigned");
    const body = document.getElementById("classroomsBody");
    if (state.classRooms.length===0){ body.innerHTML = `<tr class="empty-row"><td colspan="6">No class rooms yet — add the first one above.</td></tr>`; return; }
    body.innerHTML = state.classRooms.map(c=>`
      <tr>
        <td style="font-weight:600;">${escapeHtml(c.name)}</td>
        <td>${escapeHtml(c.roomNumber||"—")}</td>
        <td>${c.capacity}</td>
        <td>${escapeHtml(teacherName(c.classTeacherId)||"Unassigned")}</td>
        <td>${studentsInClass(c.id).length}</td>
        <td style="text-align:right; white-space:nowrap;"><button class="link-btn" data-edit-class="${c.id}">Edit</button> &nbsp;·&nbsp; <button class="link-btn danger" data-del-class="${c.id}">Remove</button></td>
      </tr>`).join("");
    body.querySelectorAll("[data-del-class]").forEach(b=>b.addEventListener("click", ()=>{
      const id = b.dataset.delClass;
      state.classRooms = state.classRooms.filter(c=>c.id!==id);
      state.schedule = state.schedule.filter(s=>s.classRoomId!==id);
      state.exams = state.exams.filter(e=>e.classRoomId!==id);
      if (editingClassroomId === id) cancelClassroomEdit();
      save(state); renderAll();
    }));
    body.querySelectorAll("[data-edit-class]").forEach(b=>b.addEventListener("click", ()=>{
      const c = state.classRooms.find(x=>x.id===b.dataset.editClass);
      if (!c) return;
      editingClassroomId = c.id;
      const f = document.getElementById("classroomForm");
      f.gradeLevel.value = c.gradeLevel||""; f.section.value = c.section||""; f.roomNumber.value = c.roomNumber||"";
      f.capacity.value = c.capacity||30; f.classTeacherId.value = c.classTeacherId||"";
      document.getElementById("classroomSubmitBtn").textContent = "Update class";
      document.getElementById("classroomCancelBtn").style.display = "inline";
      f.scrollIntoView({behavior:"smooth", block:"start"});
    }));
  }
  function cancelClassroomEdit(){
    editingClassroomId = null;
    document.getElementById("classroomForm").reset();
    document.getElementById("classroomSubmitBtn").textContent = "Add class";
    document.getElementById("classroomCancelBtn").style.display = "none";
  }
  document.getElementById("classroomCancelBtn").addEventListener("click", cancelClassroomEdit);
  document.getElementById("classroomForm").addEventListener("submit", e=>{
    e.preventDefault(); const f = new FormData(e.target);
    const gradeLevel = f.get("gradeLevel").trim(); if(!gradeLevel) return;
    const section = f.get("section").trim();
    const payload = {name: section?`${gradeLevel} - ${section}`:gradeLevel, gradeLevel, section:section||null, roomNumber:f.get("roomNumber").trim()||null, capacity:Number(f.get("capacity")||30), classTeacherId:f.get("classTeacherId")||null};
    if (editingClassroomId){
      const c = state.classRooms.find(x=>x.id===editingClassroomId);
      if (c) Object.assign(c, payload);
      cancelClassroomEdit();
    } else {
      state.classRooms.push({id:uid(), ...payload});
      e.target.reset();
    }
    save(state); renderAll();
  });

  // ---------- SCHEDULE ----------
  function renderSchedule(){
    const sel = document.getElementById("scheduleClassSelect");
    const prev = sel.value;
    fillSelect(sel, state.classRooms.map(c=>({id:c.id,label:c.name})));
    if (prev && state.classRooms.some(c=>c.id===prev)) sel.value = prev;
    const activeId = sel.value || (state.classRooms[0]&&state.classRooms[0].id);
    fillSelect(document.getElementById("scheduleSubjectSelect"), state.subjects.map(s=>({id:s.id,label:s.name})));
    fillSelect(document.getElementById("scheduleTeacherSelect"), state.teachers.map(t=>({id:t.id,label:t.name})), "Unassigned");
    const grid = document.getElementById("weekGrid");
    if (!activeId){ grid.innerHTML = `<div style="padding:24px; color:var(--text-faint); font-size:13px;">Add a class room first.</div>`; return; }
    const slots = state.schedule.filter(s=>s.classRoomId===activeId);
    grid.innerHTML = WEEKDAYS.map(day=>{
      const daySlots = slots.filter(s=>s.weekday===day).sort((a,b)=>a.startTime.localeCompare(b.startTime));
      return `<div class="day-col"><div class="day-head">${DAY_LABEL[day]}</div><div class="day-body">
        ${daySlots.length===0?`<div class="no-period">No periods</div>`:daySlots.map(s=>`
          <div class="slot-card"><button class="slot-remove" data-del-slot="${s.id}">✕</button>
            <div class="t1">${escapeHtml(subjectName(s.subjectId))}</div>
            <div class="t2">${s.startTime}–${s.endTime}</div>
            ${teacherName(s.teacherId)?`<div class="t3">${escapeHtml(teacherName(s.teacherId))}</div>`:""}
          </div>`).join("")}
      </div></div>`;
    }).join("");
    grid.querySelectorAll("[data-del-slot]").forEach(b=>b.addEventListener("click", ()=>{
      state.schedule = state.schedule.filter(s=>s.id!==b.dataset.delSlot); save(state); renderAll();
    }));
  }
  document.getElementById("scheduleClassSelect").addEventListener("change", renderSchedule);
  document.getElementById("scheduleForm").addEventListener("submit", e=>{
    e.preventDefault(); const f = new FormData(e.target);
    const classRoomId = document.getElementById("scheduleClassSelect").value;
    if (!classRoomId){ alert("Add a class room first."); return; }
    const startTime = f.get("startTime"), endTime = f.get("endTime");
    if (endTime<=startTime){ alert("End time must be after start time."); return; }
    state.schedule.push({id:uid(), classRoomId, subjectId:f.get("subjectId"), teacherId:f.get("teacherId")||null, weekday:f.get("weekday"), startTime, endTime, roomNumber:f.get("roomNumber").trim()||null});
    save(state); e.target.reset(); renderAll();
  });

  // ---------- ATTENDANCE ----------
  function renderAttendance(){
    const classSel = document.getElementById("attClassSelect");
    const prev = classSel.value;
    fillSelect(classSel, state.classRooms.map(c=>({id:c.id,label:c.name})));
    if (prev && state.classRooms.some(c=>c.id===prev)) classSel.value = prev;
    const dateInput = document.getElementById("attDate");
    if (!dateInput.value) dateInput.value = todayISO();
    const activeClass = classSel.value || (state.classRooms[0]&&state.classRooms[0].id);
    const date = dateInput.value;
    const wrap = document.getElementById("attendanceWrap");
    if (!activeClass){ wrap.innerHTML = `<div class="empty-row" style="padding:36px; text-align:center; color:var(--text-faint);">Add a class room first.</div>`; return; }
    const roster = studentsInClass(activeClass);
    if (roster.length===0){ wrap.innerHTML = `<div style="padding:36px; text-align:center; color:var(--text-faint); font-size:13px;">No students in this class yet.</div>`; return; }
    const records = {};
    state.attendance.filter(a=>a.classRoomId===activeClass && a.date===date).forEach(a=>records[a.studentId]=a.status);
    wrap.innerHTML = roster.map(s=>{
      const status = records[s.id] || "present";
      return `<div class="att-row">
        <div><span class="avatar-sm">${initials(s.name)}</span>${escapeHtml(s.name)}</div>
        <div class="att-opts" data-student="${s.id}">
          <button type="button" class="att-opt ${status==="present"?"sel-present":""}" data-status="present">Present</button>
          <button type="button" class="att-opt ${status==="late"?"sel-late":""}" data-status="late">Late</button>
          <button type="button" class="att-opt ${status==="absent"?"sel-absent":""}" data-status="absent">Absent</button>
        </div>
      </div>`;
    }).join("");
    wrap.querySelectorAll(".att-opts").forEach(group=>{
      group.querySelectorAll(".att-opt").forEach(btn=>btn.addEventListener("click", ()=>{
        group.querySelectorAll(".att-opt").forEach(b=>b.className="att-opt");
        btn.classList.add("sel-"+btn.dataset.status);
      }));
    });
  }
  document.getElementById("attClassSelect").addEventListener("change", renderAttendance);
  document.getElementById("attDate").addEventListener("change", renderAttendance);
  document.getElementById("saveAttendanceBtn").addEventListener("click", ()=>{
    const activeClass = document.getElementById("attClassSelect").value;
    const date = document.getElementById("attDate").value;
    if (!activeClass) return;
    document.querySelectorAll(".att-opts").forEach(group=>{
      const studentId = group.dataset.student;
      const selBtn = group.querySelector(".att-opt[class*='sel-']");
      const status = selBtn ? selBtn.dataset.status : "present";
      let existing = state.attendance.find(a=>a.classRoomId===activeClass && a.date===date && a.studentId===studentId);
      if (existing) existing.status = status;
      else state.attendance.push({id:uid(), classRoomId:activeClass, date, studentId, status});
    });
    save(state);
    const btn = document.getElementById("saveAttendanceBtn");
    const orig = btn.textContent; btn.textContent = "Saved ✓"; setTimeout(()=>btn.textContent=orig, 1200);
  });

  // ---------- EXAMS ----------
  let editingExamId = null;
  const STATUS_LABEL = {scheduled:"Scheduled", ongoing:"Ongoing", completed:"Completed", results_published:"Results published"};
  const STATUS_PILL = {scheduled:"gray", ongoing:"orange", completed:"green", results_published:"green"};
  function renderExams(){
    fillSelect(document.getElementById("examClassSelect"), state.classRooms.map(c=>({id:c.id,label:c.name})));
    fillSelect(document.getElementById("examSubjectSelect"), state.subjects.map(s=>({id:s.id,label:s.name})));
    const body = document.getElementById("examsBody");
    if (state.exams.length===0){ body.innerHTML = `<tr class="empty-row"><td colspan="6">No exams scheduled yet.</td></tr>`; return; }
    const sorted = state.exams.slice().sort((a,b)=>b.examDate.localeCompare(a.examDate));
    body.innerHTML = sorted.map(ex=>`
      <tr>
        <td style="font-weight:600;">${escapeHtml(ex.name)}${ex.term?`<span class="muted" style="font-size:11px; margin-left:6px; font-weight:400;">${escapeHtml(ex.term)}</span>`:""}</td>
        <td>${escapeHtml(classroomName(ex.classRoomId))}</td>
        <td>${escapeHtml(subjectName(ex.subjectId))}</td>
        <td>${formatDate(ex.examDate)}</td>
        <td><span class="pill ${STATUS_PILL[ex.status]}">${STATUS_LABEL[ex.status]}</span></td>
        <td style="text-align:right; white-space:nowrap;"><button class="link-btn" data-edit-exam="${ex.id}">Edit</button> &nbsp;·&nbsp; <button class="link-btn danger" data-del-exam="${ex.id}">Remove</button></td>
      </tr>`).join("");
    body.querySelectorAll("[data-del-exam]").forEach(b=>b.addEventListener("click", ()=>{
      const id = b.dataset.delExam;
      state.exams = state.exams.filter(x=>x.id!==id);
      state.examResults = state.examResults.filter(r=>r.examId!==id);
      if (editingExamId === id) cancelExamEdit();
      save(state); renderAll();
    }));
    body.querySelectorAll("[data-edit-exam]").forEach(b=>b.addEventListener("click", ()=>{
      const ex = state.exams.find(x=>x.id===b.dataset.editExam);
      if (!ex) return;
      editingExamId = ex.id;
      const f = document.getElementById("examForm");
      f.name.value = ex.name||""; f.term.value = ex.term||""; f.classRoomId.value = ex.classRoomId||"";
      f.subjectId.value = ex.subjectId||""; f.examDate.value = ex.examDate||""; f.maxMarks.value = ex.maxMarks;
      f.passMarks.value = ex.passMarks;
      document.getElementById("examSubmitBtn").textContent = "Update exam";
      document.getElementById("examCancelBtn").style.display = "inline";
      f.scrollIntoView({behavior:"smooth", block:"start"});
    }));
  }
  function cancelExamEdit(){
    editingExamId = null;
    document.getElementById("examForm").reset();
    document.getElementById("examSubmitBtn").textContent = "Schedule exam";
    document.getElementById("examCancelBtn").style.display = "none";
  }
  document.getElementById("examCancelBtn").addEventListener("click", cancelExamEdit);
  document.getElementById("examForm").addEventListener("submit", e=>{
    e.preventDefault(); const f = new FormData(e.target);
    const name = f.get("name").trim();
    const classRoomId = f.get("classRoomId"), subjectId = f.get("subjectId"), examDate = f.get("examDate");
    if (!name||!classRoomId||!subjectId||!examDate) return;
    const payload = {name, term:f.get("term").trim()||null, classRoomId, subjectId, examDate, maxMarks:Number(f.get("maxMarks")||100), passMarks:Number(f.get("passMarks")||40)};
    if (editingExamId){
      const ex = state.exams.find(x=>x.id===editingExamId);
      if (ex) Object.assign(ex, payload);
      cancelExamEdit();
    } else {
      state.exams.push({id:uid(), ...payload, status:"scheduled"});
      e.target.reset();
    }
    save(state); renderAll();
  });

  // ---------- EXAM RESULTS ----------
  function renderResultsView(){
    const sel = document.getElementById("resultsExamSelect");
    const prev = sel.value;
    fillSelect(sel, state.exams.slice().sort((a,b)=>b.examDate.localeCompare(a.examDate)).map(e=>({id:e.id, label:`${e.name} — ${classroomName(e.classRoomId)}`})));
    if (prev && state.exams.some(e=>e.id===prev)) sel.value = prev;
    renderResultsBody();
  }
  document.getElementById("resultsExamSelect").addEventListener("change", renderResultsBody);
  function renderResultsBody(){
    const examId = document.getElementById("resultsExamSelect").value;
    const exam = state.exams.find(e=>e.id===examId);
    const statsEl = document.getElementById("resultsStats");
    const bodyEl = document.getElementById("resultsBody");
    const publishBtn = document.getElementById("publishBtn");
    if (!exam){
      statsEl.innerHTML = ""; bodyEl.innerHTML = `<tr class="empty-row"><td colspan="3">Schedule an exam first.</td></tr>`;
      publishBtn.disabled = true; return;
    }
    const roster = studentsInClass(exam.classRoomId);
    const resultByStudent = {};
    state.examResults.filter(r=>r.examId===exam.id).forEach(r=>resultByStudent[r.studentId]=r);
    const graded = roster.filter(s=>resultByStudent[s.id] && resultByStudent[s.id].marksObtained!=null);
    const passed = graded.filter(s=>resultByStudent[s.id].marksObtained>=exam.passMarks);
    const avg = graded.length ? (graded.reduce((sum,s)=>sum+resultByStudent[s.id].marksObtained,0)/graded.length).toFixed(1) : "—";
    statsEl.innerHTML = `
      <div class="stat-card blue" style="padding:16px 18px 12px;"><div class="num" style="font-size:26px;">${graded.length}/${roster.length}</div><div class="lbl">Graded</div></div>
      <div class="stat-card green" style="padding:16px 18px 12px;"><div class="num" style="font-size:26px;">${passed.length}</div><div class="lbl">Passed</div></div>
      <div class="stat-card orange" style="padding:16px 18px 12px;"><div class="num" style="font-size:26px;">${avg}</div><div class="lbl">Class average</div></div>`;
    if (roster.length===0){ bodyEl.innerHTML = `<tr class="empty-row"><td colspan="3">No students enrolled in this class yet.</td></tr>`; publishBtn.disabled = true; return; }
    bodyEl.innerHTML = roster.map(s=>{
      const r = resultByStudent[s.id];
      const val = r && r.marksObtained!=null ? r.marksObtained : "";
      const isPass = r && r.marksObtained!=null && r.marksObtained>=exam.passMarks;
      return `<tr>
        <td style="font-weight:600;">${escapeHtml(s.name)}</td>
        <td><input type="number" min="0" max="${exam.maxMarks}" value="${val}" data-marks-student="${s.id}" style="width:80px; display:inline-block;" /> <span class="muted" style="font-size:11px;">/ ${exam.maxMarks}</span></td>
        <td>${val===""?`<span class="pill gray">Not graded</span>`:(isPass?`<span class="pill green">Pass</span>`:`<span class="pill red">Fail</span>`)}</td>
      </tr>`;
    }).join("");
    publishBtn.disabled = exam.status === "results_published";
    publishBtn.textContent = exam.status === "results_published" ? "Results published" : "Publish results";
  }
  document.getElementById("saveMarksBtn").addEventListener("click", ()=>{
    const examId = document.getElementById("resultsExamSelect").value;
    const exam = state.exams.find(e=>e.id===examId);
    if (!exam) return;
    document.querySelectorAll("[data-marks-student]").forEach(input=>{
      const studentId = input.dataset.marksStudent;
      const raw = input.value.trim();
      const marksObtained = raw===""?null:Number(raw);
      let existing = state.examResults.find(r=>r.examId===exam.id && r.studentId===studentId);
      if (existing) existing.marksObtained = marksObtained;
      else if (marksObtained!==null) state.examResults.push({id:uid(), examId:exam.id, studentId, marksObtained});
    });
    if (exam.status==="scheduled") exam.status="ongoing";
    save(state); renderResultsBody(); renderExams();
  });
  document.getElementById("publishBtn").addEventListener("click", ()=>{
    const examId = document.getElementById("resultsExamSelect").value;
    const exam = state.exams.find(e=>e.id===examId);
    if (!exam) return;
    exam.status = "results_published"; save(state); renderResultsBody(); renderExams();
  });

  // ---------- USERS ----------
  let editingUserId = null;
  function renderUsers(){
    const body = document.getElementById("usersBody");
    if (state.users.length===0){ body.innerHTML = `<tr class="empty-row"><td colspan="4">No users yet.</td></tr>`; return; }
    body.innerHTML = state.users.map(u=>`
      <tr>
        <td><span class="avatar-sm">${initials(u.name)}</span>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="pill ${u.role==="Admin"?"orange":u.role==="Teacher"?"green":"gray"}">${escapeHtml(u.role)}</span></td>
        <td style="text-align:right; white-space:nowrap;"><button class="link-btn" data-edit-user="${u.id}">Edit</button> &nbsp;·&nbsp; <button class="link-btn danger" data-del-user="${u.id}">Remove</button></td>
      </tr>`).join("");
    body.querySelectorAll("[data-del-user]").forEach(b=>b.addEventListener("click", ()=>{
      const id = b.dataset.delUser;
      state.users = state.users.filter(u=>u.id!==id);
      if (editingUserId === id) cancelUserEdit();
      save(state); renderAll();
    }));
    body.querySelectorAll("[data-edit-user]").forEach(b=>b.addEventListener("click", ()=>{
      const u = state.users.find(x=>x.id===b.dataset.editUser);
      if (!u) return;
      editingUserId = u.id;
      const f = document.getElementById("userForm");
      f.name.value = u.name||""; f.email.value = u.email||""; f.role.value = u.role||"Admin";
      document.getElementById("userSubmitBtn").textContent = "Update user";
      document.getElementById("userCancelBtn").style.display = "inline";
      f.scrollIntoView({behavior:"smooth", block:"start"});
    }));
  }
  function cancelUserEdit(){
    editingUserId = null;
    document.getElementById("userForm").reset();
    document.getElementById("userSubmitBtn").textContent = "Add user";
    document.getElementById("userCancelBtn").style.display = "none";
  }
  document.getElementById("userCancelBtn").addEventListener("click", cancelUserEdit);
  document.getElementById("userForm").addEventListener("submit", e=>{
    e.preventDefault(); const f = new FormData(e.target);
    const name = f.get("name").trim(), email = f.get("email").trim();
    if (!name||!email) return;
    const payload = {name, email, role:f.get("role")};
    if (editingUserId){
      const u = state.users.find(x=>x.id===editingUserId);
      if (u) Object.assign(u, payload);
      cancelUserEdit();
    } else {
      state.users.push({id:uid(), ...payload});
      e.target.reset();
    }
    save(state); renderAll();
  });

  // ---------- NOTICES ----------
  let editingNoticeId = null;
  const AUDIENCE_LABEL = {all:"Everyone", students:"Students", teachers:"Teachers", parents:"Parents", class:"One class"};
  function renderNotices(){
    fillSelect(document.getElementById("noticeClassSelect"), state.classRooms.map(c=>({id:c.id,label:c.name})), "—");
    const list = document.getElementById("noticesList");
    if (state.notices.length===0){ list.innerHTML = `<p class="muted" style="text-align:center; padding:40px 0; font-size:13px;">No notices posted yet.</p>`; return; }
    const sorted = state.notices.slice().sort((a,b)=>(b.pinned-a.pinned)||(b.publishedAt-a.publishedAt));
    list.innerHTML = sorted.map(n=>`
      <article class="notice ${n.pinned?"pinned":""}">
        <div class="notice-head">
          <div><h3>${n.pinned?`<span style="color:var(--orange);">●</span> `:""}${escapeHtml(n.title)}</h3>
          <div class="meta">${AUDIENCE_LABEL[n.audience]}${n.audience==="class"&&n.classRoomId?" — "+escapeHtml(classroomName(n.classRoomId)):""} · ${new Date(n.publishedAt).toLocaleDateString()}</div></div>
          <div style="white-space:nowrap;"><button class="link-btn" data-edit-notice="${n.id}">Edit</button> &nbsp;·&nbsp; <button class="link-btn danger" data-del-notice="${n.id}">Remove</button></div>
        </div>
        <p>${escapeHtml(n.body)}</p>
      </article>`).join("");
    list.querySelectorAll("[data-del-notice]").forEach(b=>b.addEventListener("click", ()=>{
      const id = b.dataset.delNotice;
      state.notices = state.notices.filter(n=>n.id!==id);
      if (editingNoticeId === id) cancelNoticeEdit();
      save(state); renderAll();
    }));
    list.querySelectorAll("[data-edit-notice]").forEach(b=>b.addEventListener("click", ()=>{
      const n = state.notices.find(x=>x.id===b.dataset.editNotice);
      if (!n) return;
      editingNoticeId = n.id;
      const f = document.getElementById("noticeForm");
      f.title.value = n.title||""; f.body.value = n.body||""; f.audience.value = n.audience||"all";
      f.classRoomId.value = n.classRoomId||""; f.pinned.checked = !!n.pinned;
      document.getElementById("noticeSubmitBtn").textContent = "Update notice";
      document.getElementById("noticeCancelBtn").style.display = "inline";
      f.scrollIntoView({behavior:"smooth", block:"start"});
    }));
  }
  function cancelNoticeEdit(){
    editingNoticeId = null;
    document.getElementById("noticeForm").reset();
    document.getElementById("noticeSubmitBtn").textContent = "Post notice";
    document.getElementById("noticeCancelBtn").style.display = "none";
  }
  document.getElementById("noticeCancelBtn").addEventListener("click", cancelNoticeEdit);
  document.getElementById("noticeForm").addEventListener("submit", e=>{
    e.preventDefault(); const f = new FormData(e.target);
    const title = f.get("title").trim(), body = f.get("body").trim();
    if (!title||!body) return;
    const audience = f.get("audience");
    const payload = {title, body, audience, classRoomId: audience==="class"?(f.get("classRoomId")||null):null, pinned: f.get("pinned")==="on"};
    if (editingNoticeId){
      const n = state.notices.find(x=>x.id===editingNoticeId);
      if (n) Object.assign(n, payload);
      cancelNoticeEdit();
    } else {
      state.notices.push({id:uid(), ...payload, publishedAt: Date.now()});
      e.target.reset();
    }
    save(state); renderAll();
  });

  function renderAll(){
    renderDashboard(); renderStudents(); renderTeachers(); renderParents(); renderSubjects();
    renderClassrooms(); renderSchedule(); renderAttendance(); renderExams(); renderResultsView(); renderUsers(); renderNotices();
  }
  renderAll();
})();
