document.addEventListener('DOMContentLoaded', () => {
    // Phase 2 / Phase 3 Coexistence: If React island is active, React manages the signup form
    if (document.getElementById('signup-island-root')) return;
    const form = document.querySelector('.signup');
    const username = document.querySelector('#username');
    const email = document.querySelector('#email');
    const password = document.querySelector('#password');
    const confirmPassword = document.querySelector('#confirmPassword');
    const strength = document.querySelector('#password-strength') || document.createElement('small');
    if (!strength.parentElement) password.parentElement.appendChild(strength);
    const toggle = document.querySelector('#toggle-password');
    const message = document.createElement('p');
    form?.prepend(message);
    const showMessage = (text, success = false) => { message.textContent = text; message.style.color = success ? 'green' : 'crimson'; };
    toggle?.addEventListener('click', () => { const visible = password.type === 'text'; password.type = visible ? 'password' : 'text'; toggle.textContent = visible ? 'Show' : 'Hide'; });
    password?.addEventListener('input', () => { const length = password.value.length; strength.textContent = length < 6 ? 'Weak' : length < 10 ? 'Medium' : 'Strong'; });
    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = username.value.trim();
        const address = email.value.trim().toLowerCase();
        if (name.length < 3) showMessage('Username must contain at least 3 characters.');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) showMessage('Enter a valid email address.');
        else if (password.value.length < 6) showMessage('Password must be at least 6 characters.');
        else if (password.value !== confirmPassword.value) showMessage('Passwords do not match.');
        else {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            let duplicate = false;
            for (const user of users) if (user.email === address) duplicate = true;
            if (duplicate) showMessage('This email is already registered.');
            else { users.push({ username: name, email: address, password: password.value }); localStorage.setItem('users', JSON.stringify(users)); showMessage('Account created. You can now log in.', true); form.reset(); }
        }
    });
});
