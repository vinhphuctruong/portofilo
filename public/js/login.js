document.addEventListener('DOMContentLoaded', () => {
  // Redirect if already logged in
  const token = localStorage.getItem('portfolio_token');
  if (token) {
    window.location.href = '/admin.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');
  const loginBtn = document.getElementById('loginBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.remove('show');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      errorEl.textContent = 'Vui lòng nhập đầy đủ thông tin';
      errorEl.classList.add('show');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Đang đăng nhập...';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('portfolio_token', data.token);
      localStorage.setItem('portfolio_user', data.username);
      window.location.href = '/admin.html';
    } catch (err) {
      errorEl.textContent = err.message === 'Invalid credentials' ? 'Sai tên đăng nhập hoặc mật khẩu' : err.message;
      errorEl.classList.add('show');
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Đăng nhập';
    }
  });
});
