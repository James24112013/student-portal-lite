const DB = 'northstar-db';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function readDb() {
  try {
    const value = JSON.parse(localStorage.getItem(DB));
    return value && Array.isArray(value.students) ? value : { students: [], teachers: [], timetables: {} };
  } catch {
    return { students: [], teachers: [], timetables: {} };
  }
}

let db = readDb();
let currentStudent = null;
let toastTimer;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>\"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function showToast(message) {
  const element = $('#toast');
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove('show'), 2600);
}

function closeModal() {
  $('#actionModal')?.remove();
}

function openModal(title, content, className = '') {
  closeModal();
  const modal = document.createElement('div');
  modal.id = 'actionModal';
  modal.className = `action-modal ${className}`;
  modal.innerHTML = `<div class="action-dialog" role="dialog" aria-modal="true" aria-labelledby="actionTitle"><div class="action-dialog-header"><div><p class="section-kicker">NORTHSTAR</p><h2 id="actionTitle">${escapeHtml(title)}</h2></div><button class="modal-close" aria-label="Close">×</button></div><div class="action-dialog-body">${content}</div></div>`;
  document.body.appendChild(modal);
  $('.modal-close', modal).addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  return modal;
}

function renderTimetable() {
  const list = $('#classList');
  if (!list || !currentStudent) return;
  const classes = (db.timetables?.[currentStudent.id] || currentStudent.classes || []).slice().sort((a, b) => `${a.day}${a.start}`.localeCompare(`${b.day}${b.start}`));
  if (!classes.length) {
    list.innerHTML = '<div class="empty-timetable"><div class="empty-calendar-icon">＋</div><strong>No classes have been added yet</strong><span>Your teacher can add classes from the Teacher Portal.</span></div>';
    return;
  }
  list.innerHTML = classes.map((item) => `<button class="lesson lesson-button" type="button" data-class-id="${escapeHtml(item.id)}"><span class="lesson-time"><b>${escapeHtml(item.start)}</b><small>${escapeHtml(item.end)}</small></span><span class="lesson-bar ${escapeHtml(item.colour || 'purple')}"></span><span class="lesson-details"><strong>${escapeHtml(item.subject)}</strong><span>${escapeHtml(item.room)} · ${escapeHtml(item.teacher)} · ${escapeHtml(item.day)}</span></span><span class="lesson-arrow">›</span></button>`).join('');
}

function renderStudent(student) {
  currentStudent = student;
  $('#studentLogin')?.setAttribute('hidden', '');
  $('#portalApp')?.removeAttribute('hidden');
  const initials = student.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  $('#sideName').textContent = student.name;
  $('#sideDetails').textContent = `${student.year || 'Student'} · ${student.house || 'No house'}`;
  $('#sideInitials').textContent = initials;
  $('#topInitials').textContent = initials;
  $('#greeting').textContent = `Welcome back, ${student.name.split(' ')[0]}`;
  $('#dateLabel').textContent = new Intl.DateTimeFormat('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  renderTimetable();
}

function openMessages() {
  const modal = openModal('Direct messages', '<div class="message-thread"><div class="message received">Hi Jordan — remember to bring your calculator tomorrow.</div><div class="message sent">Thanks, I’ll remember!</div></div><form class="message-compose"><input required placeholder="Write a message..." aria-label="Write a message"><button class="primary-button" type="submit">Send</button></form>', 'messages-modal-content');
  $('.message-compose', modal).addEventListener('submit', (event) => {
    event.preventDefault();
    const input = $('input', event.currentTarget);
    const message = input.value.trim();
    if (!message) return;
    const bubble = document.createElement('div');
    bubble.className = 'message sent';
    bubble.textContent = message;
    $('.message-thread', modal).appendChild(bubble);
    input.value = '';
    showToast('Message sent');
  });
}

function selectSection(section) {
  $$('.nav-item[data-section]').forEach((item) => item.classList.toggle('active', item.dataset.section === section));
  $('#pageTitle').textContent = section === 'Overview' ? 'Dashboard' : section;
  $('#sidebar')?.classList.remove('open');
  if (section === 'Timetable') $('#classList')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  else if (section === 'Direct messages') openMessages();
  else showToast(`${section} opened`);
}

function runAction(action) {
  if (action === 'calendar') openModal('Add to calendar', '<p class="modal-copy">Choose a date and time for your event.</p><div class="modal-form-grid"><label>Event<input value="Study session"></label><label>Date<input type="date"></label><label>Time<input type="time"></label></div><button class="primary-button modal-save" type="button">Save event</button>');
  if (action === 'search') openModal('Search Northstar', '<form class="search-form"><input autofocus placeholder="Search timetable, notices or courses"><button class="primary-button">Search</button></form><p class="modal-copy">Search is ready to use on this device.</p>');
  if (action === 'notifications') openModal('Notifications', '<div class="notification-row"><b>3 new notices</b><span>Winter concert auditions, science trip and library hours.</span></div><div class="notification-row"><b>Timetable updated</b><span>Your teacher may have added a new class.</span></div>');
  if (action === 'grades') openModal('All results', '<div class="result-row"><b>Mathematics</b><strong class="result-good">A</strong></div><div class="result-row"><b>English</b><strong class="result-warn">B+</strong></div><div class="result-row"><b>Biology</b><strong class="result-good">A-</strong></div>');
  if (action === 'notice') openModal('Notice details', '<h3>Winter concert auditions</h3><p class="modal-copy">Auditions are open to Year 10 students. Speak with Student Life for times and locations.</p>');
  if (action === 'save-event') { closeModal(); showToast('Event added to your calendar'); }
}

document.addEventListener('click', (event) => {
  const section = event.target.closest('[data-section]');
  if (section) { event.preventDefault(); selectSection(section.dataset.section); return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action) { event.preventDefault(); runAction(action); return; }
  if (event.target.closest('#menuButton')) { $('#sidebar')?.classList.toggle('open'); return; }
  if (event.target.closest('.logout-button')) { sessionStorage.removeItem('northstar-student'); location.reload(); return; }
  const classButton = event.target.closest('[data-class-id]');
  if (classButton) showToast('Class details opened');
  if (event.target.closest('.modal-save')) runAction('save-event');
});

document.addEventListener('submit', (event) => {
  if (event.target.matches('.search-form')) {
    event.preventDefault();
    showToast(`Searching for “${$('input', event.target).value.trim() || 'everything'}”`);
    closeModal();
  }
});

$('#studentLoginForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  db = readDb();
  const email = $('#studentEmail').value.trim().toLowerCase();
  const student = db.students.find((item) => String(item.email).toLowerCase() === email);
  if (!student) { showToast('That email is not registered. Ask your administrator.'); return; }
  sessionStorage.setItem('northstar-student', JSON.stringify({ id: student.id }));
  renderStudent(student);
});

try {
  const saved = JSON.parse(sessionStorage.getItem('northstar-student') || 'null');
  if (saved) {
    const student = db.students.find((item) => item.id === saved.id);
    if (student) renderStudent(student);
  }
} catch { sessionStorage.removeItem('northstar-student'); }
