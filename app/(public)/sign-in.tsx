import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { supabase } from "../../lib/supabase";

const redirectTo = Linking.createURL("sign-in");
console.log("redirectTo =", redirectTo);

async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) {
    throw new Error(errorCode);
  }

  const access_token = params.access_token;
  const refresh_token = params.refresh_token;

  if (!access_token || !refresh_token) return;

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) throw error;
}

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sub = Linking.addEventListener("url", async ({ url }) => {
      try {
        await createSessionFromUrl(url);
      } catch (err: any) {
        Alert.alert("Login failed", err.message ?? "Could not complete login.");
      }
    });

    Linking.getInitialURL().then(async (url) => {
      if (!url) return;
      try {
        await createSessionFromUrl(url);
      } catch {
        // ignore for now
      }
    });

    return () => sub.remove();
  }, []);

  async function handleSignIn() {
    if (!email.trim()) {
      Alert.alert("Missing email", "Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) throw error;

      Alert.alert(
        "Check your email",
        "We sent you a magic link to sign in."
      );
    } catch (error: any) {
      Alert.alert("Sign-in failed", error.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 12 }}>
        Sign In
      </Text>

      <Text style={{ fontSize: 16, color: "#666", marginBottom: 24 }}>
        Enter your email and we’ll send you a magic link.
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 14,
          fontSize: 16,
          marginBottom: 16,
        }}
      />

      <Pressable
        onPress={handleSignIn}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#999" : "#111",
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {loading ? "Sending..." : "Send Magic Link"}
        </Text>
      </Pressable>
    </View>
  );
}