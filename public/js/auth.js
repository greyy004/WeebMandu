document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMsg');
  const successMsg = document.getElementById('successMsg');
  const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const showMessage = (element, message) => {
    if (!element) return;
    element.textContent = message;
    element.style.display = message ? 'block' : 'none';
  };

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showMessage(errorMsg, '');
      showMessage(successMsg, '');

      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const email = document.getElementById('email').value.trim();
      const nameRegex = /^[A-Za-z]{2,}$/;

      if (!nameRegex.test(username)) {
        showMessage(errorMsg, 'Invalid username.');
        return;
      }

      if (!emailRegex.test(email)) {
        showMessage(errorMsg, 'Invalid email address.');
        return;
      }

      if (!passwordRegex.test(password)) {
        showMessage(errorMsg, 'Invalid password. It must be at least 8 characters long and contain at least one letter and one number');
        return;
      }
      try {
        const response = await fetch('/auth/authRegister', {
          method: 'post',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ username, password, email })
        });
        const data = await response.json();
        if (!response.ok) {
          showMessage(errorMsg, data.message || 'Registration failed.');
          return;
        }

        showMessage(successMsg, 'Registration successful! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/html/login.html';
        }, 1000);
      } catch (err) {
        console.error('Network or fetch error:', err);
        showMessage(errorMsg, 'Unable to register at this time. Please try again later.');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showMessage(errorMsg, '');
      showMessage(successMsg, '');

      const password = document.getElementById('password').value;
      const email = document.getElementById('email').value;

      if (!email || !password) {
        showMessage(errorMsg, 'Please enter both email and password.');
        return;
      }

      try {
        const response = await fetch('/auth/authLogin', {
          method: 'post',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
          showMessage(errorMsg, data.message || 'Login failed');
          return;
        }

        if (data.user.isAdmin === true) {
          location.assign('/html/adminDashboard.html');
        } else {
          location.assign('/html/userDashboard.html');
        }
        
      } catch (err) {
        console.error('Network or fetch error:', err);
        showMessage(errorMsg, 'Unable to login at this time. Please try again later.');
      }
    });
  }
});
