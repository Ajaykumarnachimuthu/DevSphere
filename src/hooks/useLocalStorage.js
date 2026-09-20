import { useDebugValue, useEffect, useState } from "react";

/**
 * Custom hook for synchronized, dual-compatible localStorage management.
 * Supports both raw strings (from legacy Vanilla JS) and JSON objects/arrays.
 *
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Fallback initial value
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return initialValue;
      try {
        return JSON.parse(stored);
      } catch {
        // Fallback for raw strings written by Vanilla JS (e.g., loggedInUser)
        return stored;
      }
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
        return;
      }
      // For compatibility with Vanilla JS:
      // If the key is 'loggedInUser' or a raw string without JSON structure, store as raw string
      if (typeof value === "string") {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (err) {
      console.warn(`Error updating localStorage key "${key}":`, err);
    }
  }, [key, value]);

  useDebugValue(
    `${key}: ${
      value == null
        ? "empty"
        : Array.isArray(value)
        ? `array(${value.length})`
        : typeof value === "object"
        ? "object"
        : "ready"
    }`
  );

  return [value, setValue];
}
