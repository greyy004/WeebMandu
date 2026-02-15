document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const email = document.getElementById('email').value;
      const nameRegex = /^[A-Za-z]{2,}$/;

      if (!nameRegex.test(username)) {
        alert("Invalid username.");
        return;
      }

      if (!emailRegex.test(email)) {
        alert("Invalid email address.");
        return;
      }

      if (!passwordRegex.test(password)) {
        alert("Invalid password. It must be at least 8 characters long and contain at least one letter and one number");
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
          console.log('error: ', data.message());
        }
        alert("registration succesful");
        window.location.href = '/html/login.html'; 

      } catch (err) {
        console.error('Network or fetch error:', err);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('password').value;
      const email = document.getElementById('email').value;

      if (!emailRegex.test(email)) {
        alert("Invalid email address.");
        return;
      }

      if (!passwordRegex.test(password)) {
        alert("Invalid password. It must be at least 8 characters long and contain at least one letter and one number");
        return;
      }
      try {
        const response = await fetch('/auth/authLogin', {
          method: 'post',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({email, password })
        });
        const data = await response.json();
        if (!response.ok) {
          console.log('error: ', response.text());
        }
        alert("login succesful");
        window.location.href = '/html/index.html'; 

      } catch (err) {
        console.error('Network or fetch error:', err);
      }
    });
  }
});
