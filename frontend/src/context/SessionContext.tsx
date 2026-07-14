import { createContext, useContext, useEffect, useMemo, useState } from "react";
// Static import — dynamic import() of native modules does not work in Metro bundler.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, signOut, type User } from "@/services/firebase";
import { api } from "@/services/api";

type Role = "none" | "admin" | "caregiver";

type SessionState = {
  role: Role;
  firebaseUser: User | null;
  authLoading: boolean;
  profileId: string | null;
  profileName: string;
  profileLoading: boolean;
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

// Module-level helpers — stable references, no closure issues
async function _persistProfile(id: string, name: string) {
  try {
    await AsyncStorage.multiSet([
      ["profileId", id],
      ["profileName", name],
    ]);
  } catch (e) {
    console.warn("[Session] AsyncStorage write failed:", e);
  }
}

async function _clearProfile() {
  try {
    await AsyncStorage.multiRemove(["profileId", "profileName"]);
  } catch { /* ignore */ }
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>("none");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [caregiverToken, setCaregiverToken] = useState<string | null>(null);
  const [caregiverName, setCaregiverName] = useState<string | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  // 1. Restore profileId from AsyncStorage on mount (static import — works reliably)
  useEffect(() => {
    AsyncStorage.multiGet(["profileId", "profileName"])
      .then(([[, id], [, name]]) => {
        if (id) {
          setProfileId(id);
          setProfileName(name ?? "");
        }
      })
      .catch((e) => console.warn("[Session] AsyncStorage read failed:", e))
      .finally(() => setProfileLoading(false));
  }, []);

  // 2. Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setFirebaseUser(user);
      if (user) {
        setRole("admin");
      } else if (role === "admin") {
        setRole("none");
        setProfileId(null);
        setProfileName("");
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. UID-based recovery: if auth resolved + storage loaded + still no profile,
  //    try fetching the existing profile from the backend by Firebase UID.
  //    This handles app reinstalls or AsyncStorage wipes without losing data.
  useEffect(() => {
    if (!firebaseUser || authLoading || profileLoading || profileId) return;
    api.getProfileByUid(firebaseUser.uid)
      .then((profile) => {
        if (profile?.profile_id) {
          setProfileId(profile.profile_id);
          setProfileName(profile.name);
          _persistProfile(profile.profile_id, profile.name);
        }
      })
      .catch(() => { /* no profile found — user will go to create-profile */ });
  }, [firebaseUser, authLoading, profileLoading, profileId]);

  const value = useMemo<SessionState>(
    () => ({
      role,
      firebaseUser,
      authLoading,
      profileId,
      profileName,
      profileLoading,
      caregiverToken,
      caregiverName,
      hasOnboarded,
      setRole,
      setProfile: (id, name) => {
        setProfileId(id);
        setProfileName(name);
        _persistProfile(id, name); // fire-and-forget — in-memory state updates immediately
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
        await _clearProfile();
      },
    }),
    [role, firebaseUser, authLoading, profileId, profileName, profileLoading, caregiverToken, caregiverName, hasOnboarded],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
