import React from "react";

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  disabled = false,
  type = "button",
  ...props
}) {
  const variantClass =
    variant === "outline"
      ? "btn-outline"
      : variant === "secondary"
      ? "btn-secondary"
      : variant === "ghost"
      ? "btn-ghost"
      : variant === "danger"
      ? "btn-danger"
      : "btn-primary";

  const sizeClass = size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "";
  const combinedClass = [
    variantClass,
    sizeClass,
    fullWidth ? "btn-full" : "",
    isLoading ? "btn-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={combinedClass}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && (
        <span className="btn-spinner" aria-hidden="true" />
      )}
      <span className="btn-text">{children}</span>
    </button>
  );
}
