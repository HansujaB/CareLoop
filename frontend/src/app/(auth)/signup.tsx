import Ionicons from "@/components/Ionicons";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { Logo } from "@/components/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { signUp } from "@/services/firebase";
import { colors, spacing, typography } from "@/constants/theme";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAccount = async () => {
    if (!name.trim() || !email.trim() || password.length < 8) {
      setError("Please fill in all fields. Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUp(email.trim(), password, name.trim());
      // onAuthStateChanged in SessionContext sets role to "admin" automatically
      router.replace("/(admin)/create-profile");
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      if (msg.includes("email-already-in-use")) {
        setError("An account with this email already exists. Sign in instead.");
      } else if (msg.includes("invalid-email")) {
        setError("Please enter a valid email address.");
      } else if (msg.includes("weak-password")) {
        setError("Password must be at least 8 characters.");
      } else {
        setError("Account creation failed. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Logo centred above the form — no title text */}
      <View style={styles.logoWrap}>
        <Logo height={60} />
      </View>

      <View style={styles.form}>
        <TextField label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@email.com"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 8 characters"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <PrimaryButton
          label={loading ? "Creating account…" : "Create account"}
          onPress={createAccount}
          icon={
            loading
              ? <ActivityIndicator size="small" color={colors.white} />
              : <Ionicons name="person-add-outline" size={18} color={colors.white} />
          }
        />
      </View>

      <Text style={styles.footer}>
        Already have an account?{" "}
        <Link href="/(auth)/login" style={styles.link}>
          Sign in
        </Link>
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
    gap: spacing.xl,
  },
  logoWrap: {
    alignItems: "center",
    paddingBottom: spacing.sm,
  },
  form: { gap: spacing.md },
  errorText: { ...typography.bodySmall, color: colors.danger },
  footer: { ...typography.bodySmall, color: colors.textSecondary, textAlign: "center" },
  link: { color: colors.primary, fontWeight: "600" },
});
