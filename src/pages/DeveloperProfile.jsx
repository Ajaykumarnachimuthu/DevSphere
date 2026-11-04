import { useEffect, useState, useMemo } from "react";
import { NavLink, Link, useLocation, useParams } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { ActivityChart } from "../components/charts/ActivityChart";
import { EmptyState } from "../components/ui/EmptyState";
import { Button } from "../components/ui/Button";
import { ImageUploader } from "../components/ui/ImageUploader";
import { EditProjectModal } from "../components/project/EditProjectModal";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useDevSphere } from "../context/DevSphereContext";
import { developersApi, projectsApi, blogsApi } from "../services/api";
import {
  getLikedProjects,
  toggleProjectLikedLocal,
  recordProjectLiked,
  getLikedBlogs,
  toggleBlogLikedLocal,
  recordBlogLiked,
} from "../utils/likesStorage";

export function DeveloperProfile() {
  const { id: routeDevId } = useParams();
  const location = useLocation();
  const isMyProfileRoute = location.pathname === "/profile";

  const [storedDeveloper, setStoredDeveloper] = useLocalStorage("selectedDeveloper", null);
  const { userProfile, isAuthenticated } = useDevSphere();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [selected, setSelected] = useState(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [statusNotice, setStatusNotice] = useState("");

  // Profile Reactions (Like & Dislike Developer) - starts clean at 0
  const [profileLikes, setProfileLikes] = useState(0);
  const [profileDislikes, setProfileDislikes] = useState(0);
  const [userProfileReaction, setUserProfileReaction] = useState(null); // 'like' | 'dislike' | null

  // Profile Comments & Endorsements
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Projects & Blogs states
  const [developerProjects, setDeveloperProjects] = useState([]);
  const [developerBlogs, setDeveloperBlogs] = useState([]);
  const [likedProjectIds, setLikedProjectIds] = useState(() => getLikedProjects());
  const [likedBlogIds, setLikedBlogIds] = useState(() => getLikedBlogs());
  const [loadingItems, setLoadingItems] = useState(true);

  // Stats & Chart
  const [stats, setStats] = useState({
    projectsCount: 0,
    blogsCount: 0,
    totalViews: 0,
    connectionsCount: 0,
    totalLikes: 0,
    chartData: [0, 0, 0, 0, 0],
  });

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    role: "",
    bio: "",
    location: "",
    skills: "",
    avatarUrl: "",
    githubUrl: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // View Mode: 'split' | 'projects' | 'blogs'
  const [viewMode, setViewMode] = useState("split");

  // Project Edit Modal State
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    tagline: "",
    category: "Web Development",
    technologies: "",
    status: "Active",
    coverImage: "",
    githubUrl: "",
    liveDemoUrl: "",
    quickstartCmd: "",
    description: "",
  });
  const [savingProject, setSavingProject] = useState(false);

  // Blog Edit Modal State
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: "",
    subtitle: "",
    category: "Engineering",
    readTime: "5 min read",
    coverImage: "",
    tech: "",
    tags: "",
    difficulty: "Intermediate",
    content: "",
  });
  const [savingBlog, setSavingBlog] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Load Developer Profile (Anti-collision & Zero-flash logic)
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoadingProfile(true);
      let dev = null;

      // 1. If explicit URL parameter /developers/:id provided
      if (routeDevId) {
        try {
          dev = await developersApi.getById(routeDevId);
        } catch (err) {
          console.warn("Could not load developer by URL ID:", err);
        }
      }

      // 2. If accessing /profile (My Profile) or no routeDevId provided
      if (!dev && (isMyProfileRoute || !routeDevId)) {
        try {
          localStorage.removeItem("selectedDeveloper");
        } catch {}

        const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem("jwt_token"));
        if (isAuthenticated || hasToken) {
          try {
            const myProfile = await developersApi.getMyProfile();
            if (myProfile && isMounted) {
              dev = myProfile;
            }
          } catch (err) {
            console.warn("Could not load authenticated profile directly:", err);
          }
        }
      }

      // 3. Fallback to storedDeveloper when visiting /developer-profile
      if (!dev && storedDeveloper) {
        dev = storedDeveloper;
      }

      // 4. Fallback to first available developer in community directory if completely unauthenticated
      if (!dev && !isMyProfileRoute) {
        try {
          const res = await developersApi.getAll({ size: 1 });
          const firstDev = res?.content?.[0] || (Array.isArray(res) ? res[0] : null);
          if (firstDev && isMounted) dev = firstDev;
        } catch {
          dev = null;
        }
      }

      if (!dev) {
        if (isMounted) {
          setSelected(null);
          setLoadingProfile(false);
        }
        return;
      }

      const normalizedDev = {
        ...dev,
        description: dev.bio || dev.description || "",
        skills: Array.isArray(dev.skills) ? dev.skills : Array.from(dev.skills || []),
      };

      if (isMounted) {
        setSelected(normalizedDev);
        setConnected(Boolean(normalizedDev.connected));
        const rawAv = normalizedDev.avatarUrl || normalizedDev.avatar || "";
        const isCustom = Boolean(
          rawAv &&
          !["a1", "a2", "a3", "a4", "a5", "a6"].includes(rawAv.trim()) &&
          rawAv.trim().length > 4
        );
        setProfileForm({
          name: normalizedDev.name || "",
          role: normalizedDev.role || "",
          bio: normalizedDev.description || "",
          location: normalizedDev.location || "Worldwide",
          skills: normalizedDev.skills?.join(", ") || "",
          avatarUrl: isCustom ? rawAv : "",
          githubUrl: normalizedDev.githubUrl || "",
        });
        setLoadingProfile(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [routeDevId, storedDeveloper, isAuthenticated, isMyProfileRoute]);

  // Is viewing own profile? Strict & deterministic check
  const isOwnProfile = useMemo(() => {
    if (!isAuthenticated || !selected) return false;
    if (isMyProfileRoute) return true;
    if (userProfile?.id && selected?.id && String(userProfile.id) === String(selected.id)) return true;
    if (userProfile?.username && selected?.name && userProfile.username.toLowerCase() === selected.name.toLowerCase()) return true;
    if (userProfile?.username && selected?.username && userProfile.username.toLowerCase() === selected.username.toLowerCase()) return true;
    return false;
  }, [isAuthenticated, userProfile, selected, isMyProfileRoute]);

  // 2. Fetch Developer's authored Projects & Blogs
  useEffect(() => {
    let isMounted = true;
    if (!selected) return;

    const fetchAuthoredContent = async () => {
      setLoadingItems(true);
      try {
        const [projsRes, blogsRes] = await Promise.all([
          projectsApi.getAll({ size: 100 }).catch(() => ({ content: [] })),
          blogsApi.getAll({ size: 100 }).catch(() => ({ content: [] })),
        ]);

        const allProjs = projsRes?.content || (Array.isArray(projsRes) ? projsRes : []);
        const allBlogs = blogsRes?.content || (Array.isArray(blogsRes) ? blogsRes : []);

        const devName = (selected.name || "").toLowerCase().trim();
        const devUser = (selected.username || "").toLowerCase().trim();
        const devId = selected.id ? String(selected.id) : "";
        const myUser = (userProfile?.username || "").toLowerCase().trim();

        const matchesDev = (item) => {
          const author = (item.author || item.authorName || "").toLowerCase().trim();
          const authorId = item.authorId ? String(item.authorId) : "";

          if (devId && authorId && devId === authorId) return true;
          if (devName && author === devName) return true;
          if (devUser && author === devUser) return true;
          return false;
        };

        const filteredProjs = allProjs.filter(matchesDev);
        const filteredBlogs = allBlogs.filter(matchesDev);

        if (isMounted) {
          setDeveloperProjects(filteredProjs);
          setDeveloperBlogs(filteredBlogs);

          const projLikes = filteredProjs.reduce((acc, p) => acc + (p.likes || 0), 0);
          const blogLikes = filteredBlogs.reduce((acc, b) => acc + (b.likes || 0), 0);
          const totalLikes = projLikes + blogLikes;
          const totalViews = filteredProjs.reduce((acc, p) => acc + (p.views || 0), 0);
          const connections = selected.connectionsCount || (selected.connected ? 1 : 0);

          setStats({
            projectsCount: filteredProjs.length,
            blogsCount: filteredBlogs.length,
            totalViews,
            connectionsCount: connections,
            totalLikes,
            chartData: [filteredProjs.length, filteredBlogs.length, totalViews, totalLikes, connections],
          });
        }
      } catch (err) {
        console.warn("Failed to load authored content", err);
      } finally {
        if (isMounted) setLoadingItems(false);
      }
    };

    fetchAuthoredContent();
    return () => {
      isMounted = false;
    };
  }, [selected, userProfile]);

  // 3. Load Scoped Comments and Likes for this Developer (Clean state, NO mock likes)
  useEffect(() => {
    if (!selected) return;
    const devKey = String(selected.id || selected.username || selected.name || "dev").toLowerCase().trim();

    // Reaction & Like counts
    const reactionKey = `devsphere_reaction_${devKey}`;
    const likesKey = `devsphere_likes_${devKey}`;
    const dislikesKey = `devsphere_dislikes_${devKey}`;

    const savedReaction = localStorage.getItem(reactionKey);
    const savedLikes = localStorage.getItem(likesKey);
    const savedDislikes = localStorage.getItem(dislikesKey);

    setUserProfileReaction(savedReaction || null);
    setProfileLikes(savedLikes !== null ? parseInt(savedLikes, 10) : 0);
    setProfileDislikes(savedDislikes !== null ? parseInt(savedDislikes, 10) : 0);

    // Comments (Clean start, no mock user seeds)
    const commentsKey = `devsphere_comments_${devKey}`;
    const savedCommentsStr = localStorage.getItem(commentsKey);
    if (savedCommentsStr) {
      try {
        setComments(JSON.parse(savedCommentsStr));
      } catch {
        setComments([]);
      }
    } else {
      setComments([]);
    }
  }, [selected]);

  // Profile Like / Dislike Handlers
  const handleToggleProfileLike = () => {
    if (!selected) return;
    const devKey = String(selected.id || selected.username || selected.name || "dev").toLowerCase().trim();
    const reactionKey = `devsphere_reaction_${devKey}`;
    const likesKey = `devsphere_likes_${devKey}`;
    const dislikesKey = `devsphere_dislikes_${devKey}`;

    let newReaction = "like";
    let newLikes = profileLikes;
    let newDislikes = profileDislikes;

    if (userProfileReaction === "like") {
      newReaction = null;
      newLikes = Math.max(0, newLikes - 1);
    } else if (userProfileReaction === "dislike") {
      newReaction = "like";
      newLikes = newLikes + 1;
      newDislikes = Math.max(0, newDislikes - 1);
    } else {
      newReaction = "like";
      newLikes = newLikes + 1;
    }

    setUserProfileReaction(newReaction);
    setProfileLikes(newLikes);
    setProfileDislikes(newDislikes);

    try {
      if (newReaction) localStorage.setItem(reactionKey, newReaction);
      else localStorage.removeItem(reactionKey);
      localStorage.setItem(likesKey, String(newLikes));
      localStorage.setItem(dislikesKey, String(newDislikes));
    } catch {}

    if (newReaction === "like") {
      setStatusNotice(`❤️ You liked ${selected.name}'s profile!`);
      setTimeout(() => setStatusNotice(""), 3000);
    }
  };

  const handleToggleProfileDislike = () => {
    if (!selected) return;
    const devKey = String(selected.id || selected.username || selected.name || "dev").toLowerCase().trim();
    const reactionKey = `devsphere_reaction_${devKey}`;
    const likesKey = `devsphere_likes_${devKey}`;
    const dislikesKey = `devsphere_dislikes_${devKey}`;

    let newReaction = "dislike";
    let newLikes = profileLikes;
    let newDislikes = profileDislikes;

    if (userProfileReaction === "dislike") {
      newReaction = null;
      newDislikes = Math.max(0, newDislikes - 1);
    } else if (userProfileReaction === "like") {
      newReaction = "dislike";
      newDislikes = newDislikes + 1;
      newLikes = Math.max(0, newLikes - 1);
    } else {
      newReaction = "dislike";
      newDislikes = newDislikes + 1;
    }

    setUserProfileReaction(newReaction);
    setProfileLikes(newLikes);
    setProfileDislikes(newDislikes);

    try {
      if (newReaction) localStorage.setItem(reactionKey, newReaction);
      else localStorage.removeItem(reactionKey);
      localStorage.setItem(likesKey, String(newLikes));
      localStorage.setItem(dislikesKey, String(newDislikes));
    } catch {}
  };

  // Project & Blog Likes Handlers
  const handleToggleProjectLike = async (projectId) => {
    if (!projectId) return;
    const { isLiked, delta } = toggleProjectLikedLocal(projectId);
    setLikedProjectIds(getLikedProjects());
    setDeveloperProjects((prev) =>
      prev.map((p) =>
        String(p.id) === String(projectId)
          ? { ...p, likes: Math.max(0, (p.likes || 0) + delta) }
          : p
      )
    );
    setStats((prev) => {
      const newTotal = Math.max(0, prev.totalLikes + delta);
      return {
        ...prev,
        totalLikes: newTotal,
        chartData: [prev.projectsCount, prev.blogsCount, newTotal, prev.connectionsCount],
      };
    });

    if (isAuthenticated) {
      try {
        const updated = await projectsApi.toggleLike(projectId);
        if (updated && typeof updated.likes === "number") {
          setDeveloperProjects((prev) =>
            prev.map((p) => (String(p.id) === String(projectId) ? { ...p, likes: updated.likes } : p))
          );
        }
      } catch (err) {
        console.warn("Backend project like sync failed, preserved locally:", err);
      }
    }
  };

  const handleToggleBlogLike = async (blogId) => {
    if (!blogId) return;
    const { isLiked, delta } = toggleBlogLikedLocal(blogId);
    setLikedBlogIds(getLikedBlogs());
    setDeveloperBlogs((prev) =>
      prev.map((b) =>
        String(b.id) === String(blogId)
          ? { ...b, likes: Math.max(0, (b.likes || 0) + delta) }
          : b
      )
    );
    setStats((prev) => {
      const newTotal = Math.max(0, prev.totalLikes + delta);
      return {
        ...prev,
        totalLikes: newTotal,
        chartData: [prev.projectsCount, prev.blogsCount, newTotal, prev.connectionsCount],
      };
    });

    if (isAuthenticated) {
      try {
        const updated = await blogsApi.toggleLike(blogId);
        if (updated && typeof updated.likes === "number") {
          setDeveloperBlogs((prev) =>
            prev.map((b) => (String(b.id) === String(blogId) ? { ...b, likes: updated.likes } : b))
          );
        }
      } catch (err) {
        console.warn("Backend blog like sync failed, preserved locally:", err);
      }
    }
  };

  // Profile Comments Handlers
  const saveCommentsToStorage = (updated) => {
    setComments(updated);
    if (!selected) return;
    const devKey = String(selected.id || selected.username || selected.name || "dev").toLowerCase().trim();
    try {
      localStorage.setItem(`devsphere_comments_${devKey}`, JSON.stringify(updated));
    } catch {}
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setIsSubmittingComment(true);

    const isCurrentAuthor = Boolean(
      isOwnProfile ||
      (userProfile?.username && selected?.name && userProfile.username.toLowerCase() === selected.name.toLowerCase()) ||
      (userProfile?.name && selected?.name && userProfile.name.toLowerCase() === selected.name.toLowerCase())
    );

    const authorDisplayName = userProfile?.username || (isAuthenticated ? userProfile?.name : "Guest Developer") || "Guest Developer";

    const newComment = {
      id: `comm_${Date.now()}`,
      authorName: authorDisplayName,
      authorUsername: userProfile?.username || "guest",
      isAuthor: isCurrentAuthor,
      content: newCommentText.trim(),
      timeAgo: "Just now",
      likes: 0,
      dislikes: 0,
      userReaction: null,
      replies: [],
    };

    const updated = [newComment, ...comments];
    saveCommentsToStorage(updated);
    setNewCommentText("");
    setIsSubmittingComment(false);
    setStatusNotice("💬 Recommendation posted successfully!");
    setTimeout(() => setStatusNotice(""), 3500);
  };

  const handleToggleCommentLike = (commentId) => {
    const updated = comments.map((c) => {
      if (c.id !== commentId) return c;
      let newReaction = "like";
      let newLikes = c.likes || 0;
      let newDislikes = c.dislikes || 0;

      if (c.userReaction === "like") {
        newReaction = null;
        newLikes = Math.max(0, newLikes - 1);
      } else if (c.userReaction === "dislike") {
        newReaction = "like";
        newLikes = newLikes + 1;
        newDislikes = Math.max(0, newDislikes - 1);
      } else {
        newReaction = "like";
        newLikes = newLikes + 1;
      }
      return { ...c, userReaction: newReaction, likes: newLikes, dislikes: newDislikes };
    });
    saveCommentsToStorage(updated);
  };

  const handleToggleCommentDislike = (commentId) => {
    const updated = comments.map((c) => {
      if (c.id !== commentId) return c;
      let newReaction = "dislike";
      let newLikes = c.likes || 0;
      let newDislikes = c.dislikes || 0;

      if (c.userReaction === "dislike") {
        newReaction = null;
        newDislikes = Math.max(0, newDislikes - 1);
      } else if (c.userReaction === "like") {
        newReaction = "dislike";
        newDislikes = newDislikes + 1;
        newLikes = Math.max(0, newLikes - 1);
      } else {
        newReaction = "dislike";
        newDislikes = newDislikes + 1;
      }
      return { ...c, userReaction: newReaction, likes: newLikes, dislikes: newDislikes };
    });
    saveCommentsToStorage(updated);
  };

  const handlePostReply = (e, parentCommentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const isCurrentAuthor = Boolean(
      isOwnProfile ||
      (userProfile?.username && selected?.name && userProfile.username.toLowerCase() === selected.name.toLowerCase()) ||
      (userProfile?.name && selected?.name && userProfile.name.toLowerCase() === selected.name.toLowerCase())
    );

    const authorDisplayName = userProfile?.username || (isAuthenticated ? userProfile?.name : "Guest Developer") || "Guest Developer";

    const newReply = {
      id: `rep_${Date.now()}`,
      authorName: authorDisplayName,
      authorUsername: userProfile?.username || "guest",
      isAuthor: isCurrentAuthor,
      content: replyText.trim(),
      timeAgo: "Just now",
      likes: 0,
      dislikes: 0,
      userReaction: null,
    };

    const updated = comments.map((c) => {
      if (c.id !== parentCommentId) return c;
      return {
        ...c,
        replies: [...(c.replies || []), newReply],
      };
    });

    saveCommentsToStorage(updated);
    setReplyText("");
    setReplyingToCommentId(null);
    setStatusNotice("↩ Reply posted!");
    setTimeout(() => setStatusNotice(""), 3000);
  };

  const handleToggleReplyLike = (parentCommentId, replyId) => {
    const updated = comments.map((c) => {
      if (c.id !== parentCommentId) return c;
      const updatedReplies = (c.replies || []).map((r) => {
        if (r.id !== replyId) return r;
        let newReaction = "like";
        let newLikes = r.likes || 0;
        let newDislikes = r.dislikes || 0;

        if (r.userReaction === "like") {
          newReaction = null;
          newLikes = Math.max(0, newLikes - 1);
        } else if (r.userReaction === "dislike") {
          newReaction = "like";
          newLikes = newLikes + 1;
          newDislikes = Math.max(0, newDislikes - 1);
        } else {
          newReaction = "like";
          newLikes = newLikes + 1;
        }
        return { ...r, userReaction: newReaction, likes: newLikes, dislikes: newDislikes };
      });
      return { ...c, replies: updatedReplies };
    });
    saveCommentsToStorage(updated);
  };

  const handleToggleReplyDislike = (parentCommentId, replyId) => {
    const updated = comments.map((c) => {
      if (c.id !== parentCommentId) return c;
      const updatedReplies = (c.replies || []).map((r) => {
        if (r.id !== replyId) return r;
        let newReaction = "dislike";
        let newLikes = r.likes || 0;
        let newDislikes = r.dislikes || 0;

        if (r.userReaction === "dislike") {
          newReaction = null;
          newDislikes = Math.max(0, newDislikes - 1);
        } else if (r.userReaction === "like") {
          newReaction = "dislike";
          newDislikes = newDislikes + 1;
          newLikes = Math.max(0, newLikes - 1);
        } else {
          newReaction = "dislike";
          newDislikes = newDislikes + 1;
        }
        return { ...r, userReaction: newReaction, likes: newLikes, dislikes: newDislikes };
      });
      return { ...c, replies: updatedReplies };
    });
    saveCommentsToStorage(updated);
  };

  const handleDeleteComment = (commentId) => {
    const updated = comments.filter((c) => c.id !== commentId);
    saveCommentsToStorage(updated);
  };

  const handleDeleteReply = (parentCommentId, replyId) => {
    const updated = comments.map((c) => {
      if (c.id !== parentCommentId) return c;
      return {
        ...c,
        replies: (c.replies || []).filter((r) => r.id !== replyId),
      };
    });
    saveCommentsToStorage(updated);
  };

  // Anti-flash skeleton loader
  if (loadingProfile) {
    return (
      <Shell>
        <div className="profile-page-wrapper">
          <div className="profile-skeleton-card" style={{ height: "260px", marginBottom: "24px" }} />
          <div className="profile-top-grid">
            <div className="profile-skeleton-card" style={{ height: "280px" }} />
            <div className="profile-skeleton-card" style={{ height: "280px" }} />
          </div>
        </div>
      </Shell>
    );
  }

  if (!selected) {
    if (isMyProfileRoute && !isAuthenticated && typeof window !== "undefined" && !localStorage.getItem("jwt_token")) {
      return (
        <Shell>
          <div style={{ maxWidth: 800, margin: "60px auto", padding: "0 20px" }}>
            <EmptyState
              title="Sign in to view your profile"
              description="Sign in with your DevSphere account to view and customize your profile, authored projects, and published articles."
              actionLabel="Sign In"
              onAction={() => {
                window.location.href = "/login";
              }}
            />
          </div>
        </Shell>
      );
    }

    return (
      <Shell>
        <div style={{ maxWidth: 800, margin: "60px auto", padding: "0 20px" }}>
          <EmptyState
            title="No developer profile selected"
            description="Select a developer from the community directory to view their profile, projects, and skills."
            actionLabel="Browse Developers"
            onAction={() => {
              window.location.href = "/developers";
            }}
          />
        </div>
      </Shell>
    );
  }

  // --- Handlers ---
  const handleConnect = async () => {
    if (!isAuthenticated) {
      setMessage("Please log in to connect with developers.");
      return;
    }
    if (selected.id) {
      try {
        const res = await developersApi.toggleConnect(selected.id);
        setConnected(res.connected);
        setStats((prev) => ({
          ...prev,
          connectionsCount: res.connected ? prev.connectionsCount + 1 : Math.max(0, prev.connectionsCount - 1),
        }));
      } catch (err) {
        setMessage(err.message || "Failed to toggle connection.");
      }
    }
  };

  const handleOpenEditProfile = () => {
    const rawAv = selected?.avatarUrl || selected?.avatar || "";
    const isCustom = Boolean(
      rawAv &&
      !["a1", "a2", "a3", "a4", "a5", "a6"].includes(rawAv.trim()) &&
      rawAv.trim().length > 4
    );
    setProfileForm({
      name: selected?.name || "",
      role: selected?.role || "",
      bio: selected?.description || selected?.bio || "",
      location: selected?.location || "Worldwide",
      skills: selected?.skills?.join(", ") || "",
      avatarUrl: isCustom ? rawAv : "",
      githubUrl: selected?.githubUrl || "",
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setMessage("");

    try {
      const skillsArray = profileForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const avatarToSave = profileForm.avatarUrl?.trim() || "a1";

      const payload = {
        name: profileForm.name.trim(),
        role: profileForm.role.trim(),
        bio: profileForm.bio.trim(),
        description: profileForm.bio.trim(),
        location: profileForm.location.trim(),
        avatar: avatarToSave,
        avatarUrl: avatarToSave,
        skills: skillsArray,
      };

      const updated = await developersApi.updateMyProfile(payload);
      const normalizedUpdated = {
        ...selected,
        ...updated,
        avatar: updated.avatar || payload.avatar,
        avatarUrl: updated.avatarUrl || updated.avatar || payload.avatarUrl,
        description: updated.bio || updated.description || payload.bio,
        skills: Array.isArray(updated.skills) ? updated.skills : Array.from(updated.skills || []),
      };

      setSelected(normalizedUpdated);
      setStoredDeveloper(normalizedUpdated);
      setIsEditingProfile(false);
      setStatusNotice("🎉 Profile successfully updated with new photo & details!");
      setTimeout(() => setStatusNotice(""), 4000);
    } catch (err) {
      setMessage(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Project Actions ---
  const handleOpenEditProject = (project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title || "",
      tagline: project.tagline || "",
      category: project.category || "Web Development",
      technologies: Array.isArray(project.technologies) ? project.technologies.join(", ") : (project.technologies || ""),
      status: project.status || "Active",
      coverImage: project.coverImage || "",
      githubUrl: project.githubUrl || "",
      liveDemoUrl: project.liveDemoUrl || "",
      quickstartCmd: project.quickstartCmd || "",
      description: project.description || project.proposedSolution || project.tagline || "",
    });
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!editingProject) return;
    setSavingProject(true);
    try {
      const techs = projectForm.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: projectForm.title.trim(),
        tagline: projectForm.tagline.trim(),
        category: projectForm.category,
        technologies: techs,
        status: projectForm.status,
        coverImage: projectForm.coverImage?.trim() || "",
        githubUrl: projectForm.githubUrl.trim(),
        liveDemoUrl: projectForm.liveDemoUrl.trim(),
        quickstartCmd: projectForm.quickstartCmd.trim(),
        description: projectForm.description.trim() || projectForm.title.trim(),
      };

      const updated = await projectsApi.update(editingProject.id, payload);
      const merged = { ...editingProject, ...updated, ...payload };
      setDeveloperProjects((prev) =>
        prev.map((p) => (p.id === editingProject.id ? merged : p))
      );
      setEditingProject(null);
      setStatusNotice("✅ Project updated successfully!");
      setTimeout(() => setStatusNotice(""), 4000);
    } catch (err) {
      alert("Failed to update project: " + (err.message || "Unknown error"));
    } finally {
      setSavingProject(false);
    }
  };

  // --- Blog Actions ---
  const handleOpenEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title || "",
      subtitle: blog.subtitle || "",
      category: blog.category || "Engineering",
      readTime: blog.readTime || "5 min read",
      coverImage: blog.coverImage || "",
      tech: blog.tech || "",
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : Array.from(blog.tags || []).join(", "),
      difficulty: blog.difficulty || "Intermediate",
      content: blog.content || "",
    });
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!editingBlog) return;
    setSavingBlog(true);
    try {
      const tagList = blogForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: blogForm.title.trim(),
        subtitle: blogForm.subtitle.trim(),
        category: blogForm.category,
        readTime: blogForm.readTime.trim(),
        coverImage: blogForm.coverImage?.trim() || "",
        tech: blogForm.tech.trim(),
        tags: tagList,
        difficulty: blogForm.difficulty,
        content: blogForm.content.trim(),
      };

      const updated = await blogsApi.update(editingBlog.id, payload);
      const merged = { ...editingBlog, ...updated, ...payload };
      setDeveloperBlogs((prev) =>
        prev.map((b) => (b.id === editingBlog.id ? merged : b))
      );
      setEditingBlog(null);
      setStatusNotice("✅ Blog article updated successfully!");
      setTimeout(() => setStatusNotice(""), 4000);
    } catch (err) {
      alert("Failed to update blog: " + (err.message || "Unknown error"));
    } finally {
      setSavingBlog(false);
    }
  };

  // --- Delete Handler ---
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "project") {
        await projectsApi.delete(deleteTarget.id);
        setDeveloperProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setStats((prev) => ({ ...prev, projectsCount: Math.max(0, prev.projectsCount - 1) }));
        setStatusNotice(`🗑 Project "${deleteTarget.title}" deleted.`);
      } else {
        await blogsApi.delete(deleteTarget.id);
        setDeveloperBlogs((prev) => prev.filter((b) => b.id !== deleteTarget.id));
        setStats((prev) => ({ ...prev, blogsCount: Math.max(0, prev.blogsCount - 1) }));
        setStatusNotice(`🗑 Blog article "${deleteTarget.title}" deleted.`);
      }
      setTimeout(() => setStatusNotice(""), 4000);
      setDeleteTarget(null);
    } catch (err) {
      alert("Failed to delete: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  const initials = selected.name
    ? selected.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()
    : "DS";

  const rawDevAvatar = selected.avatarUrl || selected.avatar || "";
  const hasAvatarImg = Boolean(
    rawDevAvatar &&
    !["a1", "a2", "a3", "a4", "a5", "a6"].includes(rawDevAvatar.trim()) &&
    rawDevAvatar.trim().length > 4
  );

  return (
    <Shell>
      <div className="profile-page-wrapper">
        {/* Breadcrumb Navigation */}
        <p className="crumb" style={{ marginBottom: "16px" }}>
          <NavLink to="/developers">Developers</NavLink> / Profile
        </p>

        {/* Global Notification Banner */}
        {statusNotice && (
          <div style={{
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid #10b981",
            color: "#059669",
            padding: "12px 20px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>✨</span>
            <span>{statusNotice}</span>
          </div>
        )}

        {/* =========================================================================
            TOP SECTION: Profile Pic & Info (Left) + Metrics & Graph (Right)
            ========================================================================= */}
        <div className="profile-top-grid">
          {/* LEFT: Developer Identity & Bio Card */}
          <section className="profile-identity-card">
            <div className="profile-avatar-row">
              <div className="profile-avatar-large">
                {hasAvatarImg ? (
                  <img
                    src={rawDevAvatar}
                    alt={selected.name}
                    className="profile-avatar-img"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.parentElement?.querySelector(".profile-avatar-fallback");
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <span
                  className="profile-avatar-fallback"
                  style={{ display: hasAvatarImg ? "none" : "flex" }}
                >
                  {initials}
                </span>
                <span className="profile-online-badge" title="Active on DevSphere" />
              </div>

              <div className="profile-details-col">
                <span className="profile-role-badge">
                  {selected.role || "Full-Stack Engineer"}
                </span>
                <h1 className="profile-name">{selected.name}</h1>
                <span className="profile-handle">@{selected.username || selected.name.toLowerCase().replace(/\s+/g, "_")}</span>

                <div className="profile-meta-row">
                  <span className="profile-meta-item">
                    📍 {selected.location || "Worldwide"}
                  </span>
                  <span className="profile-meta-item" style={{ color: "#10b981", fontWeight: 600 }}>
                    🟢 Available for collaboration
                  </span>
                </div>
              </div>
            </div>

            <p className="profile-bio">
              {selected.description || "Passionate software engineer building resilient web, AI/ML, and cloud solutions. Actively collaborating with fellow developers on DevSphere."}
            </p>

            {/* Skills & Technologies Pills */}
            <div className="profile-skills-section">
              <span className="profile-skills-title">Skills & Technologies</span>
              <div className="profile-skills-pills">
                {selected.skills && selected.skills.length > 0 ? (
                  selected.skills.map((skill) => (
                    <span key={skill} className="profile-skill-pill">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Web Development, React, Spring Boot</span>
                )}
              </div>
            </div>

            {/* Profile Like / Dislike Reactions Bar */}
            <div className="profile-reactions-bar">
              <button
                type="button"
                className={`profile-reaction-btn ${userProfileReaction === "like" ? "active-like" : ""}`}
                onClick={handleToggleProfileLike}
                title="Cheer and like this developer profile"
              >
                <span className="reaction-emoji">{userProfileReaction === "like" ? "❤️" : "🤍"}</span>
                <span className="reaction-label">Like Profile</span>
                <span className="reaction-count">{profileLikes}</span>
              </button>

              <button
                type="button"
                className={`profile-reaction-btn ${userProfileReaction === "dislike" ? "active-dislike" : ""}`}
                onClick={handleToggleProfileDislike}
                title="Dislike / disagree"
              >
                <span className="reaction-emoji">👎</span>
                <span className="reaction-count">{profileDislikes}</span>
              </button>
            </div>

            {/* Action Buttons Row */}
            <div className="profile-actions-row">
              {isOwnProfile ? (
                <>
                  <button
                    type="button"
                    className="btn-profile-action primary"
                    onClick={handleOpenEditProfile}
                  >
                    ✎ Edit Profile
                  </button>
                  <Link to="/write-project" className="btn-profile-action">
                    + New Project
                  </Link>
                  <Link to="/write-blog" className="btn-profile-action">
                    + New Blog
                  </Link>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={`btn-profile-action ${connected ? "" : "primary"}`}
                    onClick={handleConnect}
                  >
                    {connected ? "✓ Connected" : "+ Connect"}
                  </button>
                  <button
                    type="button"
                    className="btn-profile-action"
                    onClick={() =>
                      setMessage(`Direct messaging panel for ${selected.name} is connected.`)
                    }
                  >
                    ✉ Message
                  </button>
                </>
              )}
            </div>

            {message && (
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--primary)", fontWeight: 500 }}>
                {message}
              </p>
            )}
          </section>

          {/* RIGHT: Developer Stats Counter & Activity Graph */}
          <section className="profile-metrics-card">
            {/* 5 Stats Tiles */}
            <div className="profile-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(85px, 1fr))" }}>
              <div className="profile-stat-box">
                <strong>{developerProjects.length}</strong>
                <span>Projects</span>
              </div>
              <div className="profile-stat-box">
                <strong>{developerBlogs.length}</strong>
                <span>Blogs</span>
              </div>
              <div className="profile-stat-box">
                <strong style={{ color: "var(--primary, #6366f1)" }}>{stats.totalViews}</strong>
                <span>Views</span>
              </div>
              <div className="profile-stat-box">
                <strong style={{ color: "#ef4444" }}>{stats.totalLikes}</strong>
                <span>Total Likes</span>
              </div>
              <div className="profile-stat-box">
                <strong style={{ color: "#10b981" }}>{stats.connectionsCount}</strong>
                <span>Network</span>
              </div>
            </div>

            {/* Activity Breakdown Chart.js Graph */}
            <div className="profile-chart-section">
              <div className="profile-chart-header">
                <h3>📊 Community Activity & Impact</h3>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Live Telemetry</span>
              </div>
              <ActivityChart
                data={stats.chartData}
                labels={["Projects", "Blogs", "Views", "Likes", "Network"]}
              />
            </div>
          </section>
        </div>

        {/* =========================================================================
            BOTTOM SECTION: Split into 2 Columns (Projects & Blogs)
            With self-service editing and deletion controls
            ========================================================================= */}
        <div className="profile-view-nav-wrapper">
          <div className="profile-view-toggle">
            <button
              type="button"
              className={`profile-view-toggle-btn ${viewMode === "split" ? "active" : ""}`}
              onClick={() => setViewMode("split")}
            >
              ⇄ Split View (Side-by-Side)
            </button>
            <button
              type="button"
              className={`profile-view-toggle-btn ${viewMode === "projects" ? "active" : ""}`}
              onClick={() => setViewMode("projects")}
            >
              🚀 Projects <span className="pill">{developerProjects.length}</span>
            </button>
            <button
              type="button"
              className={`profile-view-toggle-btn ${viewMode === "blogs" ? "active" : ""}`}
              onClick={() => setViewMode("blogs")}
            >
              📝 Blogs & Articles <span className="pill">{developerBlogs.length}</span>
            </button>
          </div>

          {isOwnProfile && (
            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="/write-project" className="btn-profile-action primary">
                + Submit Project
              </Link>
              <Link to="/write-blog" className="btn-profile-action">
                + Write Blog
              </Link>
            </div>
          )}
        </div>

        <div className={`profile-split-container ${viewMode !== "split" ? "single-column" : ""}`}>
          {/* ================= LEFT COLUMN: PROJECTS SHOWCASE ================= */}
          {(viewMode === "split" || viewMode === "projects") && (
            <div className="profile-column">
              <div className="profile-column-header">
                <h2 className="profile-column-title">
                  <span>🚀</span>
                  <span>Projects Showcase</span>
                  <span className="profile-count-pill">{developerProjects.length}</span>
                </h2>
                {isOwnProfile && (
                  <Link to="/write-project" className="btn-profile-action" style={{ fontSize: "11.5px" }}>
                    + New
                  </Link>
                )}
              </div>

              {loadingItems ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[1, 2].map((i) => (
                    <div key={i} className="card" style={{ height: "130px", opacity: 0.6 }} />
                  ))}
                </div>
              ) : developerProjects.length > 0 ? (
                developerProjects.map((project) => (
                  <article key={project.id || project.title} className="profile-item-card">
                    <div className="profile-card-top">
                      <div>
                        <span style={{
                          fontSize: "10.5px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          color: "var(--primary)",
                          background: "rgba(79, 70, 229, 0.08)",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          display: "inline-block",
                          marginBottom: "4px"
                        }}>
                          {project.category || "Showcase"}
                        </span>
                        <h3 style={{ margin: "2px 0 0" }}>
                          <Link to={`/projects/${project.id}`} className="profile-card-title">
                            {project.title}
                          </Link>
                        </h3>
                      </div>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: project.status === "ACTIVE" ? "rgba(16, 185, 129, 0.1)" : "var(--bg-surface-subtle)",
                        color: project.status === "ACTIVE" ? "#059669" : "var(--text-muted)",
                        border: "1px solid var(--border-color)"
                      }}>
                        {project.status || "Active"}
                      </span>
                    </div>

                    <p className="profile-card-tagline">
                      {project.tagline || project.description || "Interactive community software showcase on DevSphere."}
                    </p>

                    {/* Technologies tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                      {(Array.isArray(project.technologies) ? project.technologies : (project.technologies || "").split(","))
                        .map((t) => (typeof t === "string" ? t.trim() : ""))
                        .filter(Boolean)
                        .slice(0, 4)
                        .map((tech) => (
                          <span
                            key={tech}
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              background: "var(--bg-surface-subtle)",
                              border: "1px solid var(--border-color)",
                              padding: "2px 7px",
                              borderRadius: "4px",
                              color: "var(--text-secondary)"
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                    </div>

                    {/* Metrics & Actions Row */}
                    <div className="profile-card-actions">
                      <div className="profile-card-meta" style={{ marginRight: "auto" }}>
                        <button
                          type="button"
                          className={`profile-item-like-btn ${likedProjectIds.includes(String(project.id)) ? "active" : ""}`}
                          onClick={() => handleToggleProjectLike(project.id)}
                          title={likedProjectIds.includes(String(project.id)) ? "Unlike project" : "Like project"}
                        >
                          <span className="heart-icon">{likedProjectIds.includes(String(project.id)) ? "❤️" : "🤍"}</span>
                          <span>{project.likes || 0}</span>
                        </button>
                        <span>👁️ {project.views || 0}</span>
                      </div>

                      <Link to={`/projects/${project.id}`} className="btn-profile-action">
                        ↗ View
                      </Link>

                      {isOwnProfile && (
                        <>
                          <button
                            type="button"
                            className="btn-profile-action"
                            onClick={() => handleOpenEditProject(project)}
                            title="Edit this project showcase"
                          >
                            ✎ Edit
                          </button>
                          <button
                            type="button"
                            className="btn-profile-action danger"
                            onClick={() => setDeleteTarget({ type: "project", id: project.id, title: project.title })}
                            title="Delete this project"
                          >
                            🗑
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="card" style={{ padding: "32px 20px", textAlign: "center" }}>
                  <EmptyState
                    title="No projects published yet"
                    description={isOwnProfile ? "Showcase your repositories, live demos, and system architectures to the DevSphere community." : "This developer hasn't published any project showcases yet."}
                    actionLabel={isOwnProfile ? "+ Submit a Project" : undefined}
                    onAction={isOwnProfile ? () => (window.location.href = "/write-project") : undefined}
                  />
                </div>
              )}
            </div>
          )}

          {/* ================= RIGHT COLUMN: ENGINEERING BLOGS ================= */}
          {(viewMode === "split" || viewMode === "blogs") && (
            <div className="profile-column">
              <div className="profile-column-header">
                <h2 className="profile-column-title">
                  <span>📝</span>
                  <span>Articles & Publications</span>
                  <span className="profile-count-pill">{developerBlogs.length}</span>
                </h2>
                {isOwnProfile && (
                  <Link to="/write-blog" className="btn-profile-action" style={{ fontSize: "11.5px" }}>
                    + Write
                  </Link>
                )}
              </div>

              {loadingItems ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[1, 2].map((i) => (
                    <div key={i} className="card" style={{ height: "130px", opacity: 0.6 }} />
                  ))}
                </div>
              ) : developerBlogs.length > 0 ? (
                developerBlogs.map((blog) => (
                  <article key={blog.id || blog.title} className="profile-item-card">
                    <div className="profile-card-top">
                      <div>
                        <span style={{
                          fontSize: "10.5px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          color: "#7c3aed",
                          background: "rgba(124, 58, 237, 0.08)",
                          padding: "2px 7px",
                          borderRadius: "4px",
                          display: "inline-block",
                          marginBottom: "4px"
                        }}>
                          {blog.category || "Engineering"}
                        </span>
                        <h3 style={{ margin: "2px 0 0" }}>
                          <Link to={`/blogs/${blog.id}`} className="profile-card-title">
                            {blog.title}
                          </Link>
                        </h3>
                      </div>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: blog.status === "DRAFT" ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
                        color: blog.status === "DRAFT" ? "#d97706" : "#059669",
                        border: "1px solid var(--border-color)"
                      }}>
                        {blog.status || "PUBLISHED"}
                      </span>
                    </div>

                    <p className="profile-card-tagline">
                      {blog.subtitle || blog.content?.slice(0, 140) || "Engineering article exploring scalable system designs and software best practices."}
                    </p>

                    {/* Metadata row */}
                    <div className="profile-card-meta">
                      <span>⏱️ {blog.readTime || "5 min read"}</span>
                      <span>🎯 {blog.difficulty || "Intermediate"}</span>
                      {blog.tech && <span>💻 {blog.tech.split(",")[0]}</span>}
                    </div>

                    {/* Metrics & Actions Row */}
                    <div className="profile-card-actions">
                      <div className="profile-card-meta" style={{ marginRight: "auto" }}>
                        <button
                          type="button"
                          className={`profile-item-like-btn ${likedBlogIds.includes(String(blog.id)) ? "active" : ""}`}
                          onClick={() => handleToggleBlogLike(blog.id)}
                          title={likedBlogIds.includes(String(blog.id)) ? "Unlike article" : "Like article"}
                        >
                          <span className="heart-icon">{likedBlogIds.includes(String(blog.id)) ? "❤️" : "🤍"}</span>
                          <span>{blog.likes || 0}</span>
                        </button>
                        <span>🔖 {blog.bookmarks || 0}</span>
                      </div>

                      <Link to={`/blogs/${blog.id}`} className="btn-profile-action">
                        ↗ Read
                      </Link>

                      {isOwnProfile && (
                        <>
                          <button
                            type="button"
                            className="btn-profile-action"
                            onClick={() => handleOpenEditBlog(blog)}
                            title="Edit this blog post"
                          >
                            ✎ Edit
                          </button>
                          <button
                            type="button"
                            className="btn-profile-action danger"
                            onClick={() => setDeleteTarget({ type: "blog", id: blog.id, title: blog.title })}
                            title="Delete this blog"
                          >
                            🗑
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="card" style={{ padding: "32px 20px", textAlign: "center" }}>
                  <EmptyState
                    title="No blog publications yet"
                    description={isOwnProfile ? "Publish technical deep dives, engineering post-mortems, and architectural patterns." : "This developer has not published any technical articles yet."}
                    actionLabel={isOwnProfile ? "+ Write an Article" : undefined}
                    onAction={isOwnProfile ? () => (window.location.href = "/write-blog") : undefined}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            PROFILE COMMENTS & PEER ENDORSEMENTS SECTION
            ========================================================================= */}
        <section className="profile-comments-section card">
          <div className="profile-comments-header">
            <div className="profile-comments-title-group">
              <h2>
                <span>💬</span>
                <span>Developer Recommendations & Comments</span>
                <span className="profile-count-pill">{comments.length}</span>
              </h2>
              <p className="profile-comments-subtitle">
                Leave technical endorsements, review discussions, or project collaboration feedback for {selected.name}.
              </p>
            </div>
          </div>

          {/* Comment Composer */}
          <form onSubmit={handlePostComment} className="profile-comment-composer">
            <div className="composer-avatar">
              {(userProfile?.username || "U").charAt(0).toUpperCase()}
            </div>
            <div className="composer-input-col">
              <textarea
                rows={3}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={`Leave a recommendation, technical peer review, or comment for ${selected.name}...`}
                className="profile-comment-textarea"
                required
              />
              <div className="composer-actions-row">
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingComment}>
                  Post Recommendation →
                </Button>
              </div>
            </div>
          </form>

          {/* Comments List Stream */}
          <div className="profile-comments-list">
            {comments.length === 0 ? (
              <div className="profile-no-comments">
                <span>💡 No recommendations yet. Be the first peer developer to leave feedback for {selected.name}!</span>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`profile-comment-card ${comment.isAuthor ? "author-highlight-card" : ""}`}
                >
                  <div className="profile-comment-card-header">
                    <div className="profile-comment-author-info">
                      <div className={`profile-comment-avatar ${comment.isAuthor ? "author-avatar" : ""}`}>
                        {(comment.authorName || "D").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="profile-comment-name-row">
                          <span className="profile-comment-author-name">{comment.authorName}</span>
                          {comment.isAuthor ? (
                            <span className="profile-badge-author">
                              👑 Profile Author
                            </span>
                          ) : (
                            <span className="profile-badge-peer">
                              Peer Developer
                            </span>
                          )}
                        </div>
                        <span className="profile-comment-timestamp">{comment.timeAgo || "Just now"}</span>
                      </div>
                    </div>

                    {(comment.authorName?.toLowerCase() === userProfile?.username?.toLowerCase() || isOwnProfile) && (
                      <button
                        type="button"
                        className="profile-comment-delete-btn"
                        onClick={() => handleDeleteComment(comment.id)}
                        title="Delete recommendation"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <p className="profile-comment-content">{comment.content}</p>

                  {/* Comment Footer: Like / Dislike + Reply Button */}
                  <div className="profile-comment-footer">
                    <div className="profile-comment-reactions">
                      <button
                        type="button"
                        className={`comment-reaction-btn ${comment.userReaction === "like" ? "active-like" : ""}`}
                        onClick={() => handleToggleCommentLike(comment.id)}
                        title="Upvote recommendation"
                      >
                        <span>👍</span>
                        <span>{comment.likes || 0}</span>
                      </button>
                      <button
                        type="button"
                        className={`comment-reaction-btn ${comment.userReaction === "dislike" ? "active-dislike" : ""}`}
                        onClick={() => handleToggleCommentDislike(comment.id)}
                        title="Downvote"
                      >
                        <span>👎</span>
                        <span>{comment.dislikes || 0}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="profile-comment-reply-btn"
                      onClick={() => setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)}
                    >
                      ↩ Reply {comment.replies && comment.replies.length > 0 ? `(${comment.replies.length})` : ""}
                    </button>
                  </div>

                  {/* Inline Reply Composer */}
                  {replyingToCommentId === comment.id && (
                    <form
                      onSubmit={(e) => handlePostReply(e, comment.id)}
                      className="profile-reply-composer"
                    >
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={
                          isOwnProfile
                            ? `Reply as Profile Author (@${userProfile?.username || "author"})...`
                            : `Reply to ${comment.authorName}...`
                        }
                        required
                      />
                      <div className="profile-reply-actions">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReplyingToCommentId(null);
                            setReplyText("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="primary" size="sm">
                          Post Reply
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Nested Replies Stream */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="profile-replies-stream">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`profile-reply-bubble ${reply.isAuthor ? "author-reply-highlight" : ""}`}
                        >
                          <div className="profile-comment-card-header">
                            <div className="profile-comment-author-info">
                              <div className={`profile-comment-avatar sm ${reply.isAuthor ? "author-avatar" : ""}`}>
                                {(reply.authorName || "R").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="profile-comment-name-row">
                                  <span className="profile-comment-author-name">{reply.authorName}</span>
                                  {reply.isAuthor ? (
                                    <span className="profile-badge-author">
                                      👑 Profile Author
                                    </span>
                                  ) : (
                                    <span className="profile-badge-peer">
                                      Peer
                                    </span>
                                  )}
                                </div>
                                <span className="profile-comment-timestamp">{reply.timeAgo || "Just now"}</span>
                              </div>
                            </div>

                            {(reply.authorName?.toLowerCase() === userProfile?.username?.toLowerCase() || isOwnProfile) && (
                              <button
                                type="button"
                                className="profile-comment-delete-btn"
                                onClick={() => handleDeleteReply(comment.id, reply.id)}
                                title="Delete reply"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <p className="profile-comment-content">{reply.content}</p>

                          {/* Reply Reactions: Like / Dislike */}
                          <div className="profile-comment-footer">
                            <div className="profile-comment-reactions">
                              <button
                                type="button"
                                className={`comment-reaction-btn sm ${reply.userReaction === "like" ? "active-like" : ""}`}
                                onClick={() => handleToggleReplyLike(comment.id, reply.id)}
                              >
                                <span>👍</span>
                                <span>{reply.likes || 0}</span>
                              </button>
                              <button
                                type="button"
                                className={`comment-reaction-btn sm ${reply.userReaction === "dislike" ? "active-dislike" : ""}`}
                                onClick={() => handleToggleReplyDislike(comment.id, reply.id)}
                              >
                                <span>👎</span>
                                <span>{reply.dislikes || 0}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* =========================================================================
            MODAL 0: EDIT DEVELOPER PROFILE MODAL
            ========================================================================= */}
        {isEditingProfile && (
          <div
            className="desktop-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsEditingProfile(false);
            }}
          >
            <div className="desktop-modal-dialog" style={{ maxWidth: "740px" }}>
              <div className="desktop-modal-header">
                <div>
                  <span className="desktop-modal-badge">PROFILE SETTINGS</span>
                  <h2>Edit Developer Profile</h2>
                </div>
                <button
                  type="button"
                  className="desktop-modal-close"
                  onClick={() => setIsEditingProfile(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="desktop-modal-body" style={{ maxHeight: "72vh", overflowY: "auto", padding: "26px" }}>
                  <div className="profile-modal-form">

                    {/* Dedicated Avatar Upload Section */}
                    <div className="profile-edit-avatar-section">
                      <div className="profile-edit-avatar-preview">
                        {profileForm.avatarUrl ? (
                          <img
                            src={profileForm.avatarUrl}
                            alt="Avatar preview"
                            className="profile-avatar-img"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="profile-edit-avatar-initials">{initials}</span>
                        )}
                      </div>

                      <div className="profile-edit-avatar-controls">
                        <ImageUploader
                          value={profileForm.avatarUrl}
                          onChange={(url) => setProfileForm((prev) => ({ ...prev, avatarUrl: url }))}
                          label="Profile Picture / Avatar"
                          hint="JPG, PNG, WEBP, GIF or DataURL (Recommended: 1:1 square)"
                          aspectRatio="1/1"
                        />
                        {profileForm.avatarUrl && (
                          <button
                            type="button"
                            className="profile-btn-remove-avatar"
                            onClick={() => setProfileForm((prev) => ({ ...prev, avatarUrl: "" }))}
                          >
                            🗑 Remove photo and revert to initials
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Full Name & Professional Role (2-Column Grid) */}
                    <div className="profile-modal-grid-2">
                      <label>
                        Full Name *
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          placeholder="e.g. Alex Rivera"
                          required
                        />
                      </label>

                      <label>
                        Professional Role / Headline *
                        <input
                          type="text"
                          value={profileForm.role}
                          onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                          placeholder="e.g. Full-Stack Architect & AI Engineer"
                          required
                        />
                      </label>
                    </div>

                    {/* Location & GitHub / Portfolio Link (2-Column Grid) */}
                    <div className="profile-modal-grid-2">
                      <label>
                        Location
                        <input
                          type="text"
                          value={profileForm.location}
                          onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                          placeholder="e.g. San Francisco, CA / London / Worldwide"
                        />
                      </label>

                      <label>
                        GitHub / Portfolio Link
                        <input
                          type="text"
                          value={profileForm.githubUrl}
                          onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                          placeholder="https://github.com/your-username"
                        />
                      </label>
                    </div>

                    {/* Skills & Technologies with Live Interactive Pills */}
                    <label>
                      Skills & Technologies (comma separated)
                      <input
                        type="text"
                        value={profileForm.skills}
                        onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                        placeholder="React, Spring Boot, FastAPI, PostgreSQL, Docker, TensorFlow"
                      />
                      <span className="profile-input-hint">Live preview of skills pills on your profile:</span>
                      <div className="profile-preview-pills">
                        {profileForm.skills
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean).length > 0 ? (
                          profileForm.skills
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((tag) => (
                              <span key={tag} className="profile-skill-pill">
                                {tag}
                              </span>
                            ))
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            Type comma-separated skills above (e.g. Java, Python, React, Cloud)
                          </span>
                        )}
                      </div>
                    </label>

                    {/* Bio & Story */}
                    <label>
                      Bio & Engineering Focus
                      <textarea
                        rows={4}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        placeholder="Tell the DevSphere community about your background, architectures you've built, and what you're passionate about..."
                      />
                    </label>
                  </div>
                </div>

                <div className="desktop-modal-footer">
                  <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={isSavingProfile}>
                    Save Profile Changes 🚀
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 1: FULL ACCESS PROJECT EDIT STUDIO MODAL
            ========================================================================= */}
        <EditProjectModal
          project={editingProject}
          isOpen={Boolean(editingProject)}
          onClose={() => setEditingProject(null)}
          onSave={(updated) => {
            setDeveloperProjects((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
            setStatusNotice("✅ Project updated successfully!");
            setTimeout(() => setStatusNotice(""), 4000);
          }}
        />

        {/* =========================================================================
            MODAL 2: EDIT BLOG MODAL
            ========================================================================= */}
        {editingBlog && (
          <div
            className="desktop-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingBlog(null);
            }}
          >
            <div className="desktop-modal-dialog" style={{ maxWidth: "680px" }}>
              <div className="desktop-modal-header">
                <div>
                  <span className="desktop-modal-badge">ARTICLE EDITOR</span>
                  <h2>Edit Engineering Blog</h2>
                </div>
                <button
                  type="button"
                  className="desktop-modal-close"
                  onClick={() => setEditingBlog(null)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveBlog}>
                <div className="desktop-modal-body" style={{ maxHeight: "70vh", overflowY: "auto", padding: "24px" }}>
                  <div className="profile-modal-form">
                    <label>
                      Article Title *
                      <input
                        type="text"
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        required
                      />
                    </label>

                    <label>
                      Subtitle / One-Line Abstract
                      <input
                        type="text"
                        value={blogForm.subtitle}
                        onChange={(e) => setBlogForm({ ...blogForm, subtitle: e.target.value })}
                        placeholder="Brief summary of key concepts"
                      />
                    </label>

                    {/* Blog Cover Image / Banner */}
                    <ImageUploader
                      value={blogForm.coverImage}
                      onChange={(url) => setBlogForm((prev) => ({ ...prev, coverImage: url }))}
                      label="Article Cover Image / Header Banner"
                      hint="Visual banner for publication card (Recommended: 1200×630px)"
                      aspectRatio="16/9"
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <label>
                        Category
                        <select
                          value={blogForm.category}
                          onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                        >
                          <option value="Engineering">Engineering</option>
                          <option value="Architecture">Architecture</option>
                          <option value="Database">Database</option>
                          <option value="Security">Security</option>
                          <option value="DevOps">DevOps</option>
                          <option value="Tutorial">Tutorial</option>
                        </select>
                      </label>

                      <label>
                        Difficulty Level
                        <select
                          value={blogForm.difficulty}
                          onChange={(e) => setBlogForm({ ...blogForm, difficulty: e.target.value })}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <label>
                        Estimated Read Time
                        <input
                          type="text"
                          value={blogForm.readTime}
                          onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                          placeholder="e.g. 5 min read"
                        />
                      </label>

                      <label>
                        Primary Technologies
                        <input
                          type="text"
                          value={blogForm.tech}
                          onChange={(e) => setBlogForm({ ...blogForm, tech: e.target.value })}
                          placeholder="e.g. Spring Boot, PostgreSQL"
                        />
                      </label>
                    </div>

                    <label>
                      Tags (comma separated)
                      <input
                        type="text"
                        value={blogForm.tags}
                        onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                        placeholder="Java, RestApi, Scalability"
                      />
                    </label>

                    <label>
                      Content (Markdown supported) *
                      <textarea
                        rows={6}
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        required
                      />
                    </label>
                  </div>
                </div>

                <div className="desktop-modal-footer">
                  <Button type="button" variant="outline" onClick={() => setEditingBlog(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" isLoading={savingBlog}>
                    Save Article 📝
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 3: DELETE CONFIRMATION MODAL
            ========================================================================= */}
        {deleteTarget && (
          <div
            className="desktop-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setDeleteTarget(null);
            }}
          >
            <div className="desktop-modal-dialog" style={{ maxWidth: "480px" }}>
              <div className="desktop-modal-header">
                <div>
                  <span className="desktop-modal-badge" style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.1)" }}>
                    CONFIRM DELETION
                  </span>
                  <h2>Delete {deleteTarget.type === "project" ? "Project" : "Blog Post"}</h2>
                </div>
                <button
                  type="button"
                  className="desktop-modal-close"
                  onClick={() => setDeleteTarget(null)}
                >
                  ✕
                </button>
              </div>

              <div className="desktop-modal-body" style={{ padding: "24px" }}>
                <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                  Are you sure you want to permanently delete <strong>&ldquo;{deleteTarget.title}&rdquo;</strong>?
                  This action will remove it from the DevSphere catalog and cannot be undone.
                </p>
              </div>

              <div className="desktop-modal-footer">
                <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ background: "#ef4444", borderColor: "#ef4444" }}
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Permanently 🗑"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
