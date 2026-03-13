import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { createGroup, getMyGroups, Group } from "../../services/group";
import { ensureMyProfile, Profile } from "../../services/profile.service";

export default function HomeScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingGroup, setCreatingGroup] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const profileResult = await ensureMyProfile();
      const groupsResult = await getMyGroups();

      setProfile(profileResult);
      setGroups(groupsResult);
    } catch (error: any) {
      Alert.alert("Load error", error.message ?? "Failed to load home data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup() {
    if (!groupName.trim()) {
      Alert.alert("Missing name", "Please enter a group name.");
      return;
    }

    try {
      setCreatingGroup(true);
      await createGroup(groupName);
      setGroupName("");
      const updatedGroups = await getMyGroups();
      setGroups(updatedGroups);
    } catch (error: any) {
      Alert.alert("List error", error.message ?? "Failed to create group.");
    } finally {
      setCreatingGroup(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
        backgroundColor: "#fff",
        paddingTop: 60,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
        Home
      </Text>

      <Text style={{ fontSize: 16, color: "#666", marginBottom: 4 }}>
        Signed in as
      </Text>

      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 24 }}>
        {profile?.email ?? "No email"}
      </Text>

      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Create Group
      </Text>

      <TextInput
        value={groupName}
        onChangeText={setGroupName}
        placeholder="e.g. Family, Flatmates, Uni Friends"
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 14,
          fontSize: 16,
          marginBottom: 12,
        }}
      />

      <Pressable
        onPress={handleCreateGroup}
        disabled={creatingGroup}
        style={{
          backgroundColor: creatingGroup ? "#999" : "#111",
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {creatingGroup ? "Creating..." : "Create Group"}
        </Text>
      </Pressable>

      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        My Groups
      </Text>

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: "#666" }}>No groups yet.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(app)/groups/${item.id}`)}
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "600" }}>{item.name}</Text>
            <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
              Tap to open
            </Text>
          </Pressable>
        )}
        style={{ marginBottom: 24 }}
      />

      <Pressable
        onPress={handleSignOut}
        style={{
          backgroundColor: "#111",
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Sign Out</Text>
      </Pressable>
    </View>
  );
}