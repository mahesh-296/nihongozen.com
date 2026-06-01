// ===== LOGIN.JS =====

let currentTab = 'signin';

function switchTab(tab, btn) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const titleEl = document.getElementById('auth-title');
  const subEl   = document.getElementById('auth-sub');
  if (tab === 'signin') {
    titleEl.textContent = 'Welcome back';
    subEl.textContent   = 'Sign in to continue your Japanese studies';
  } else {
    titleEl.textContent = 'Start your journey';
    subEl.textContent   = 'Create your free account to begin learning';
  }
  resetForm();
}

function clearError() {
  const err = document.getElementById('email-error');
  if (err) err.textContent = '';
}

function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

async function handleMagicLink() {
  const input  = document.getElementById('email-input');
  const errEl  = document.getElementById('email-error');
  const btnLbl = document.getElementById('btn-label');
  const btn    = document.querySelector('.btn-primary');

  const email = input.value.trim();
  if (!email)                 { errEl.textContent = 'Email is required'; return; }
  if (!validateEmail(email))  { errEl.textContent = 'Enter a valid email address'; return; }
  errEl.textContent = '';

  // Show loading
  btn.disabled = true;
  btnLbl.innerHTML = '<span class="spinner"></span> Sending magic link...';

  // Simulate API call (replace with real backend)
  await new Promise(r => setTimeout(r, 1200));

  // Show success
  document.getElementById('form-area').style.display   = 'none';
  document.getElementById('success-area').style.display = 'flex';
  btn.disabled = false;
  btnLbl.textContent = 'Send Magic Link';

  showToast(`Magic link sent to ${email}`, 'success');
}

function resetForm() {
  document.getElementById('form-area').style.display   = 'block';
  document.getElementById('success-area').style.display = 'none';
  document.getElementById('email-input').value = '';
  document.getElementById('email-error').textContent = '';
}

function handleGoogle() {
  showToast('Signing in with Google…', 'info');
  // Simulate redirect to dashboard
  setTimeout(() => { window.location.href = 'index.html'; }, 900);
}

// Toast (inline, no data.js on login page)
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

// Enter key on email input
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('email-input');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleMagicLink();
    });
  }
});
