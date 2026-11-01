import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { PageIntro } from "../components/layout/PageIntro";
import { SearchBar } from "../components/ui/SearchBar";
import { DeveloperCard } from "../components/cards/DeveloperCard";
import { DeveloperCardSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { developersApi } from "../services/api";

export function Developers() {
  const navigate = useNavigate();
  const [, setSelectedDeveloper] = useLocalStorage("selectedDeveloper", null);
  const [query, setQuery] = useState("");
  const [developersList, setDevelopersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDevs = async () => {
      setLoading(true);
      try {
        const res = await developersApi.getAll({ query });
        if (isMounted) {
          if (res?.content && Array.isArray(res.content)) {
            const mapped = res.content.map((d) => ({
              ...d,
              description: d.bio || d.description || "",
              skills: Array.isArray(d.skills) ? d.skills : Array.from(d.skills || []),
            }));
            setDevelopersList(mapped);
          } else {
            setDevelopersList([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setDevelopersList([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(fetchDevs, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelectDeveloper = (dev) => {
    setSelectedDeveloper(dev);
    navigate("/developer-profile");
  };

  return (
    <Shell>
      <PageIntro
        title="Discover developers"
        text="Connect, learn and collaborate with talented engineers across the globe."
      />

      <div className="center-search">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by developer name, role, or tech stack..."
          label="Search developers"
        />
      </div>

      <section className="card-grid">
        {loading ? (
          <>
            <DeveloperCardSkeleton />
            <DeveloperCardSkeleton />
            <DeveloperCardSkeleton />
            <DeveloperCardSkeleton />
            <DeveloperCardSkeleton />
            <DeveloperCardSkeleton />
          </>
        ) : developersList.length > 0 ? (
          developersList.map((dev) => (
            <DeveloperCard
              key={dev.id || dev.name}
              developer={dev}
              onSelect={handleSelectDeveloper}
            />
          ))
        ) : (
          <EmptyState
            title="No developers found"
            description={
              query
                ? `No developers found matching "${query}". Try searching by a language or role.`
                : "No registered developers found at this time."
            }
            actionLabel={query ? "Clear search" : undefined}
            onAction={query ? () => setQuery("") : undefined}
          />
        )}
      </section>
    </Shell>
  );
}
