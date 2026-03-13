import { supabase } from "../lib/supabase";

export type ItemClaim = {
  id: string;
  item_id: string;
  claimed_by: string;
  created_at: string;
};

export async function getClaimsForItems(itemIds: string[]) {
  if (!itemIds.length) return [];

  const { data, error } = await supabase
    .from("item_claims")
    .select("*")
    .in("item_id", itemIds);

  if (error) throw error;

  return (data ?? []) as ItemClaim[];
}

export async function claimItem(itemId: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No authenticated user found.");

  const { data, error } = await supabase
    .from("item_claims")
    .insert({
      item_id: itemId,
      claimed_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  return data as ItemClaim;
}

export async function unclaimItem(itemId: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No authenticated user found.");

  const { error } = await supabase
    .from("item_claims")
    .delete()
    .eq("item_id", itemId)
    .eq("claimed_by", user.id);

  if (error) throw error;
}