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
import { getMyGroups } from "../../../services/group";
import { getOccasionsForGroup, Occasion } from "../../../services/occasion";
import {
    createMyWishlist,
    getWishlistsForOccasion,
    Wishlist,
} from "../../../services/wishlist";

export default function OccasionDetailScreen() {
  const { occasionId } = useLocalSearchParams<{ occasionId: string }>();

  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [wishlistTitle, setWishlistTitle] = useState("My Wishlist");
  const [loading, setLoading] = useState(true);
  const [creatingWishlist, setCreatingWishlist] = useState(false);

  useEffect(() => {
    if (!occasionId) return;
    loadData();
  }, [occasionId]);

  async function loadData() {
    try {
      setLoading(true);

      const groups = await getMyGroups();
      let foundOccasion: Occasion | null = null;

      for (const group of groups) {
        const occasions = await getOccasionsForGroup(group.id);
        const match = occasions.find((o) => o.id === occasionId);
        if (match) {
          foundOccasion = match;
          break;
        }
      }

      setOccasion(foundOccasion);

      const wishlistResults = await getWishlistsForOccasion(occasionId);
      setWishlists(wishlistResults);
    } catch (error: any) {
      Alert.alert("Load error", error.message ?? "Failed to load occasion.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateWishlist() {
    if (!occasionId) return;

    try {
      setCreatingWishlist(true);
      await createMyWishlist({
        occasionId,
        title: wishlistTitle,
      });

      const updated = await getWishlistsForOccasion(occasionId);
      setWishlists(updated);
    } catch (error: any) {
      Alert.alert(
        "Wishlist error",
        error.message ?? "Failed to create wishlist."
      );
    } finally {
      setCreatingWishlist(false);
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
        {occasion?.title ?? "Occasion"}
      </Text>

      <Text style={{ fontSize: 16, color: "#666", marginBottom: 24 }}>
        Wishlists
      </Text>

      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Create My Wishlist
      </Text>

      <TextInput
        value={wishlistTitle}
        onChangeText={setWishlistTitle}
        placeholder="My Wishlist"
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
        onPress={handleCreateWishlist}
        disabled={creatingWishlist}
        style={{
          backgroundColor: creatingWishlist ? "#999" : "#111",
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {creatingWishlist ? "Creating..." : "Create My Wishlist"}
        </Text>
      </Pressable>

      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Wishlist List
      </Text>

      <FlatList
        data={wishlists}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: "#666" }}>No wishlists yet.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(app)/wishlists/${item.id}`)}
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
              Tap to open
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}