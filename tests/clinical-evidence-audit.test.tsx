import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClinicalEvidenceAudit } from "@/components/clinical-evidence-audit";
import { approvalErrorCode } from "@/lib/approval-errors";

describe("Clinical evidence review", () => {
  it("shows unresolved evidence and does not claim Medscape derivation", () => {
    render(<ClinicalEvidenceAudit audit={{ checkedOn: "2026-10-11", status: "incomplete", scope: "Acute asthma treatment is outside NG245 scope", findings: ["The chronic guideline does not verify acute rescue doses"], unverifiedSections: ["Rescue prescribing"], medscapeStatus: "unavailable", originalVersionIds: ["11111111-1111-4111-8111-111111111111"] }} />);
    expect(screen.getByText(/Evidence audit incomplete/)).toBeInTheDocument();
    expect(screen.getByText(/Rescue prescribing/)).toBeInTheDocument();
    expect(screen.getByText(/Medscape derivation has not been established/)).toBeInTheDocument();
  });

  it("distinguishes stale requests from access and deployment failures", () => {
    expect(approvalErrorCode("22023")).toBe("approval_stale");
    expect(approvalErrorCode("42501")).toBe("approval_access");
    expect(approvalErrorCode("40001")).toBe("approval_changed");
    expect(approvalErrorCode("PGRST202")).toBe("approval_configuration");
  });
});
