import { createContext, useContext, useMemo, useState } from "react";

type Role = "none" | "admin" | "caregiver";

type SessionState = {
  role: Role;
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
  const [role, setRole] = useState<Role>("none");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [caregiverToken, setCaregiverToken] = useState<string | null>(null);
  const [caregiverName, setCaregiverName] = useState<string | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  const value = useMemo<SessionState>(
    () => ({
      role,
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
      resetSession: () => {
        setRole("none");
        setProfileId(null);
        setProfileName("");
        setCaregiverToken(null);
        setCaregiverName(null);
      },
    }),
    [role, profileId, profileName, caregiverToken, caregiverName, hasOnboarded],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
