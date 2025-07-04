import { useEffect, useState } from "react";
import { ThemeProvider } from "./contexts/theme";
import ThemeBtn from "./components/ThemeBtn";
import Card from "./components/Card";

function App() {
  const [themeMode, setThemeMode] = useState("light");
  // since the lightTheme and darkTheme methods are not defined, there is concept in which we can just define these functions here only with the same name
  const lightTheme = () => {
    setThemeMode("light");
  };
  const darkTheme = () => {
    setThemeMode("dark");
  };
  useEffect(() => {
    document.querySelector("html").classList.remove("dark", "light");
    document.querySelector("html").classList.add(themeMode);
  }, [themeMode]);

  return (
    <ThemeProvider value={{ themeMode, lightTheme, darkTheme }}>
      <div className="flex flex-wrap min-h-screen items-center">
        <div className="w-full max-w-sm mx-auto justify-end mb-4">
          {/* Theme btn */}
          <ThemeBtn />
        </div>
        <div className="w-full max-w-sm mx-auto">
          {/* Card */}
          <Card />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
