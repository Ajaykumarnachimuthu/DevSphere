# Legacy Frontend Archive

This directory preserves the historical Phase 1 (Vanilla HTML/CSS/JavaScript) and Phase 2 (React Islands Architecture) implementations of DevSphere.

## Contents

- **Standalone HTML Pages (`*.html`)**: Early static entry points for Pages (About, BlogPage, DeveloperProfile, Developers, index, login, Projects, signup, writeBlog).
- **Stylesheets (`*.css`)**: Legacy scoped and global stylesheets for the multi-page layout.
- **Vanilla JavaScript (`*.js`)**: Client-side DOM scripts and early localStorage handlers.
- **React Islands (`islands/`)**: Early embedded React components (`*Island.jsx`) designed to mount into standalone HTML elements before migration to the full Single Page Application (SPA).
- **Images (`images/`)**: Original Phase 1/2 asset copies.

## Current Production Architecture

Active production frontend is an integrated Single Page Application (SPA) driven by:
- `index.html` (root)
- `src/App.jsx` with `react-router-dom`
- Centralized `src/services/api.js` client talking to Spring Boot REST APIs
- `public/images/` for static web assets

