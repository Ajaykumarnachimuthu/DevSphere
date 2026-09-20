import { forwardRef } from "react";

export const FormInput = forwardRef(function FormInput(
  { label, error, ...props },
  ref
) {
  return (
    <label>
      {label}
      <input ref={ref} {...props} />
      {error && <small className="input-error">{error}</small>}
    </label>
  );
});
