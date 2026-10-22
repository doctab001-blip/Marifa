import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ModuleRunner } from "@/components/learning/module-runner";
import { getLearningModule } from "@/lib/learning/catalog";
import { getModuleContent } from "@/lib/learning/content";
import { getCurrentViewer } from "@/lib/supabase/session";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const learningModule = getLearningModule(id);
  return { title: learningModule ? `${learningModule.title} · Learning Portal` : "Learning Portal" };
}

export default async function LearningModulePage({ params }: Props) {
  const { id } = await params;
  const content = getModuleContent(id);
  if (!getLearningModule(id) || !content) notFound();
  const viewer = await getCurrentViewer();
  return <ModuleRunner moduleId={id} content={content} learnerName={viewer?.name ?? null} />;
}
