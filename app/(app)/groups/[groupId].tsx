import { router, useLocalSearchParams } from "expo-router";
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
import { getMyGroups, Group } from "../../../services/group";
import {
    createOccasion,
    getOccasionsForGroup,
    Occasion,
} from "../../../services/occasion";

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();

  const [group, setGroup] = useState<Group | null>(null);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [occasionTitle, setOccasionTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [creatingOccasion, setCreatingOccasion] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    loadData();
  }, [groupId]);

  async function loadData() {
    try {
      setLoading(true);

      const groups = await getMyGroups();
      const foundGroup = groups.find((g) => g.id === groupId) ?? null;
      setGroup(foundGroup);

      const occasionsResult = await getOccasionsForGroup(groupId);
      setOccasions(occasionsResult);
    } catch (error: any) {
      Alert.alert("Load error", error.message ?? "Failed to load group.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOccasion() {
    if (!groupId) return;

    if (!occasionTitle.trim()) {
      Alert.alert("Missing title", "Please enter an occasion title.");
      return;
    }

    try {
      setCreatingOccasion(true);
      await createOccasion({
        groupId,
        title: occasionTitle,
      });
      setOccasionTitle("");
      const updated = await getOccasionsForGroup(groupId);
      setOccasions(updated);
    } catch (error: any) {
      Alert.alert(
        "Occasion error",
        error.message ?? "Failed to create occasion."
      );
    } finally {
      setCreatingOccasion(false);
    }
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
        paddingTop: 60,
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
        {group?.name ?? "Group"}
      </Text>

      <Text style={{ fontSize: 16, color: "#666", marginBottom: 24 }}>
        Occasions
      </Text>

      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Create Occasion
      </Text>

      <TextInput
        value={occasionTitle}
        onChangeText={setOccasionTitle}
        placeholder="e.g. Christmas 2026"
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
        onPress={handleCreateOccasion}
        disabled={creatingOccasion}
        style={{
          backgroundColor: creatingOccasion ? "#999" : "#111",
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {creatingOccasion ? "Creating..." : "Create Occasion"}
        </Text>
      </Pressable>

      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Occasion List
      </Text>

      <FlatList
        data={occasions}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: "#666" }}>No occasions yet.</Text>
        }
        renderItem={({ item }) => (
        <Pressable
            onPress={() =>
            router.push({
                pathname: "/(app)/occasions/[occasionId]",
                params: { occasionId: item.id },
            })
            }
            style={{
            borderWidth: 1,
            borderColor: "#eee",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            }}
        >
            <Text style={{ fontSize: 17, fontWeight: "600" }}>{item.title}</Text>
            <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
            Type: {item.type}
            </Text>
            <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
            Tap to open
            </Text>
        </Pressable>
        )}
      />
    </View>
  );
}