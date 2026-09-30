import { THEME_STORAGE_KEY } from "@/lib/theme/theme-constants";

export const themeInitializerScript = `
(function() {
  try {
    var storageKey = "${THEME_STORAGE_KEY}";
    var theme = window.localStorage.getItem(storageKey) || "system";
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;
    document.documentElement.classList.toggle("dark", resolved === "dark");
    document.documentElement.style.colorScheme = resolved;
  } catch (_) {}
})();
`;
