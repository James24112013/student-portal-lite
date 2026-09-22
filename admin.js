const students = [
  { id: 'jordan-smith', name: 'Jordan Smith', year: 'Year 10 · 10A' },
  { id: 'alex-morgan', name: 'Alex Morgan', year: 'Year 10 · 10B' },
  { id: 'taylor-brown', name: 'Taylor Brown', year: 'Year 10 · 10A' }
];
const storageKey = 'northstar-timetables';
let selectedStudent = students[0].id;

const $ = (selector) => document.querySelector(selector);
const getAll = () => { try { return JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { return {}; } };
const saveAll = (data) => localStorage.setItem(storageKey, JSON.stringify(data));
const initials = (name) => name.split(' ').map((part) => part[0]).join('');
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));

function notify(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function renderStudents() {
  const data = getAll();
  $('#studentList').innerHTML = students.map((student) => {
    const count = (data[student.id] || []).length;
    return `<button class="student-card ${student.id === selectedStudent ? 'selected' : ''}" data-student="${student.id}"><span class="student-avatar">${initials(student.name)}</span><span><b>${student.name}</b><small>${student.year}</small></span><span class="class-total">${count} classes</span></button>`;
  }).join('');
  document.querySelectorAll('[data-student]').forEach((button) => button.addEventListener('click', () => {
    selectedStudent = button.dataset.student;
    render();
  }));
}

function renderClasses() {
  const student = students.find((item) => item.id === selectedStudent);
  const classes = getAll()[selectedStudent] || [];
  $('#selectedStudentTitle').textContent = `${student.name} · ${student.year}`;
  if (!classes.length) {
    $('#classTable').innerHTML = '<div class="empty">No classes assigned to this student yet.</div>';
    return;
  }
  const rows = classes.slice().sort((a, b) => `${a.day}${a.start}`.localeCompare(`${b.day}${b.start}`));
  $('#classTable').innerHTML = `<div class="class-row header"><span>Day / time</span><span>Subject</span><span>Room / teacher</span><span>Colour</span><span></span></div>` + rows.map((item) => `<div class="class-row"><span>${escapeHtml(item.day)}<br>${escapeHtml(item.start)}–${escapeHtml(item.end)}</span><b>${escapeHtml(item.subject)}</b><span>${escapeHtml(item.room)}<br>${escapeHtml(item.teacher)}</span><span><i class="colour-pill ${item.colour}"></i></span><button class="remove-button" data-remove="${item.id}">Remove</button></div>`).join('');
  document.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => removeClass(button.dataset.remove)));
}

function render() { renderStudents(); renderClasses(); }

function removeClass(id) {
  const all = getAll();
  all[selectedStudent] = (all[selectedStudent] || []).filter((item) => item.id !== id);
  saveAll(all); render(); notify('Class removed');
}

$('#classForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const all = getAll();
  const item = { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), subject: $('#subject').value.trim(), day: $('#day').value, start: $('#start').value, end: $('#end').value, room: $('#room').value.trim(), teacher: $('#teacher').value.trim(), colour: $('#colour').value };
  all[selectedStudent] = [...(all[selectedStudent] || []), item];
  saveAll(all); event.target.reset(); render(); notify(`${item.subject} added to the timetable`);
});

$('#clearButton').addEventListener('click', () => {
  if (!confirm('Clear every class for this student?')) return;
  const all = getAll(); all[selectedStudent] = []; saveAll(all); render(); notify('Timetable cleared');
});

render();
