const timetableKey = 'northstar-timetables';
const studentId = 'jordan-smith';
const greetings = ['Good morning, Jordan', 'How is your day going, Jordan?', 'Ready for a great day, Jordan?', 'Welcome back, Jordan', 'Hope you’re having a brilliant day, Jordan', 'Let’s make today count, Jordan', 'Nice to see you, Jordan', 'What will you achieve today, Jordan?', 'Have a great day at school, Jordan', 'You’ve got this, Jordan', 'Here’s to a productive day, Jordan', 'Good to have you here, Jordan'];
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
  } catch { return []; }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function renderStudentTimetable() {
  const list = $('.class-list');
  if (!list) return;
  const classes = getStudentClasses().slice().sort((a, b) => `${a.day}${a.start}`.localeCompare(`${b.day}${b.start}`));
  if (!classes.length) {
    list.innerHTML = '<div class="empty-timetable"><div class="empty-calendar-icon">＋</div><strong>No classes have been added yet</strong><span>A teacher can create this student’s timetable from the separate Admin Portal.</span><a class="empty-admin-button" href="admin.html">Open Admin Portal</a></div>';
    return;
  }
  list.innerHTML = classes.map((item) => `<div class="class ${item.day === 'Monday' ? 'current' : ''}"><div class="time">${escapeHtml(item.start)}<br><small>${escapeHtml(item.end)}</small></div><div class="class-line ${escapeHtml(item.colour || 'purple')}"></div><div class="class-info"><strong>${escapeHtml(item.subject)}</strong><span>${escapeHtml(item.room)} · ${escapeHtml(item.teacher)} · ${escapeHtml(item.day)}</span></div></div>`).join('');
}

function updateGreeting() {
  const heading = $('#greeting') || document.querySelector('.welcome-row h1');
  const date = $('#dateLabel') || document.querySelector('.eyebrow');
  if (heading) {
    const previous = sessionStorage.getItem('northstar-greeting');
    const choices = greetings.filter((item) => item !== previous);
    const next = choices[Math.floor(Math.random() * choices.length)];
    sessionStorage.setItem('northstar-greeting', next);
    heading.id ? heading.textContent = next : heading.innerHTML = `${escapeHtml(next)} <span>✦</span>`;
  }
  if (date) date.textContent = new Intl.DateTimeFormat('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
}

function selectSection(section) {
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.section === section || item.textContent.trim().startsWith(section)));
  if (pageTitle) pageTitle.textContent = section;
  sidebar?.classList.remove('open');
  if (section === 'Timetable') document.querySelector('.today-panel')?.scrollIntoView({ behavior: 'smooth' });
  else if (section === 'Grades') document.querySelector('.metric-card')?.scrollIntoView({ behavior: 'smooth' });
  else if (section === 'Calendar') document.querySelector('.date-stack')?.scrollIntoView({ behavior: 'smooth' });
  else if (section !== 'Overview') showToast(`${section} is ready to explore ✦`);
}

function openDirectMessages() {
  let modal = $('#messagesModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'messagesModal';
    modal.className = 'messages-modal';
    modal.innerHTML = `<div class="messages-card" role="dialog" aria-modal="true"><div class="messages-header"><div><p>COMMUNICATION</p><h2>Direct messages</h2></div><button class="messages-close" aria-label="Close messages">×</button></div><div class="messages-layout"><div class="messages-contacts"><button class="message-contact active"><span class="message-avatar purple">MP</span><span><b>Ms. Patel</b><small>Mathematics teacher</small></span></button><button class="message-contact"><span class="message-avatar blue">WO</span><span><b>Year 10 Office</b><small>School administration</small></span></button><button class="message-contact"><span class="message-avatar orange">MC</span><span><b>Mr. Chen</b><small>Science teacher</small></span></button></div><div class="conversation"><div class="conversation-top"><b>Ms. Patel</b><small>Mathematics teacher</small></div><div class="message-history"><div class="received">Hi Jordan — remember to bring your calculator tomorrow.</div><div class="sent">Thanks Ms. Patel, I’ll remember!</div></div><form class="message-form"><input required placeholder="Write a message..." aria-label="Message"><button type="submit">Send</button></form></div></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('.messages-close').addEventListener('click', () => modal.classList.remove('visible'));
    modal.addEventListener('click', (event) => { if (event.target === modal) modal.classList.remove('visible'); });
    modal.querySelector('.message-form').addEventListener('submit', (event) => { event.preventDefault(); const input = event.target.querySelector('input'); const text = input.value.trim(); if (!text) return; const bubble = document.createElement('div'); bubble.className = 'sent'; bubble.textContent = text; modal.querySelector('.message-history').appendChild(bubble); input.value = ''; showToast('Message sent'); });
    modal.querySelectorAll('.message-contact').forEach((contact) => contact.addEventListener('click', () => { modal.querySelectorAll('.message-contact').forEach((item) => item.classList.remove('active')); contact.classList.add('active'); showToast(`Conversation opened with ${contact.querySelector('b').textContent}`); }));
  }
  modal.classList.add('visible');
}

function addDirectMessagesNav() {
  const nav = document.querySelector('.main-nav');
  if (!nav || nav.querySelector('[data-section="Direct messages"]')) return;
  const button = document.createElement('button');
  button.className = 'nav-item'; button.dataset.section = 'Direct messages'; button.innerHTML = '<span class="nav-icon">✉</span><span>Direct messages</span><span class="nav-badge">1</span>';
  button.addEventListener('click', () => { selectSection('Direct messages'); openDirectMessages(); });
  nav.appendChild(button);
}

function bindButtons() {
  document.querySelectorAll('[data-section]').forEach((item) => item.addEventListener('click', () => selectSection(item.dataset.section)));
  $('#menuButton')?.addEventListener('click', () => sidebar?.classList.toggle('open'));
  $('#calendarButton')?.addEventListener('click', () => showToast('Calendar action ready ✦'));
  $('.notification')?.addEventListener('click', () => showToast('You have 3 new notices'));
  document.querySelectorAll('.primary-button:not(#calendarButton), .text-link').forEach((button) => button.addEventListener('click', () => showToast(`${button.textContent.trim()} selected`)));
  document.querySelectorAll('.notice-item').forEach((item) => item.addEventListener('click', () => showToast(`${item.querySelector('strong')?.textContent || 'Notice'} opened`)));
}

window.addEventListener('storage', renderStudentTimetable);
addDirectMessagesNav(); bindButtons(); updateGreeting(); renderStudentTimetable();
