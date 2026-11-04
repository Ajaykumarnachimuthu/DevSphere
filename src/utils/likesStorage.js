/**
 * Universal Likes Management for Projects & Blogs
 * Provides persistent local state with seamless backend synchronization
 */

const STORAGE_PROJECTS_KEY = "devsphere_liked_projects";
const STORAGE_BLOGS_KEY = "devsphere_liked_blogs";

function getSafeList(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function saveSafeList(key, list) {
  try {
    const unique = Array.from(new Set(list.map(String)));
    localStorage.setItem(key, JSON.stringify(unique));
  } catch (err) {
    console.warn("Failed to save likes to localStorage:", err);
  }
}

// --- Projects ---
export function getLikedProjects() {
  return getSafeList(STORAGE_PROJECTS_KEY);
}

export function isProjectLiked(projectId) {
  if (!projectId) return false;
  return getLikedProjects().includes(String(projectId));
}

export function toggleProjectLikedLocal(projectId) {
  if (!projectId) return { isLiked: false, delta: 0 };
  const strId = String(projectId);
  const current = getLikedProjects();
  const exists = current.includes(strId);
  let updated;
  if (exists) {
    updated = current.filter((id) => id !== strId);
  } else {
    updated = [...current, strId];
  }
  saveSafeList(STORAGE_PROJECTS_KEY, updated);
  return { isLiked: !exists, delta: exists ? -1 : 1 };
}

export function recordProjectLiked(projectId, liked) {
  if (!projectId) return;
  const strId = String(projectId);
  const current = getLikedProjects();
  const exists = current.includes(strId);
  if (liked && !exists) {
    saveSafeList(STORAGE_PROJECTS_KEY, [...current, strId]);
  } else if (!liked && exists) {
    saveSafeList(STORAGE_PROJECTS_KEY, current.filter((id) => id !== strId));
  }
}

// --- Blogs ---
export function getLikedBlogs() {
  return getSafeList(STORAGE_BLOGS_KEY);
}

export function isBlogLiked(blogId) {
  if (!blogId) return false;
  return getLikedBlogs().includes(String(blogId));
}

export function toggleBlogLikedLocal(blogId) {
  if (!blogId) return { isLiked: false, delta: 0 };
  const strId = String(blogId);
  const current = getLikedBlogs();
  const exists = current.includes(strId);
  let updated;
  if (exists) {
    updated = current.filter((id) => id !== strId);
  } else {
    updated = [...current, strId];
  }
  saveSafeList(STORAGE_BLOGS_KEY, updated);
  return { isLiked: !exists, delta: exists ? -1 : 1 };
}

export function recordBlogLiked(blogId, liked) {
  if (!blogId) return;
  const strId = String(blogId);
  const current = getLikedBlogs();
  const exists = current.includes(strId);
  if (liked && !exists) {
    saveSafeList(STORAGE_BLOGS_KEY, [...current, strId]);
  } else if (!liked && exists) {
    saveSafeList(STORAGE_BLOGS_KEY, current.filter((id) => id !== strId));
  }
}

