import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { Logo } from "@/components/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/context/SessionContext";
import { colors, spacing, typography } from "@/constants/theme";

export default function LoginScreen() {
  const { setRole } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signInAsParent = () => {
    setRole("admin");
    router.replace("/(admin)");
  };

  const continueAsCaregiver = () => {
    setRole("caregiver");
    router.replace("/(caregiver)/welcome");
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Logo />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to manage care profiles and share links.</Text>
      </View>

      <View style={styles.form}>
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
          placeholder="••••••••"
        />
        <PrimaryButton
          label="Sign in as parent"
          onPress={signInAsParent}
          icon={<Ionicons name="log-in-outline" size={18} color={colors.white} />}
        />
        <SecondaryButton
          label="I'm a caregiver (link access)"
          onPress={continueAsCaregiver}
          icon={<Ionicons name="link-outline" size={18} color={colors.text} />}
        />
      </View>

      <Text style={styles.footer}>
        New here?{" "}
        <Link href="/(auth)/signup" style={styles.link}>
          Create account
        </Link>
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: "center",
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
  },
  footer: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
  link: {
    color: colors.primary,
    fontWeight: "600",
  },
});
