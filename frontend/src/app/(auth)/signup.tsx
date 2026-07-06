import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { Logo } from "@/components/Logo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TextField } from "@/components/ui/TextField";
import { useSession } from "@/context/SessionContext";
import { colors, spacing, typography } from "@/constants/theme";

export default function SignupScreen() {
  const { setRole } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const createAccount = () => {
    setRole("admin");
    router.replace("/(admin)/create-profile");
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <Logo />
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>For parents and adult children managing care.</Text>
      </View>

      <View style={styles.form}>
        <TextField label="Full name" value={name} onChangeText={setName} placeholder="Priya Sharma" />
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
        <PrimaryButton
          label="Create account"
          onPress={createAccount}
          icon={<Ionicons name="person-add-outline" size={18} color={colors.white} />}
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
    padding: spacing.lg,
    justifyContent: "center",
    gap: spacing.xl,
  },
  header: { gap: spacing.sm },
  title: { ...typography.h1, color: colors.text, marginTop: spacing.md },
  subtitle: { ...typography.body, color: colors.textSecondary },
  form: { gap: spacing.md },
  footer: { ...typography.bodySmall, color: colors.textSecondary, textAlign: "center" },
  link: { color: colors.primary, fontWeight: "600" },
});
