document.addEventListener('DOMContentLoaded', () => {
    const go = (selector, page) => document.querySelector(selector)?.addEventListener('click', () => { window.location.href = page; });
    go('#login', './login.html');
    go('#register', './signup.html');
    go('#start', './BlogPage.html');
    go('#join', './signup.html');
    const search = document.querySelector('.searchbar input');
    const message = document.createElement('small');
    message.className = 'search-message';
    search?.parentElement?.appendChild(message);
    search?.addEventListener('input', () => {
        const value = search.value.trim();
        message.textContent = value ? `Searching DevSphere for “${value}”…` : '';
    });
    const welcome = document.createElement('p');
    welcome.textContent = `Welcome to DevSphere, ${localStorage.getItem('loggedInUser') || 'developer'}!`;
    document.querySelector('.textcontent')?.appendChild(welcome);
});
