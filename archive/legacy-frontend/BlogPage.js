document.addEventListener('DOMContentLoaded', () => {
    // Phase 2 / Phase 3 Coexistence: If React island is active, React manages this region
    if (document.getElementById('blog-island-root')) return;
    const blogs = [
        { title: 'Understanding JavaScript Closures', category: 'Web Development', description: 'Learn how closures work and why they are useful in modern JavaScript.', author: 'Ajay Kumar', readTime: '5 min read', tech: 'JavaScript' },
        { title: 'Getting Started with React Hooks', category: 'Web Development', description: 'A simple introduction to useState, useEffect and React Hooks.', author: 'Arun Kumar', readTime: '6 min read', tech: 'React' },
        { title: 'Understanding SQL Joins', category: 'Web Development', description: 'Learn the basics of INNER, LEFT and RIGHT joins with examples.', author: 'Ravi Kumar', readTime: '4 min read', tech: 'Database' },
        { title: 'Python for Beginners', category: 'AI / ML', description: 'Start your Python journey with variables, functions and data types.', author: 'Priya', readTime: '7 min read', tech: 'Python' },
        { title: 'Introduction to Machine Learning', category: 'AI / ML', description: 'Understand the basic concepts behind machine learning.', author: 'Vishal', readTime: '8 min read', tech: 'AI' },
        { title: 'Git and GitHub Basics', category: 'DevOps', description: 'Learn how developers use Git and GitHub to manage projects.', author: 'Rahul', readTime: '5 min read', tech: 'Git' }
    ];
    const grid = document.querySelector('.blogGrid');
    const search = document.querySelector('.blogSearch input');
    const filters = document.querySelectorAll('.categories button');
    let category = 'All';
    const render = () => {
        const query = search.value.trim().toLowerCase();
        const results = blogs.filter(blog => (category === 'All' || blog.category === category) && `${blog.title} ${blog.category} ${blog.description}`.toLowerCase().includes(query));
        grid.innerHTML = results.length ? results.map(blog => `<article class="blogCard"><div class="blogImage">${blog.tech}</div><div class="blogContent"><span class="tech">${blog.tech}</span><h2>${blog.title}</h2><p>${blog.description}</p><small>${blog.author} · ${blog.readTime}</small></div></article>`).join('') : '<p class="empty-state">No blogs found.</p>';
    };
    search?.addEventListener('input', render);
    filters.forEach(button => button.addEventListener('click', () => { filters.forEach(item => item.classList.remove('active')); button.classList.add('active'); category = button.textContent.trim(); render(); }));
    document.querySelector('.write')?.addEventListener('click', () => { window.location.href = './writeBlog.html'; });
    document.querySelector('#login')?.addEventListener('click', () => { window.location.href = './login.html'; });
    document.querySelector('#register')?.addEventListener('click', () => { window.location.href = './signup.html'; });
    render();
});
