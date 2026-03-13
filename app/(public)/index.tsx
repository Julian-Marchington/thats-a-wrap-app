import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function WelcomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 12 }}>
        That’s A Wrap
      </Text>

      <Text
        style={{
          fontSize: 16,
          textAlign: "center",
          color: "#666",
          marginBottom: 24,
        }}
      >
        Gift lists that people actually use.
      </Text>

      <Pressable
        onPress={() => router.push("/(public)/sign-in")}
        style={{
          backgroundColor: "#111",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Get Started</Text>
      </Pressable>
    </View>
  );
}