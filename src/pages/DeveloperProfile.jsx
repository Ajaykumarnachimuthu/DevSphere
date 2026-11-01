import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { StatsCard } from "../components/cards/StatsCard";
import { ActivityChart } from "../components/charts/ActivityChart";
import { EmptyState } from "../components/ui/EmptyState";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useDevSphere } from "../context/DevSphereContext";
import { developersApi } from "../services/api";

export function DeveloperProfile() {
  const [storedDeveloper, setStoredDeveloper] = useLocalStorage("selectedDeveloper", null);
  const { userProfile, isAuthenticated } = useDevSphere();
  const [selected, setSelected] = useState(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({ projectsCount: 0, blogsCount: 0, connectionsCount: 0, chartData: [0, 0, 0] });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", role: "", bio: "", location: "", skills: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      let dev = storedDeveloper;

      // If user is authenticated and navigating to profile without a selected dev, load their own profile
      if (!dev && isAuthenticated) {
        try {
          const myProfile = await developersApi.getMyProfile();
          if (myProfile && isMounted) {
            dev = {
              ...myProfile,
              description: myProfile.bio || myProfile.description || "",
              skills: Array.isArray(myProfile.skills) ? myProfile.skills : Array.from(myProfile.skills || []),
            };
          }
        } catch {
          // Keep looking
        }
      }

      // If still no developer selected, fetch the first available developer from database
      if (!dev) {
        try {
          const res = await developersApi.getAll({ size: 1 });
          const firstDev = res?.content?.[0] || (Array.isArray(res) ? res[0] : null);
          if (firstDev && isMounted) {
            dev = {
              ...firstDev,
              description: firstDev.bio || firstDev.description || "",
              skills: Array.isArray(firstDev.skills) ? firstDev.skills : Array.from(firstDev.skills || []),
            };
          }
        } catch {
          dev = null;
        }
      }

      if (!dev) {
        if (isMounted) setSelected(null);
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
        setEditForm({
          name: normalizedDev.name || "",
          role: normalizedDev.role || "",
          bio: normalizedDev.description || "",
          location: normalizedDev.location || "",
          skills: normalizedDev.skills?.join(", ") || "",
        });
      }

      // If developer has a UUID, load real database statistics & profile details
      if (normalizedDev.id) {
        try {
          const [freshDev, freshStats] = await Promise.all([
            developersApi.getById(normalizedDev.id).catch(() => null),
            developersApi.getStats(normalizedDev.id).catch(() => null),
          ]);
          if (isMounted) {
            if (freshDev) {
              setSelected((prev) => ({
                ...prev,
                ...freshDev,
                description: freshDev.bio || freshDev.description || prev?.description || "",
                skills: Array.isArray(freshDev.skills) ? freshDev.skills : Array.from(freshDev.skills || []),
              }));
              setConnected(Boolean(freshDev.connected));
            }
            if (freshStats) {
              setStats({
                projectsCount: freshStats.projectsCount ?? 0,
                blogsCount: freshStats.blogsCount ?? 0,
                connectionsCount: freshStats.connectionsCount ?? 0,
                chartData: freshStats.chartData || [freshStats.projectsCount ?? 0, freshStats.blogsCount ?? 0, freshStats.connectionsCount ?? 0],
              });
            }
          }
        } catch {
          // Keep current stats
        }
      } else {
        if (isMounted) {
          setStats({
            projectsCount: normalizedDev.projectsCount || 0,
            blogsCount: normalizedDev.blogsCount || 0,
            connectionsCount: normalizedDev.connectionsCount || 0,
            chartData: [normalizedDev.projectsCount || 0, normalizedDev.blogsCount || 0, normalizedDev.connectionsCount || 0],
          });
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [storedDeveloper, isAuthenticated]);

  if (!selected) {
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

  const isOwnProfile = isAuthenticated && (
    userProfile?.username === selected.name ||
    userProfile?.email === selected.name ||
    userProfile?.id === selected.id ||
    (!storedDeveloper && isAuthenticated)
  );

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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const skillsArray = editForm.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: editForm.name.trim(),
        role: editForm.role.trim(),
        bio: editForm.bio.trim(),
        location: editForm.location.trim(),
        avatarUrl: selected.avatarUrl || "a1",
        skills: skillsArray,
      };

      const updated = await developersApi.updateMyProfile(payload);
      const normalizedUpdated = {
        ...updated,
        description: updated.bio || updated.description,
        skills: Array.isArray(updated.skills) ? updated.skills : Array.from(updated.skills || []),
      };

      setSelected(normalizedUpdated);
      setStoredDeveloper(normalizedUpdated);
      setIsEditing(false);
      setMessage("Profile successfully updated in database!");
    } catch (err) {
      setMessage(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = selected.name
    ? selected.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()
    : "DS";

  return (
    <Shell>
      <p className="crumb">
        <NavLink to="/developers">Developers</NavLink> / Profile
      </p>

      <section className="profile card">
        <div className="avatar large">{initials}</div>
        <div className="profile-details">
          <b>{selected.role}</b>
          <h1>{selected.name}</h1>
          <small>{selected.location} · Available for collaboration</small>
          <p>{selected.description}</p>
          <div className="profile-actions">
            {!isOwnProfile && (
              <button
                type="button"
                className={connected ? "secondary" : ""}
                onClick={handleConnect}
              >
                {connected ? "✓ Connected" : "+ Connect"}
              </button>
            )}
            {isOwnProfile ? (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel Editing" : "✎ Edit Profile"}
              </button>
            ) : (
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setMessage(`Direct messaging panel for ${selected.name} will be connected to the backend in Phase 4.`)
                }
              >
                Message
              </button>
            )}
          </div>
          {message && <p className="message">{message}</p>}
        </div>
      </section>

      {isEditing && (
        <section className="card" style={{ marginBottom: "24px" }}>
          <h2>Edit Developer Profile</h2>
          <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label>
              Full Name
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </label>
            <label>
              Professional Role / Title
              <input
                type="text"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                required
              />
            </label>
            <label>
              Location
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </label>
            <label>
              Bio / About You
              <textarea
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              />
            </label>
            <label>
              Skills & Technologies (comma separated)
              <input
                type="text"
                value={editForm.skills}
                onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                placeholder="React, Spring Boot, PostgreSQL, Docker"
              />
            </label>
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
              <button type="button" className="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="profile-grid">
        <section className="card profile-about-card">
          <h2>About</h2>
          <p>
            {selected.description} Passionate about writing clean code, building
            performant systems, and collaborating with cross-functional teams.
          </p>

          <h2>Skills & Technologies</h2>
          <div className="tags">
            {selected.skills && selected.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </section>

        <section className="card profile-stats-card">
          <StatsCard
            projectsCount={stats.projectsCount}
            blogsCount={stats.blogsCount}
            connectionsCount={stats.connectionsCount}
          />
          <h2 style={{ marginTop: "24px" }}>Activity Breakdown</h2>
          <ActivityChart
            data={stats.chartData}
            labels={["Projects", "Blogs", "Connections"]}
          />
        </section>
      </div>
    </Shell>
  );
}
