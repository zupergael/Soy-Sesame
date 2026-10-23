'use strict';

const $ = selector => document.querySelector(selector);
function syncThemeToggle() {
  const light = document.documentElement.dataset.theme === 'light';
  $('#theme-toggle').setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
  $('#theme-icon').textContent = light ? '☾' : '☀';
}
$('#theme-toggle').addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('soy-sesame-theme', theme); } catch (err) { console.warn('Theme storage unavailable:', err); }
  syncThemeToggle();
});
syncThemeToggle();
const forms = [...document.querySelectorAll('form')];
const STORAGE_KEY = 'soy-sesame-forms-v1';
// Table IDs and capacities follow the supplied branch posters. S tables are not reservable.
const BRANCH_TABLES = {
  'Padre Campa': [
    {id:'A2',capacity:6},{id:'A3',capacity:6},
    {id:'B2',capacity:6},{id:'B3',capacity:4},
    {id:'C1',capacity:5},{id:'C2',capacity:5},
    {id:'D1',capacity:4},{id:'D2',capacity:4},{id:'D3',capacity:4}
  ],
  'S.H. Loyola': [
    {id:'A1',capacity:6},{id:'A2',capacity:6},
    {id:'A3',capacity:4},{id:'A4',capacity:4},{id:'A5',capacity:4},
    {id:'B1',capacity:4},{id:'B2',capacity:4},{id:'B3',capacity:4},
    {id:'C1',capacity:5},{id:'C2',capacity:5}
  ]
};
const BRANCH_LAYOUTS = {'Padre Campa':'assets/p-campa-tables.png','S.H. Loyola':'assets/sh-loyola-tables.png'};
let state = { reservations: [], accounts: [] };
let report = null;
let storageAvailable = true;

function announce(message, error = false) {
  const box = $('#notice');
  box.textContent = message;
  box.classList.toggle('error', error);
  box.hidden = false;
}
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && Array.isArray(saved.reservations) && Array.isArray(saved.accounts)) state = saved;
} catch (_) {
  storageAvailable = false;
  announce('Browser storage is unavailable or unreadable. Records will remain in memory for this session.', true);
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; return true; }
  catch (_) { storageAvailable = false; return false; }
}
function dateString(offset = 0) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get = type => parts.find(p => p.type === type).value;
  const date = new Date(`${get('year')}-${get('month')}-${get('day')}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0,10);
}
function refreshDates() { $('#r-date').min = dateString(); $('#r-date').max = dateString(21); }
function setReportDates() { $('#p-start').value = dateString(); $('#p-end').value = dateString(21); }
const bookingStatus = r => r.status || (r.expiresAt > Date.now() ? 'Pending payment' : 'Expired');
const isTableOccupied = (r, branch, date, tableId) =>
  r.branch === branch &&
  r.date === date &&
  r.table === tableId &&
  r.status !== 'Cancelled' &&
  r.expiresAt > Date.now();
const dataOf = form => Object.fromEntries(new FormData(form));
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => el.remove());
  [...form.elements].forEach(el => {
    if (!el.setCustomValidity) return;
    el.setCustomValidity(''); el.removeAttribute('aria-invalid');
    const descriptions = (el.getAttribute('aria-describedby') || '').split(' ').filter(id => id && !id.endsWith('-error'));
    if (descriptions.length) el.setAttribute('aria-describedby', descriptions.join(' '));
    else el.removeAttribute('aria-describedby');
  });
}
function validate(form, custom = () => {}) {
  clearErrors(form);
  [...form.elements].forEach(el => {
    if (['text','email'].includes(el.type)) el.value = el.value.trim();
    if (el.type === 'tel') el.value = el.value.trim().replace(/[\s-]/g, '');
  });
  custom();
  let first;
  [...form.elements].forEach(el => {
    if (!el.willValidate || el.validity.valid) return;
    const error = document.createElement('p');
    error.id = `${el.id}-error`; error.className = 'field-error';
    error.textContent = el.validity.valueMissing ? 'Please complete this required field.' : el.validationMessage;
    if (el.id === 'r-phone' && el.validity.patternMismatch) error.textContent = 'Enter 09 followed by 9 digits, or +639 followed by 9 digits.';
    el.closest('.field').append(error);
    el.setAttribute('aria-invalid','true');
    el.setAttribute('aria-describedby', `${el.getAttribute('aria-describedby') || ''} ${error.id}`.trim());
    first ||= el;
  });
  if (first) { first.focus(); announce('Please correct the highlighted fields before submitting.', true); return false; }
  return true;
}
function validateRange(form, maxDays = null) {
  const {start, end} = form.elements;
  if (!start.value || !end.value) return;
  if (start.value > end.value) {
    end.setCustomValidity('The end date must be on or after the start date.');
    return;
  }
  if (maxDays) {
    const diffDays = (new Date(end.value) - new Date(start.value)) / (1000 * 60 * 60 * 24);
    if (diffDays > maxDays) end.setCustomValidity(`The date range cannot exceed ${maxDays} days.`);
  }
}
function refreshTables() {
  refreshDates();
  const branch = $('#r-branch').value, date = $('#r-date').value, guests = Number($('#r-guests').value) || 1;
  const layout = BRANCH_LAYOUTS[branch];
  $('#branch-layout-link').hidden = !layout;
  $('#branch-layout-title').textContent = layout ? `${branch} table layout` : 'Your branch, at a glance.';
  $('#branch-layout-help').textContent = layout ? 'Open the layout to view table locations and posted rates. S tables cannot be reserved.' : 'Select a branch to view its table layout.';
  if (layout) {
    $('#branch-layout-link').href = layout;
    $('#branch-layout-link').setAttribute('aria-label', `View ${branch} table layout (opens in a new tab)`);
    $('#branch-layout-image').src = layout;
    $('#branch-layout-image').alt = `${branch} floor plan and fully consumable table rates supplied by Soy & Sesame`;
  }
  const select = $('#r-table'), previous = select.value;
  select.replaceChildren(new Option(branch && date ? 'Choose an available table' : 'Choose branch and date first',''));
  if (!branch || !date) return;
  (BRANCH_TABLES[branch] || []).forEach(table => {
    const occupied = state.reservations.some(r => isTableOccupied(r, branch, date, table.id));
    const option = new Option(`${table.id} · ${table.capacity} seats${occupied ? ' · held' : table.capacity < guests ? ' · too small' : ''}`, table.id);
    option.disabled = occupied || table.capacity < guests;
    select.add(option);
    if (option.value === previous && !option.disabled) option.selected = true;
  });
}
['#r-branch','#r-date','#r-guests'].forEach(id => $(id).addEventListener('input', refreshTables));
$('#reservation-form').addEventListener('submit', event => {
  event.preventDefault(); refreshDates();
  const form = event.currentTarget;
  if (!validate(form, () => {
    const f = form.elements;
    const minDate = dateString(0), maxDate = dateString(21);
    if (f.date.value && (f.date.value < minDate || f.date.value > maxDate)) f.date.setCustomValidity(`Please choose a date between ${minDate} and ${maxDate}.`);
    const selected = (BRANCH_TABLES[f.branch.value] || []).find(t => t.id === f.table.value);
    if (!selected && f.table.value) f.table.setCustomValidity('Choose a table belonging to this branch.');
    if (selected && selected.capacity < Number(f.guests.value)) f.table.setCustomValidity('Choose a table with enough seats.');
    if (state.reservations.some(r => isTableOccupied(r, f.branch.value, f.date.value, f.table.value))) f.table.setCustomValidity('This table is currently held. Please choose another table.');
  })) return;
  const data = dataOf(form);
  const reservation = {id:`SS-${crypto.randomUUID().slice(0,8).toUpperCase()}`,branch:data.branch,date:data.date,guests:Number(data.guests),table:data.table,name:data.name,email:data.email,phone:data.phone,notes:data.notes.trim(),marketing:data.marketing === 'on',createdAt:Date.now(),expiresAt:Date.now()+15*60*1000};
  state.reservations.push(reservation);
  const saved = persist();
  form.reset(); refreshTables(); renderSearch(); invalidateReport();
  announce(`Reservation ${reservation.id} saved${saved ? ' in this browser' : ' for this session only (storage unavailable)'}. Pending payment: the table hold expires in 15 minutes. No payment or confirmation email was sent.`);
  $('#notice').scrollIntoView({behavior:'smooth',block:'start'});
});
$('#account-form').addEventListener('submit', event => {
  event.preventDefault(); const form = event.currentTarget;
  if (!validate(form, () => {
    const f = form.elements;
    if (f.password.value !== f.confirm.value) f.confirm.setCustomValidity('The passwords must match.');
    if (f.password.value) {
      const pwd = f.password.value;
      const hasNonWhitespace = /\S/.test(pwd);
      const hasComplexity = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(re => re.test(pwd)).length >= 2;
      if (pwd.length < 12 || !hasNonWhitespace || !hasComplexity) f.password.setCustomValidity('Use at least 12 characters with a mix of letters, numbers, or symbols.');
    }
    if (state.accounts.some(a => a.email.toLowerCase() === f.email.value.toLowerCase() && a.id !== f.namedItem('accountId').value)) f.email.setCustomValidity('An account already uses this email address.');
    const isAdmin = f.role.value === 'System Administrator / Owner';
    if (f.branch.value === 'Both branches' && !isAdmin) f.branch.setCustomValidity('Staff and branch managers must be assigned to one branch.');
  })) return;
  const data = dataOf(form), editing = Boolean(data.accountId);
  const account = {id:data.accountId || crypto.randomUUID(),first:data.first,last:data.last,email:data.email,role:data.role,branch:data.branch,status:data.status};
  const index = state.accounts.findIndex(a => a.id === account.id);
  if (index >= 0) state.accounts[index] = account; else state.accounts.push(account);
  const saved = persist(); form.reset(); renderAccounts();
  announce(`Staff profile ${editing ? 'updated' : 'created'}${saved ? ' in this browser' : ' for this session only (storage unavailable)'}. Passwords are not stored; sign-in access is not enabled.`);
});
function renderAccounts() {
  const area = $('#account-results');
  if (!state.accounts.length) { area.innerHTML = '<p class="empty">No staff profiles yet. Add your first account using the form above.</p>'; return; }
  area.innerHTML = `<table><caption class="muted">${state.accounts.length} staff profile(s)</caption><thead><tr><th scope="col">Name</th><th scope="col">Role</th><th scope="col">Branch</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead><tbody>${state.accounts.map(a => `<tr><td>${escapeHTML(a.first)} ${escapeHTML(a.last)}<small>${escapeHTML(a.email)}</small></td><td>${escapeHTML(a.role)}</td><td>${escapeHTML(a.branch)}</td><td>${escapeHTML(a.status)}</td><td><button type="button" class="secondary" data-edit="${escapeHTML(a.id)}" aria-label="Edit ${escapeHTML(a.first)} ${escapeHTML(a.last)}">Edit</button></td></tr>`).join('')}</tbody></table>`;
}
$('#account-results').addEventListener('click', event => {
  const button = event.target.closest('[data-edit]'); if (!button) return;
  const account = state.accounts.find(a => a.id === button.dataset.edit); if (!account) return;
  const form = $('#account-form'); form.reset();
  Object.entries(account).forEach(([key,value]) => {
    const control = form.elements.namedItem(key === 'id' ? 'accountId' : key);
    if (control) control.value = value;
  });
  $('#a-password').required = false; $('#a-confirm').required = false;
  $('#account-form-title').textContent = `Edit ${account.first}’s account`; $('#a-first').focus();
});
function filteredReservations(filters) {
  const rows = state.reservations.filter(r =>
    (!filters.query || `${r.name} ${r.email}`.toLowerCase().includes(filters.query.toLowerCase())) &&
    (!filters.reference || r.id.toLowerCase().includes(filters.reference.toLowerCase())) &&
    (!filters.branch || r.branch === filters.branch) &&
    (!filters.start || r.date >= filters.start) && (!filters.end || r.date <= filters.end) &&
    (!filters.status || bookingStatus(r) === filters.status) && (!filters.minGuests || r.guests >= Number(filters.minGuests)));
  rows.sort((a,b) => filters.sort === 'name' ? a.name.localeCompare(b.name) : filters.sort === 'date-desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  return rows;
}
function reservationTable(rows) {
  if (!rows.length) return '<p class="empty">No matching records. Try another date range or save a reservation first.</p>';
  return `<table><thead><tr><th scope="col">Reference / Guest</th><th scope="col">Branch</th><th scope="col">Date</th><th scope="col">Table</th><th scope="col">Guests</th><th scope="col">Status</th></tr></thead><tbody>${rows.map(r => `<tr><td>${escapeHTML(r.id)}<small>${escapeHTML(r.name)}</small></td><td>${escapeHTML(r.branch)}</td><td>${escapeHTML(r.date)}</td><td>${escapeHTML(r.table)}</td><td>${escapeHTML(r.guests)}</td><td><span class="status">${escapeHTML(r.status || bookingStatus(r))}</span></td></tr>`).join('')}</tbody></table>`;
}
function renderSearch() {
  const rows = filteredReservations(dataOf($('#search-form')));
  $('#search-count').textContent = `${rows.length} reservation${rows.length === 1 ? '' : 's'} found`;
  $('#search-results').innerHTML = reservationTable(rows);
}
$('#search-form').addEventListener('submit', event => { event.preventDefault(); if (validate(event.currentTarget, () => validateRange(event.currentTarget))) { renderSearch(); announce('Search results updated.'); } });
function invalidateReport() {
  report = null; $('#export-report').disabled = true;
  $('#report-preview').innerHTML = '<h2>Your report preview</h2><p class="empty">Choose your filters and generate a report to get started.</p>';
}
$('#report-form').addEventListener('input', invalidateReport);
$('#report-form').addEventListener('submit', event => {
  event.preventDefault(); const form = event.currentTarget;
  if (!validate(form, () => validateRange(form, 90))) return;
  const filters = dataOf(form);
  const rows = filters.category === 'reservations' ? filteredReservations(filters).map(r => ({...r,status:bookingStatus(r)})) : [];
  report = {filters,rows,generated:new Intl.DateTimeFormat('en-PH',{timeZone:'Asia/Manila',dateStyle:'medium',timeStyle:'short'}).format(new Date())};
  $('#report-preview').innerHTML = `<p class="eyebrow">SOY & SESAME · REPORT</p><h2>${escapeHTML(filters.title)}</h2><p class="muted">${escapeHTML(filters.branch || 'All branches')} · ${escapeHTML(filters.start)} to ${escapeHTML(filters.end)} · ${escapeHTML(filters.status || 'All statuses')}<br>Generated ${escapeHTML(report.generated)} (Manila time)</p><div class="report-stats"><div><strong>${rows.length}</strong><span>Records</span></div>${filters.category === 'reservations' ? `<div><strong>${rows.reduce((total,r) => total+r.guests,0)}</strong><span>Total guests</span></div>` : ''}</div><div class="table-wrap">${filters.category === 'reservations' ? reservationTable(rows) : '<p class="empty">No '+escapeHTML(filters.category)+' data is available. No payment transactions or POS sales have been recorded.</p>'}</div><p class="muted">Generated from records saved in this browser. Not an official financial statement.</p>`;
  $('#export-report').disabled = false; announce('Report generated. You can now export the preview.');
});
// Prefix spreadsheet formulas to prevent user-entered text being evaluated on CSV open.
function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g,'""') + '"';
}
$('#export-report').addEventListener('click', () => {
  if (!report) return;
  if (report.filters.format === 'pdf') { window.print(); return; }
  const data = [['Report',report.filters.title],['Category',report.filters.category],['Branch',report.filters.branch || 'All branches'],['Period',report.filters.start,report.filters.end],['Generated (Manila)',report.generated],[],['Reference','Guest','Branch','Date','Table','Guests','Status'],...report.rows.map(r => [r.id,r.name,r.branch,r.date,r.table,r.guests,r.status])];
  const blob = new Blob(['\uFEFF'+data.map(row => row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = `soy-sesame-${report.filters.category}-${dateString()}.csv`; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url),1000); announce('Your CSV report has been downloaded.');
});
forms.forEach(form => form.addEventListener('reset', () => {
  clearErrors(form);
  if (form.matches('#account-form')) {
    form.elements.namedItem('accountId').value = ''; $('#a-password').required = true; $('#a-confirm').required = true; $('#account-form-title').textContent = 'Add staff account';
  }
  setTimeout(() => {
    if (form.matches('#reservation-form')) refreshTables();
    if (form.matches('#search-form')) renderSearch();
    if (form.matches('#report-form')) {setReportDates(); invalidateReport();}
  },0);
}));
function showPage(id, focus = false) {
  if (!['reservation','accounts','search','reports'].includes(id)) id = 'reservation';
  document.querySelectorAll('.page').forEach(page => page.hidden = page.id !== id);
  document.querySelectorAll('[data-page]').forEach(button => {
    if (button.dataset.page === id) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
  });
  $('#notice').hidden = storageAvailable;
  if (id === 'search') renderSearch(); if (id === 'accounts') renderAccounts(); if (id === 'reservation') refreshTables();
  if (focus) { const title = document.querySelector(`#${id} h1`); title.setAttribute('tabindex','-1'); title.focus(); }
}
document.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => { location.hash = button.dataset.page; }));
window.addEventListener('hashchange', () => showPage(location.hash.slice(1),true));
window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY) return;
  try {
    const next = JSON.parse(event.newValue);
    if (next && Array.isArray(next.reservations) && Array.isArray(next.accounts)) {
      state = next; refreshTables(); renderAccounts(); renderSearch(); invalidateReport();
    }
  } catch (err) {
    console.warn('Storage sync failed for external changes:', err);
  }
});
refreshDates(); setReportDates(); refreshTables(); renderAccounts(); renderSearch(); showPage(location.hash.slice(1));
