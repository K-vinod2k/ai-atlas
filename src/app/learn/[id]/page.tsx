import { redirect } from "next/navigation";
import { getNodeById } from "@/data/taxonomy";

interface LearnNodePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return [{ id: "ai" }];
}

export default async function LearnNodePage({ params }: LearnNodePageProps) {
  const { id } = await params;
  const indexed = getNodeById(id);
  if (!indexed) {
    redirect("/learn");
  }
  redirect(`/learn?node=${id}`);
}
