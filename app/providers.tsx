"use client";

import { createContext } from "react";
export const ThemeContext = createContext({ theme: "dark" });

const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeContext.Provider value={{ theme: "dark" }}>
    {children}
  </ThemeContext.Provider>
);
export default Providers;
