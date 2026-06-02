export function localHostActive() { 
    return typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
}

export const getLocalValue = <T,>(key: string, defaultValue: T): T => {
    if (!localHostActive()) return defaultValue;
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved) as T;
      } catch (e) {
        console.error(`Error parsing localStorage key "${key}":`, e);
        return defaultValue;
      }
    }
    return defaultValue;
  };