import { useNavigate } from "react-router-dom";
import { Shell } from "../components/layout/Shell";
import { PageIntro } from "../components/layout/PageIntro";
import { SearchBar } from "../components/ui/SearchBar";
import { DeveloperCard } from "../components/cards/DeveloperCard";
import { developers } from "../data/developers";
import { useSearch } from "../hooks/useSearch";
import { useLocalStorage } from "../hooks/useLocalStorage";

export function Developers() {
  const navigate = useNavigate();
  const [, setSelectedDeveloper] = useLocalStorage("selectedDeveloper", null);

  const { query, setQuery, results: filteredDevelopers } = useSearch(
    developers,
    (dev) => `${dev.name} ${dev.role} ${dev.skills.join(" ")} ${dev.location}`
  );

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
        {filteredDevelopers.length > 0 ? (
          filteredDevelopers.map((dev) => (
            <DeveloperCard
              key={dev.name}
              developer={dev}
              onSelect={handleSelectDeveloper}
            />
          ))
        ) : (
          <p className="empty">No developers found matching your search.</p>
        )}
      </section>
    </Shell>
  );
}
