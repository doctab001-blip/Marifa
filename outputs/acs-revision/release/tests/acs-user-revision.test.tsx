import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import replacement from "../data/reviews/acs-user-revision.json";
import { DiseaseDetailSchema } from "@/lib/validations/disease";
import { DiseaseDetailSections } from "@/components/disease-detail-sections";
import { clinicalReviewOverrides } from "@/lib/data/clinical-review-overrides";

describe("ACS user revision", () => {
  it("retains pending review and selects the exact new version", () => {
    const disease = DiseaseDetailSchema.parse(replacement);
    expect(disease.status).toBe("under_review");
    expect(disease.clinicalReviewStatus).toBe("pending");
    expect(clinicalReviewOverrides[disease.id]).toBe(disease.version);
    expect(disease.medicationPlan?.status).toBe("local-protocol-required");
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
