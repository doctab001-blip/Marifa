import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import replacement from "../data/reviews/acs-user-revision.json";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import { DiseaseDetailSections } from "@/components/disease-detail-sections";
import { clinicalReviewOverrides } from "@/lib/data/clinical-review-overrides";
import emergency from "../data/emergency-versions/acs.emergency-2026-10-12-v2.json";

describe("ACS user revision", () => {
  it("retains pending review; the newer emergency version carries its doses forward unverified", () => {
    const disease = DiseaseDetailSchema.parse(replacement);
    expect(disease.status).toBe("under_review");
    expect(disease.clinicalReviewStatus).toBe("pending");
    expect(disease.medicationPlan?.status).toBe("local-protocol-required");

    const next = DiseaseDetailSchema.parse(emergency);
    expect(clinicalReviewOverrides[next.id]).toBe(next.version);
    expect(next.status).toBe("under_review");
    expect(next.clinicalReviewStatus).toBe("pending");
    expect(next.medicationPlan?.status).toBe("local-protocol-required");
    const names = next.medicationPlan?.regimens.map((r) => r.genericName) ?? [];
    for (const medicine of ["Nitroglycerin", "Ticagrelor", "Clopidogrel", "Enoxaparin", "Unfractionated Heparin (UFH)"]) {
      expect(names).toContain(medicine);
    }
  });

  it("displays investigation timing, all seven treatment entries and the review caveat", () => {
    render(<DiseaseDetailSections disease={DiseaseDetailSchema.parse(replacement)} />);
    expect(screen.getByRole("heading", { name: "Medicines and doses" })).toBeInTheDocument();
    expect(screen.getByText("0.4 mg; Sublingual")).toBeInTheDocument();
    expect(screen.getByText(/maximum 4,000 units/)).toBeInTheDocument();
    expect(screen.getByText(/Must be acquired and interpreted within 10 minutes/)).toBeInTheDocument();
    expect(screen.getByText(/a chest radiograph cannot reliably exclude aortic dissection/)).toBeInTheDocument();
    expect(screen.getByText(/User-supplied replacement — UNREVIEWED DRAFT/)).toBeInTheDocument();
    for (const medicine of ["Supplemental oxygen", "Nitroglycerin", "Aspirin", "Ticagrelor", "Clopidogrel", "Enoxaparin", "Unfractionated Heparin (UFH)"]) {
      expect(screen.getByText(medicine, { exact: true })).toBeInTheDocument();
    }
  });
});
