document.addEventListener('DOMContentLoaded', () => {
    const selected = JSON.parse(localStorage.getItem('selectedDeveloper') || 'null') || { name: 'Ajay Kumar', role: 'Full Stack Developer', description: 'Passionate about building useful web applications, APIs and developer-focused products.', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'], location: 'India' };
    const profile = document.querySelector('.profile');
    const heading = profile?.querySelector('h1');
    const role = profile?.querySelector('b');
    const details = profile?.querySelector('small');
    const bio = profile?.querySelector('p');
    if (heading) heading.textContent = selected.name;
    if (role) role.textContent = selected.role;
    if (details) details.textContent = `${selected.location} · Available for collaboration`;
    if (bio) bio.textContent = selected.description;
    const skills = document.querySelector('.columns .card .tags');
    if (skills) skills.innerHTML = selected.skills.map(skill => `<span>${skill}</span>`).join('');
    const actions = profile?.querySelectorAll('button');
    const connect = actions?.[0];
    const message = actions?.[1];
    const connectionKey = `connection:${selected.name}`;
    if (connect) { connect.textContent = localStorage.getItem(connectionKey) === 'true' ? 'Connected' : 'Connect'; connect.addEventListener('click', () => { if (localStorage.getItem(connectionKey) !== 'true') { localStorage.setItem(connectionKey, 'true'); connect.textContent = 'Connected'; } }); }
    message?.addEventListener('click', () => { const note = document.createElement('p'); note.textContent = `Message panel for ${selected.name} will be connected to the backend later.`; profile.appendChild(note); });
    const stats = document.querySelector('.stats');
    if (stats && window.Chart) { const canvas = document.createElement('canvas'); stats.appendChild(canvas); new Chart(canvas, { type: 'bar', data: { labels: ['Projects', 'Blogs', 'Connections'], datasets: [{ label: 'Activity', data: [12, 24, 186], backgroundColor: '#4F46E5' }] }, options: { responsive: true } }); }
});
