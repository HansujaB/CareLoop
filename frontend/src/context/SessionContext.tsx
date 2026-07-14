import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "@/services/firebase";

type Role = "none" | "admin" | "caregiver";

type SessionState = {
  role: Role;
  firebaseUser: User | null;
  authLoading: boolean;
  profileId: string | null;
  profileName: string;
  caregiverToken: string | null;
  caregiverName: string | null;
  hasOnboarded: boolean;
  setRole: (role: Role) => void;
  setProfile: (profileId: string, name: string) => void;
  setCaregiverToken: (token: string) => void;
  setCaregiverName: (name: string) => void;
  completeOnboarding: () => void;
  resetSession: () => void;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("none");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [caregiverToken, setCaregiverToken] = useState<string | null>(null);
  const [caregiverName, setCaregiverName] = useState<string | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  // Listen to Firebase auth state — sets admin role automatically when signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setFirebaseUser(user);
      if (user) {
        setRole("admin");
      } else if (role === "admin") {
        // User signed out — reset to none (caregivers keep their token-based role)
        setRole("none");
        setProfileId(null);
        setProfileName("");
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<SessionState>(
    () => ({
      role,
      firebaseUser,
      authLoading,
      profileId,
      profileName,
      caregiverToken,
      caregiverName,
      hasOnboarded,
      setRole,
      setProfile: (id, name) => {
        setProfileId(id);
        setProfileName(name);
      },
      setCaregiverToken,
      setCaregiverName,
      completeOnboarding: () => setHasOnboarded(true),
      resetSession: async () => {
        await signOut();
        setRole("none");
        setProfileId(null);
        setProfileName("");
        setCaregiverToken(null);
        setCaregiverName(null);
      },
    }),
    [role, firebaseUser, authLoading, profileId, profileName, caregiverToken, caregiverName, hasOnboarded],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
