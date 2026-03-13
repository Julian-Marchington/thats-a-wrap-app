import { supabase } from "../lib/supabase";

export type Occasion = {
  id: string;
  group_id: string;
  title: string;
  type: string;
  event_date: string | null;
  created_by: string;
  created_at: string;
};

export async function getOccasionsForGroup(groupId: string) {
  const { data, error } = await supabase
    .from("occasions")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as Occasion[];
}

export async function createOccasion(params: {
  groupId: string;
  title: string;
  type?: string;
  eventDate?: string | null;
}) {
  const trimmedTitle = params.title.trim();

  if (!trimmedTitle) {
    throw new Error("Occasion title is required.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("No authenticated user found.");

  const { data, error } = await supabase
    .from("occasions")
    .insert({
      group_id: params.groupId,
      title: trimmedTitle,
      type: params.type ?? "custom",
      event_date: params.eventDate ?? null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  return data as Occasion;
}