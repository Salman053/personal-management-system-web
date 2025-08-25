"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./auth-context";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useFirestoreData } from "@/hooks/use-firebase-date";

// interface AppState {
//   projects: Project[];
//   transactions: Transaction[];
//   habits: Habit[];
//   learning: LearningItem[];
//   loading: boolean;
// }
// src/context/MainContext.js

// Create the context
const MainContext = createContext<any | undefined>(undefined);

// Custom hook to use MainContext safely
const useMainContext = () => {
  const context = useContext(MainContext);
  if (context === undefined) {
    throw new Error("useMainContext must be used within a MainContextProvider");
  }
  return context;
};

// MainContextProvider component
const MainContextProvider = ({ children }: { children: React.ReactNode }) => {
  // State for theme and other global properties
  const [theme, setTheme] = useState("light"); // Possible values: 'light' or 'dark'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar visibility
  const [userPreferences, setUserPreferences] = useState({}); // Example user settings
  const [currentUser, setCurrentUser] = useState<any>({});
  const { user } = useAuth();
  const [isAuthLoading, setIsAuthLoading] = useState(true); // Add auth loading

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //     if (user) {
  //       try {
  //         const ownerRef = doc(db, "users", user.uid);
  //         const ownerSnap = await getDoc(ownerRef);
  //         if (!ownerSnap.exists()) throw new Error("Owner data not found");

  //         const ownerData = ownerSnap.data();

  //         // const tenantRef = doc(db, 'tenants', ownerData.tenantId);
  //         // const tenantSnap = await getDoc(tenantRef);
  //         // const tenantData = tenantSnap.exists() ? tenantSnap.data() : null;

  //         setCurrentUser({
  //           uid: user.uid,
  //           email: user.email,
  //           ownerData,
  //           // tenantData,
  //         });
  //       } catch (error) {
  //         console.error("Error loading user:", error);
  //         setCurrentUser(null);
  //       }
  //     } else {
  //       setCurrentUser(null);
  //     }
  //     setIsAuthLoading(false);
  //   });

  //   return () => unsubscribe();
  // }, []);

  // Toggle theme between 'light' and 'dark'
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const { users, loading, error, projects,projectPayments,habits,finances ,learning} = useFirestoreData(
    user?.uid || ""
  );
  // Define the values to provide through context
  const contextValue = {
    theme,
    projects,
    finances,
    projectPayments,
    habits,
    toggleTheme,
    isSidebarOpen,
    currentUser,
    learning,
    setCurrentUser,
    isAuthLoading,
    toggleSidebar,
    userPreferences,
    setUserPreferences,
    users,
    loading,
    error,
    // Add other global state or actions here
  };

  return (
    <MainContext.Provider value={contextValue}>{children}</MainContext.Provider>
  );
};

export { MainContextProvider, useMainContext };
