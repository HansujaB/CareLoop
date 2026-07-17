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
  profileRecovering: boolean;  // true while Firestore UID lookup is in-flight
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
  const [profileRecovering, setProfileRecovering] = useState(false);
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
        // User signed out — wipe everything including the persisted profile
        setRole("none");
        setProfileId(null);
        setProfileName("");
        _clearProfile();
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. UID-based recovery: whenever a Firebase user is present and auth/storage
  //    have both finished loading, check whether the cached profileId actually
  //    belongs to this user.  If it doesn't (different account on same device),
  //    wipe the stale cache and recover the correct profile from the backend.
  useEffect(() => {
    if (!firebaseUser || authLoading || profileLoading) return;

    setProfileRecovering(true);
    api.getProfileByUid(firebaseUser.uid)
      .then((profile) => {
        if (profile?.profile_id) {
          // Only update if the recovered profile differs from what's in state
          // (avoids a redundant re-render on normal app restarts)
          if (profile.profile_id !== profileId) {
            setProfileId(profile.profile_id);
            setProfileName(profile.name);
            _persistProfile(profile.profile_id, profile.name);
          }
        } else {
          // No profile found for this UID — clear any stale cached profile
          // so the user is routed to create-profile
          if (profileId) {
            setProfileId(null);
            setProfileName("");
            _clearProfile();
          }
        }
      })
      .catch(() => {
        // Network error — keep whatever is in state; user can retry
      })
      .finally(() => setProfileRecovering(false));
  // Re-run whenever the logged-in user changes — this is the key fix:
  // switching accounts re-runs the check and replaces the stale profileId.
  }, [firebaseUser, authLoading, profileLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<SessionState>(
    () => ({
      role,
      firebaseUser,
      authLoading,
      profileId,
      profileName,
      profileLoading,
      profileRecovering,
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
        // Clear in-memory state first so nothing stale is visible during sign-out
        setProfileId(null);
        setProfileName("");
        setCaregiverToken(null);
        setCaregiverName(null);
        setRole("none");
        setProfileRecovering(false);
        await _clearProfile();
        await signOut();
      },
    }),
    [role, firebaseUser, authLoading, profileId, profileName, profileLoading, profileRecovering, caregiverToken, caregiverName, hasOnboarded],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
