import { useLocalSearchParams } from "expo-router";
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
import { supabase } from "../../../lib/supabase";
import {
    claimItem,
    getClaimsForItems,
    ItemClaim,
    unclaimItem,
} from "../../../services/claim";
import { getMyGroups } from "../../../services/group";
import { getOccasionsForGroup } from "../../../services/occasion";
import {
    addWishlistItem,
    getWishlistItems,
    getWishlistsForOccasion,
    Wishlist,
    WishlistItem,
} from "../../../services/wishlist";

export default function WishlistDetailScreen() {
  const { wishlistId } = useLocalSearchParams<{ wishlistId: string }>();

  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [claims, setClaims] = useState<ItemClaim[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [itemTitle, setItemTitle] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!wishlistId) return;
    loadData();
  }, [wishlistId]);

  async function loadData() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? null);

      const groups = await getMyGroups();
      let foundWishlist: Wishlist | null = null;

      for (const group of groups) {
        const occasions = await getOccasionsForGroup(group.id);

        for (const occasion of occasions) {
          const wishlists = await getWishlistsForOccasion(occasion.id);
          const match = wishlists.find((w) => w.id === wishlistId);
          if (match) {
            foundWishlist = match;
            break;
          }
        }

        if (foundWishlist) break;
      }

      setWishlist(foundWishlist);

      const itemResults = await getWishlistItems(wishlistId);
      setItems(itemResults);

      const claimResults = await getClaimsForItems(itemResults.map((i) => i.id));
      setClaims(claimResults);
    } catch (error: any) {
      Alert.alert("Load error", error.message ?? "Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddItem() {
    if (!wishlistId) return;

    if (!itemTitle.trim()) {
      Alert.alert("Missing title", "Please enter an item title.");
      return;
    }

    try {
      setAddingItem(true);
      await addWishlistItem({
        wishlistId,
        title: itemTitle,
        productUrl: itemUrl || null,
      });

      setItemTitle("");
      setItemUrl("");

      const updatedItems = await getWishlistItems(wishlistId);
      setItems(updatedItems);

      const updatedClaims = await getClaimsForItems(updatedItems.map((i) => i.id));
      setClaims(updatedClaims);
    } catch (error: any) {
      Alert.alert("Item error", error.message ?? "Failed to add item.");
    } finally {
      setAddingItem(false);
    }
  }

  async function handleClaim(itemId: string) {
    try {
      setBusyItemId(itemId);
      await claimItem(itemId);

      const updatedClaims = await getClaimsForItems(items.map((i) => i.id));
      setClaims(updatedClaims);
    } catch (error: any) {
      Alert.alert("Claim error", error.message ?? "Failed to claim item.");
    } finally {
      setBusyItemId(null);
    }
  }

  async function handleUnclaim(itemId: string) {
    try {
      setBusyItemId(itemId);
      await unclaimItem(itemId);

      const updatedClaims = await getClaimsForItems(items.map((i) => i.id));
      setClaims(updatedClaims);
    } catch (error: any) {
      Alert.alert("Claim error", error.message ?? "Failed to unclaim item.");
    } finally {
      setBusyItemId(null);
    }
  }

  function getClaimForItem(itemId: string) {
    return claims.find((claim) => claim.item_id === itemId) ?? null;
  }

  const isOwner = wishlist?.owner_id === currentUserId;

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
        {wishlist?.title ?? "Wishlist"}
      </Text>

      <Text style={{ fontSize: 16, color: "#666", marginBottom: 24 }}>
        Gift items
      </Text>

      {isOwner ? (
        <>
          <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
            Add Item
          </Text>

          <TextInput
            value={itemTitle}
            onChangeText={setItemTitle}
            placeholder="e.g. Sony headphones"
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

          <TextInput
            value={itemUrl}
            onChangeText={setItemUrl}
            placeholder="Optional product link"
            autoCapitalize="none"
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
            onPress={handleAddItem}
            disabled={addingItem}
            style={{
              backgroundColor: addingItem ? "#999" : "#111",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 28,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              {addingItem ? "Adding..." : "Add Item"}
            </Text>
          </Pressable>
        </>
      ) : null}

      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Items
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ color: "#666" }}>No items yet.</Text>}
        renderItem={({ item }) => {
          const claim = getClaimForItem(item.id);
          const claimedByMe = claim?.claimed_by === currentUserId;
          const isClaimed = !!claim;

          return (
            <View
              style={{
                borderWidth: 1,
                borderColor: "#eee",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: "600" }}>{item.title}</Text>

              {item.product_url ? (
                <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
                  {item.product_url}
                </Text>
              ) : null}

              <Text style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
                {isClaimed
                  ? claimedByMe
                    ? "Claimed by you"
                    : "Claimed"
                  : "Unclaimed"}
              </Text>

              {!isOwner ? (
                claimedByMe ? (
                  <Pressable
                    onPress={() => handleUnclaim(item.id)}
                    disabled={busyItemId === item.id}
                    style={{
                      backgroundColor: "#444",
                      paddingVertical: 12,
                      borderRadius: 10,
                      alignItems: "center",
                      marginTop: 12,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      {busyItemId === item.id ? "Working..." : "Unclaim"}
                    </Text>
                  </Pressable>
                ) : !isClaimed ? (
                  <Pressable
                    onPress={() => handleClaim(item.id)}
                    disabled={busyItemId === item.id}
                    style={{
                      backgroundColor: "#111",
                      paddingVertical: 12,
                      borderRadius: 10,
                      alignItems: "center",
                      marginTop: 12,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      {busyItemId === item.id ? "Working..." : "Claim"}
                    </Text>
                  </Pressable>
                ) : null
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}