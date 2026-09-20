import { useRef } from "react";

export function SearchBar({ value, onChange, placeholder = "Search...", label = "Search" }) {
  const inputRef = useRef(null);

  return (
    <div className="center-search">
      <input
        ref={inputRef}
        aria-label={label || placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            inputRef.current?.blur();
          }
        }}
      />
    </div>
  );
}
