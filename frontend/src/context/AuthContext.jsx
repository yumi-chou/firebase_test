import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(true); 

  const openAuth = useCallback((mode = "login") => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const profile = {
        id: fbUser.uid,
        name:
          fbUser.displayName ||
          (fbUser.email ? fbUser.email.split("@")[0] : "未命名使用者"),
        email: fbUser.email,
      };
      setUser(profile);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const actions = useMemo(
    () => ({
      async register({ name, email, password }) {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        if (name && cred.user) {
          await updateProfile(cred.user, { displayName: name });
        }

        return cred.user;
      },

      async login({ email, password }) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = cred.user;

        const profile = {
          id: fbUser.uid,
          name:
            fbUser.displayName ||
            (fbUser.email ? fbUser.email.split("@")[0] : "未命名使用者"),
          email: fbUser.email,
        };
        setUser(profile);
        return profile;
      },

      async logout() {
        await signOut(auth);
        setUser(null);
      },
    }),
    []
  );

  const value = {
    user,
    setUser,
    loading,
    authOpen,
    authMode,
    openAuth,
    closeAuth,
    ...actions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
