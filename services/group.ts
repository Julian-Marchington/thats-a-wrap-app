import { supabase } from "../lib/supabase";

export type Group = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
};

export async function createGroup(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Group name is required.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No authenticated user found.");

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: trimmedName,
      owner_id: user.id,
    })
    .select()
    .single();

  if (groupError) throw groupError;

  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    user_id: user.id,
    role: "owner",
  });

  if (memberError) throw memberError;

  return group as Group;
}

export async function getMyGroups() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No authenticated user found.");

  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
      group_id,
      role,
      groups (
        id,
        name,
        owner_id,
        created_at
      )
    `
    )
    .eq("user_id", user.id);

  if (error) throw error;

  return (data ?? [])
    .map((row: any) => row.groups)
    .filter(Boolean) as Group[];
}