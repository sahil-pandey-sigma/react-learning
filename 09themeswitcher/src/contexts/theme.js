import { createContext, useContext } from "react";

export const ThemeContext = createContext({
  themeMode: "light",
  darkTheme: () => {},
  lightTheme: () => {},
});

export const ThemeProvider = ThemeContext.Provider;
// Now instead of making a new jsx file for provider we are now making the file in the context file only.

// here we are making our custom hook for preventing two imports in files that is  ThemeContext and useContext, now we can do only on import that is useTheme

export default function useTheme() {
  return useContext(ThemeContext);
}
