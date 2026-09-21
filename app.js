const toast = document.getElementById('toast');
const sidebar = document.getElementById('sidebar');
const pageTitle = document.getElementById('pageTitle');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(window.toastTimer);
  window.toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function selectSection(section) {
  document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.classList.toggle('active', item.dataset.section === section);
  });
  pageTitle.textContent = section;
  if (section !== 'Overview') {
    showToast(`${section} view is ready to explore ✦`);
  }
  sidebar.classList.remove('open');
}

document.querySelectorAll('[data-section]').forEach(item => {
  item.addEventListener('click', () => selectSection(item.dataset.section));
});

document.getElementById('menuButton').addEventListener('click', () => sidebar.classList.toggle('open'));
document.getElementById('calendarButton').addEventListener('click', () => showToast('Calendar action ready ✦'));
document.querySelector('.notification').addEventListener('click', () => showToast('You have 3 new notices'));
