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

const greeting = document.getElementById('greeting');
const dateLabel = document.getElementById('dateLabel');
const mobileMenu = document.querySelector('.mobile-menu');
const sidebar = document.querySelector('.sidebar');
const navItems = document.querySelectorAll('.nav-item');
const timetableKey = 'northstar-timetable';

function updateGreeting() {
  const previous = sessionStorage.getItem('northstar-greeting');
  const choices = greetings.filter((item) => item !== previous);
  const next = choices[Math.floor(Math.random() * choices.length)];
  sessionStorage.setItem('northstar-greeting', next);
  if (greeting) greeting.textContent = next;

  const formatted = new Intl.DateTimeFormat('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
  if (dateLabel) dateLabel.textContent = formatted;
}

function getClasses() {
  try {
    return JSON.parse(localStorage.getItem(timetableKey)) || [];
  } catch {
    return [];
  }
}

function saveClasses(classes) {
  localStorage.setItem(timetableKey, JSON.stringify(classes));
}

function showEmptyTimetable() {
  const list = document.querySelector('.class-list');
  if (!list) return;
  const classes = getClasses();
  list.innerHTML = '';

  if (!classes.length) {
    list.innerHTML = `
      <div class="empty-timetable">
        <div class="empty-calendar-icon">＋</div>
        <strong>No classes have been added yet</strong>
        <span>A teacher can create this student’s timetable from the Admin Portal.</span>
        <button class="empty-admin-button" type="button">Open Admin Portal</button>
      </div>`;
    list.querySelector('button').addEventListener('click', openAdminPortal);
    return;
  }

  classes.sort((a, b) => a.start.localeCompare(b.start)).forEach((item) => {
    const lesson = document.createElement('div');
    lesson.className = 'lesson';
    lesson.innerHTML = `
      <div class="lesson-time"><span>${item.start}</span><small>${item.end}</small></div>
      <div class="lesson-bar ${item.colour || 'purple'}"></div>
      <div class="lesson-details"><strong>${escapeHtml(item.subject)}</strong><span>${escapeHtml(item.room)} · ${escapeHtml(item.teacher)}</span></div>`;
    list.appendChild(lesson);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function openAdminPortal() {
  let portal = document.getElementById('adminPortal');
  if (portal) {
    portal.classList.add('visible');
    return;
  }

  portal = document.createElement('section');
  portal.id = 'adminPortal';
  portal.className = 'admin-portal';
  portal.innerHTML = `
    <div class="admin-card">
      <div class="admin-heading">
        <div><span class="admin-kicker">Teacher tools</span><h2>Admin Portal</h2><p>Edit a student’s timetable and create their classes.</p></div>
        <button class="admin-close" type="button" aria-label="Close admin portal">×</button>
      </div>
      <form id="classForm" class="class-form">
        <label>Student<select id="studentSelect"><option>Jordan Smith · Year 10A</option><option>Alex Morgan · Year 10B</option><option>Taylor Brown · Year 10A</option></select></label>
        <label>Class name<input id="subjectInput" required placeholder="e.g. Mathematics" /></label>
        <div class="form-row"><label>Start<input id="startInput" required type="time" /></label><label>End<input id="endInput" required type="time" /></label></div>
        <div class="form-row"><label>Room<input id="roomInput" required placeholder="e.g. Room 204" /></label><label>Teacher<input id="teacherInput" required placeholder="e.g. Ms. Patel" /></label></div>
        <label>Colour<select id="colourInput"><option value="purple">Purple</option><option value="blue">Blue</option><option value="orange">Orange</option><option value="pink">Pink</option></select></label>
        <div class="admin-actions"><button class="secondary-button" id="clearClasses" type="button">Clear timetable</button><button class="primary-button" type="submit">Save class</button></div>
      </form>
      <div class="admin-note">Changes are saved in this browser and appear immediately on the student timetable.</div>
    </div>`;
  document.body.appendChild(portal);
  portal.querySelector('.admin-close').addEventListener('click', () => portal.classList.remove('visible'));
  portal.querySelector('#clearClasses').addEventListener('click', () => {
    saveClasses([]);
    showEmptyTimetable();
    showToast('Timetable cleared');
  });
  portal.querySelector('#classForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const classItem = {
      subject: portal.querySelector('#subjectInput').value,
      start: portal.querySelector('#startInput').value,
      end: portal.querySelector('#endInput').value,
      room: portal.querySelector('#roomInput').value,
      teacher: portal.querySelector('#teacherInput').value,
      colour: portal.querySelector('#colourInput').value
    };
    saveClasses([...getClasses(), classItem]);
    showEmptyTimetable();
    event.target.reset();
    portal.classList.remove('visible');
    showToast(`${classItem.subject} added to Jordan’s timetable`);
  });
  portal.classList.add('visible');
}

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    navItems.forEach((button) => button.classList.remove('active'));
    item.classList.add('active');
    if (item.textContent.includes('Timetable')) showEmptyTimetable();
  });
});

mobileMenu?.addEventListener('click', () => sidebar?.classList.toggle('open'));

const adminButton = document.createElement('button');
adminButton.className = 'admin-nav-button';
adminButton.type = 'button';
adminButton.innerHTML = '<span>▣</span> Admin Portal';
adminButton.addEventListener('click', openAdminPortal);
document.querySelector('.sidebar-footer')?.prepend(adminButton);

updateGreeting();
showEmptyTimetable();
