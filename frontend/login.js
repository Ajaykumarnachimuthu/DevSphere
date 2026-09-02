document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.loginForm');
    const email = document.querySelector('#email');
    const password = document.querySelector('#PASSWORD');
    const toggle = document.querySelector('#toggle-password');
    const message = document.createElement('p');
    form?.prepend(message);
    const showMessage = (text, success = false) => { message.textContent = text; message.style.color = success ? 'green' : 'crimson'; };
    toggle?.addEventListener('click', () => { const visible = password.type === 'text'; password.type = visible ? 'password' : 'text'; toggle.textContent = visible ? 'Show' : 'Hide'; });
    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const emailValue = email.value.trim();
        const passwordValue = password.value;
        if (!emailValue) showMessage('Email is required.');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) showMessage('Enter a valid email address.');
        else if (passwordValue.length < 6) showMessage('Password must be at least 6 characters.');
        else {
            localStorage.setItem('loggedInUser', emailValue);
            showMessage('Login successful. Redirecting…', true);
            window.setTimeout(() => { window.location.href = './index.html'; }, 900);
        }
    });
});
