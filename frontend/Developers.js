document.addEventListener('DOMContentLoaded', () => {
    const developers = [
        { name: 'Ajay Kumar', role: 'Full Stack Developer', description: 'Passionate about building web applications and APIs.', skills: ['HTML', 'CSS', 'JavaScript', 'Node.js'], location: 'India' },
        { name: 'Arun Kumar', role: 'React Developer', description: 'Building interactive and responsive user interfaces.', skills: ['React', 'JavaScript', 'CSS', 'Tailwind'], location: 'India' },
        { name: 'Priya Sharma', role: 'AI/ML Developer', description: 'Exploring machine learning and AI to build smart solutions.', skills: ['Python', 'TensorFlow', 'ML', 'AI'], location: 'India' },
        { name: 'Rohit Verma', role: 'Backend Developer', description: 'Love solving problems and building scalable backend systems.', skills: ['Node.js', 'Express', 'MongoDB', 'SQL'], location: 'India' },
        { name: 'Neha Singh', role: 'UI/UX Designer', description: 'Designing beautiful and user-friendly digital experiences.', skills: ['Figma', 'UI/UX', 'Adobe XD', 'Prototype'], location: 'India' },
        { name: 'Sagar Patil', role: 'DevOps Engineer', description: 'Automating deployments and managing cloud infrastructure.', skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins'], location: 'India' }
    ];
    const grid = document.querySelector('.grid');
    const search = document.querySelector('.devsearch input');
    const render = () => { const query = search.value.trim().toLowerCase(); const results = developers.filter(developer => `${developer.name} ${developer.role} ${developer.skills.join(' ')}`.toLowerCase().includes(query)); grid.innerHTML = results.length ? results.map((developer, index) => `<article><div class="avatar a${index + 1}">${developer.name.split(' ').map(part => part[0]).join('')}</div><div><h2>${developer.name}</h2><b>${developer.role}</b><p>${developer.description}</p><div class="tags">${developer.skills.map(skill => `<i>${skill}</i>`).join('')}</div><a href="DeveloperProfile.html" data-developer="${developer.name}">View Profile</a></div></article>`).join('') : '<p class="empty-state">No developers found.</p>'; grid.querySelectorAll('[data-developer]').forEach(link => link.addEventListener('click', () => { const selected = developers.find(developer => developer.name === link.dataset.developer); localStorage.setItem('selectedDeveloper', JSON.stringify(selected)); })); };
    search?.addEventListener('input', render);
    render();
});
