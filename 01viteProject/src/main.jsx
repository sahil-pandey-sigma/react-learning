import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

/*const reactElement = {
  type: "a",
  props: {
    href: "https://www.google.com/",
    target: "_blank",
  },
  children: "Click me to visit google",
}; */
// const anotherElement = "Hello";
// const reactElement = React.createElement(
//   "a",
//   { href: "https://www.google.com/", target: "_blank" },
//   "Click Me",
//   anotherElement
// );

createRoot(document.getElementById("root")).render(
  // reactElement
  // // passing a object not a function
  <App />
  // reactElement
);
