import "server-only";
import { diseases as fallbackDiseases } from "@/lib/demo-data";
import type { DiseaseTopic } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type DatabaseDisease = {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string | null;
  aliases: string[];
};

export async function getDiseaseTopics(): Promise<DiseaseTopic[]> {
  if (!isSupabaseConfigured()) return fallbackDiseases;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("disease_topics")
      .select("id,slug,name_en,name_ar,aliases")
      .is("organization_id", null)
      .order("name_en");
    if (error || !data?.length) return fallbackDiseases;
    return (data as DatabaseDisease[]).flatMap((row) => {
      const authored = fallbackDiseases.find((item) => item.slug === row.slug);
      if (!authored) return [];
      return [{ ...authored, id: row.id, name: row.name_en, arabicName: row.name_ar ?? authored.arabicName, abbreviations: row.aliases }];
    });
  } catch {
    return fallbackDiseases;
  }
}

export async function getDiseaseTopic(slug: string) {
  return (await getDiseaseTopics()).find((item) => item.slug === slug);
}
