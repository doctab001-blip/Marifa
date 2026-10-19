import { NextResponse } from "next/server";
import { getApprovedDiseaseGuidelines } from "@/lib/data/disease-guidelines";
import { getDiseaseDrafts } from "@/lib/data/disease-drafts";
import { medicalSpecialities } from "@/lib/medical-specialities";
import { ModelOfCarePillarSchema } from "@/lib/validations/disease";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if (params.get("view") === "drafts") {
    const result = await getDiseaseDrafts();
    if (result.state === "unavailable") return NextResponse.json({ error: "Draft topics unavailable." }, { status: 503 });
    return NextResponse.json({ topics: result.drafts.map(({ id, title, specialty, versionId, version }) => ({ id, title, specialty, versionId, version })) }, { headers: { "Cache-Control": "private, max-age=60" } });
  }
  const speciality = params.get("speciality")?.trim();
  const carePillar = params.get("care_pillar")?.trim();
  if (speciality && !medicalSpecialities.some(({ name }) => name.toLocaleLowerCase() === speciality.toLocaleLowerCase())) {
    return NextResponse.json({ error: "Unsupported speciality filter." }, { status: 400 });
  }
  if (carePillar && !ModelOfCarePillarSchema.safeParse(carePillar).success) {
    return NextResponse.json({ error: "Unsupported care_pillar filter." }, { status: 400 });
  }
  const result = await getApprovedDiseaseGuidelines({ speciality, carePillar });
  if (result.state === "unavailable") return NextResponse.json({ error: "Clinical directory unavailable." }, { status: 503 });
  if (params.get("view") === "nav") {
    // Compact payload for the workspace side panel.
    const topics = result.diseases.map(({ id, title, pillar, speciality, keywords }) => ({ id, title, pillar, speciality, keywords }));
    return NextResponse.json({ topics }, { headers: { "Cache-Control": "private, max-age=60" } });
  }
  return NextResponse.json({ topics: result.diseases, rejectedCount: result.rejectedCount, withheldCount: result.withheldCount });
}
