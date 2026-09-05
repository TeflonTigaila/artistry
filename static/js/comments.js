/* ══════════════════════════
   comments.js
══════════════════════════ */
const form    = document.getElementById('comment-form');
const listEl  = document.getElementById('comments-list');
const msgEl   = document.getElementById('form-msg');
const countEl = document.getElementById('comments-count');

function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

async function loadComments() {
  try {
    const data = await (await fetch('/api/comments')).json();
    if (countEl) countEl.textContent = `(${data.length})`;
    if (!data.length) { listEl.innerHTML = '<p class="no-comments">Fii primul care lasă un mesaj!</p>'; return; }
    listEl.innerHTML = [...data].reverse().map(c => `
      <div class="comment-card">
        <div class="comment-header">
          <span class="comment-name">${esc(c.name)}</span>
          <div class="comment-meta">
            <span class="comment-stars">${'★'.repeat(c.rating)}${'☆'.repeat(5-c.rating)}</span>
            <span class="comment-date">${c.date}</span>
          </div>
        </div>
        <p class="comment-text">${esc(c.message)}</p>
      </div>`).join('');
  } catch(e) { console.error(e); }
}

form?.addEventListener('submit', async e => {
  e.preventDefault();
  msgEl.textContent = '';
  const name    = form.querySelector('[name=name]').value.trim();
  const message = form.querySelector('[name=message]').value.trim();
  const rating  = parseInt(form.querySelector('[name=rating]:checked')?.value || 0);
  if (!name || !message) { msgEl.textContent = 'Completează toate câmpurile.'; return; }
  if (!rating)           { msgEl.textContent = 'Alege un rating.'; return; }
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true;
  try {
    const res = await fetch('/api/comments', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name,message,rating}) });
    if (res.ok) { form.reset(); msgEl.textContent = 'Mulțumim pentru mesaj!'; await loadComments(); }
    else { const err = await res.json(); msgEl.textContent = err.error || 'Eroare.'; }
  } catch { msgEl.textContent = 'Eroare de conexiune.'; }
  finally { btn.disabled = false; }
});

loadComments();
