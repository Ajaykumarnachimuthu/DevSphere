export function Button({ children, className = "", variant = "primary", ...props }) {
  const variantClass = variant === "outline" ? "outline" : variant === "secondary" ? "secondary" : "";
  const combinedClass = [variantClass, className].filter(Boolean).join(" ");
  return (
    <button className={combinedClass} {...props}>
      {children}
    </button>
  );
}
