document.addEventListener('DOMContentLoaded', () => {
    const values = [10000, 2500, 1200, 50];
    document.querySelectorAll('.numbers article strong').forEach((element, index) => { const target = values[index]; let current = 0; const step = Math.max(1, Math.ceil(target / 50)); const timer = window.setInterval(() => { current = Math.min(target, current + step); element.textContent = `${current >= 1000 ? `${(current / 1000).toFixed(current % 1000 ? 1 : 0)}K` : current}+`; if (current === target) window.clearInterval(timer); }, 25); });
    document.querySelector('.join')?.addEventListener('click', event => { event.preventDefault(); window.location.href = './signup.html'; });
    const heroContent = document.querySelector('.hero > div');
    if (heroContent && !heroContent.querySelector('.get-started')) {
        const getStarted = document.createElement('a');
        getStarted.className = 'join get-started';
        getStarted.href = './signup.html';
        getStarted.textContent = 'Get Started Today';
        heroContent.appendChild(getStarted);
        getStarted.addEventListener('click', event => { event.preventDefault(); window.location.href = './signup.html'; });
    }
    const reveal = () => document.querySelector('.numbers')?.classList.toggle('seen', window.scrollY > 120);
    window.addEventListener('scroll', reveal); reveal();
});
