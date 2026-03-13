import { supabase } from "../lib/supabase";

export type Wishlist = {
  id: string;
  occasion_id: string;
  owner_id: string;
  title: string;
  created_at: string;
};

export type WishlistItem = {
  id: string;
  wishlist_id: string;
  title: string;
  description: string | null;
  product_url: string | null;
  image_url: string | null;
  price_amount: number | null;
  price_currency: string | null;
  created_at: string;
};

export async function getWishlistsForOccasion(occasionId: string) {
  const { data, error } = await supabase
    .from("wishlists")
    .select("*")
    .eq("occasion_id", occasionId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []) as Wishlist[];
}

export async function createMyWishlist(params: {
  occasionId: string;
  title: string;
}) {
  const trimmedTitle = params.title.trim();

  if (!trimmedTitle) {
    throw new Error("Wishlist title is required.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No authenticated user found.");

  const { data: existing, error: existingError } = await supabase
    .from("wishlists")
    .select("*")
    .eq("occasion_id", params.occasionId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing as Wishlist;

  const { data, error } = await supabase
    .from("wishlists")
    .insert({
      occasion_id: params.occasionId,
      owner_id: user.id,
      title: trimmedTitle,
    })
    .select()
    .single();

  if (error) throw error;

  return data as Wishlist;
}

export async function getWishlistItems(wishlistId: string) {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("wishlist_id", wishlistId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as WishlistItem[];
}

export async function addWishlistItem(params: {
  wishlistId: string;
  title: string;
  description?: string | null;
  productUrl?: string | null;
}) {
  const trimmedTitle = params.title.trim();

  if (!trimmedTitle) {
    throw new Error("Item title is required.");
  }

  const { data, error } = await supabase
    .from("wishlist_items")
    .insert({
      wishlist_id: params.wishlistId,
      title: trimmedTitle,
      description: params.description ?? null,
      product_url: params.productUrl ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  return data as WishlistItem;
}