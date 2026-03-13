import { supabase } from "../lib/supabase";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export async function getMyProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No authenticated user found.");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;

  return data as Profile;
}

export async function ensureMyProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No authenticated user found.");

  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) return existing as Profile;

  const email = user.email ?? null;

  const usernameBase = email
    ? email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "")
    : `user_${user.id.slice(0, 8)}`;

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email,
      username: usernameBase,
      full_name: null,
      avatar_url: null,
    })
    .select()
    .single();

  if (error) throw error;

  return data as Profile;
}