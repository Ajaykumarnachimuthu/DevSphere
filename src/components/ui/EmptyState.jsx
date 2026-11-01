import React from "react";
import { Button } from "./Button";

export function EmptyState({
  icon,
  title = "No results found",
  description = "Try adjusting your search query or filters to find what you are looking for.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">
        {icon || (
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        )}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction} style={{ marginTop: "16px" }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

