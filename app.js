const timetableKey = 'northstar-timetables';
const studentId = 'jordan-smith';
const greetings = [
  'Good morning, Jordan',
  'How is your day going, Jordan?',
  'Ready for a great day, Jordan?',
  'Welcome back, Jordan',
  'Hope you’re having a brilliant day, Jordan',
  'Let’s make today count, Jordan',
  'Nice to see you, Jordan',
  'What will you achieve today, Jordan?',
  'Have a great day at school, Jordan',
  'You’ve got this, Jordan',
  'Here’s to a productive day, Jordan',
  'Good to have you here, Jordan'
];

const $ = (selector) => document.querySelector(selector);
const toast = $('#toast');
const sidebar = $('#sidebar');
const pageTitle = $('#pageTitle');

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function getStudentClasses() {
  try {
    const all = JSON.parse(localStorage.getItem(timetableKey)) || {};
    return Array.isArray(all[studentId]) ? all[studentId] : [];
  } catch {
    return [];
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function renderStudentTimetable() {
  const list = $('.class-list');
  if (!list) return;

  const classes = getStudentClasses().sort((a, b) => `${a.day}${a.start}`.localeCompare(`${b.day}${b.start}`));
  if (!classes.length) {
    list.innerHTML = '<div class="empty-timetable"><div class="empty-calendar-icon">＋</div><strong>No classes have been added yet</strong><span>A teacher can create this student’s timetable from the separate Admin Portal.</span><a class="empty-admin-button" href="admin.html">Open Admin Portal</a></div>';
    return;
  }

  list.innerHTML = classes.map((item) => `
    <div class="class ${item.day === 'Monday' ? 'current' : ''}">
      <div class="time">${escapeHtml(item.start)}<br><small>${escapeHtml(item.end)}</small></div>
      <div class="class-line ${escapeHtml(item.colour || 'purple')}"></div>
      <div class="class-info"><strong>${escapeHtml(item.subject)}</strong><span>${escapeHtml(item.room)} · ${escapeHtml(item.teacher)} · ${escapeHtml(item.day)}</span></div>
    </div>`).join('');
}

function updateGreeting() {
  const greeting = $('#greeting') || document.querySelector('.welcome-row h1');
  const dateLabel = $('#dateLabel') || document.querySelector('.eyebrow');
  if (greeting) {
    const previous = sessionStorage.getItem('northstar-greeting');
    const choices = greetings.filter((item) => item !== previous);
    const next = choices[Math.floor(Math.random() * choices.length)];
    sessionStorage.setItem('northstar-greeting', next);
    if (greeting.id === 'greeting') greeting.textContent = next;
    else greeting.innerHTML = `${escapeHtml(next)} <span>✦</span>`;
  }
  if (dateLabel) dateLabel.textContent = new Intl.DateTimeFormat('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
}

function selectSection(section) {
  document.querySelectorAll('.nav-item[data-section]').forEach((item) => item.classList.toggle('active', item.dataset.section === section));
  if (pageTitle) pageTitle.textContent = section;
  if (section !== 'Overview') showToast(`${section} view is ready to explore ✦`);
  sidebar?.classList.remove('open');
}

document.querySelectorAll('[data-section]').forEach((item) => item.addEventListener('click', () => selectSection(item.dataset.section)));
$('#menuButton')?.addEventListener('click', () => sidebar?.classList.toggle('open'));
$('#calendarButton')?.addEventListener('click', () => showToast('Calendar action ready ✦'));
$('.notification')?.addEventListener('click', () => showToast('You have 3 new notices'));
window.addEventListener('storage', renderStudentTimetable);

updateGreeting();
renderStudentTimetable();
