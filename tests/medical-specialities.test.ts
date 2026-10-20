import { describe, expect, it } from "vitest";
import { UNASSIGNED_SPECIALITY, canonicalSpeciality, groupBySpeciality, medicalSpecialities, specialityCounts } from "@/lib/medical-specialities";

describe("canonicalSpeciality", () => {
  it("files a topic under the first speciality named, not under its setting", () => {
    expect(canonicalSpeciality("Nephrology / Emergency Medicine")).toBe("Nephrology");
    expect(canonicalSpeciality("Emergency Medicine and Cardiology")).toBe("Emergency Medicine");
    expect(canonicalSpeciality("Primary Care / Endocrinology")).toBe("Primary Care");
    expect(canonicalSpeciality("Gynaecology / Primary Care")).toBe("Obstetrics and Gynecology");
  });
  it("folds spelling and wording variants into one name", () => {
    for (const text of ["Obstetrics", "Obstetrics / Fetal Medicine", "Maternal-Fetal Medicine", "Gynaecology", "Obstetrics and Gynecology / Emergency Medicine"]) {
      expect(canonicalSpeciality(text), text).toBe("Obstetrics and Gynecology");
    }
    expect(canonicalSpeciality("Respiratory Medicine / Primary Care")).toBe("Pulmonology");
    expect(canonicalSpeciality("Respiratory medicine")).toBe("Pulmonology");
    expect(canonicalSpeciality("Emergency medicine")).toBe("Emergency Medicine");
    expect(canonicalSpeciality("Medical Oncology, Breast Surgery and Radiation Oncology")).toBe("Oncology");
    expect(canonicalSpeciality("Orthopaedics")).toBe("Orthopedics and Trauma");
  });
  it("places the specialities that used to be one-off labels", () => {
    expect(canonicalSpeciality("Hepatology / Infectious Diseases")).toBe("Gastroenterology");
    expect(canonicalSpeciality("Bariatric / Metabolic Surgery")).toBe("General Surgery");
    expect(canonicalSpeciality("Colorectal Surgery / Oncology")).toBe("General Surgery");
    expect(canonicalSpeciality("Palliative Medicine / Neurology")).toBe("Palliative Medicine");
    expect(canonicalSpeciality("Geriatrics / Primary Care")).toBe("Geriatric Medicine");
    expect(canonicalSpeciality("Toxicology / Emergency Medicine")).toBe("Toxicology");
    expect(canonicalSpeciality("Vascular Surgery / General Surgery / Emergency Medicine")).toBe("Vascular Surgery");
    expect(canonicalSpeciality("Neurosurgery / Orthopaedics / Emergency Medicine")).toBe("Neurosurgery");
    expect(canonicalSpeciality("Emergency Medicine and Allergy and Immunology")).toBe("Emergency Medicine");
    expect(canonicalSpeciality("Family Medicine / Public Health")).toBe("Primary Care");
    expect(canonicalSpeciality("Public Health / Genetics / Paediatrics")).toBe("Public Health");
  });
  it("uses the catalogue fallback only when the text names no speciality", () => {
    expect(canonicalSpeciality("Podiatry", "Cardiology")).toBe("Cardiology");
    expect(canonicalSpeciality("Nephrology", "Cardiology")).toBe("Nephrology");
    expect(canonicalSpeciality("Podiatry")).toBe("Podiatry");
  });
  it("reports empty values as Unassigned", () => {
    expect(canonicalSpeciality("")).toBe(UNASSIGNED_SPECIALITY);
    expect(canonicalSpeciality(null)).toBe(UNASSIGNED_SPECIALITY);
    expect(canonicalSpeciality("  ", "")).toBe(UNASSIGNED_SPECIALITY);
  });
  it("only ever returns a catalogue name for the labels in use", () => {
    const names = new Set<string>(medicalSpecialities.map(({ name }) => name));
    for (const text of ["Cardiology / Emergency Medicine", "Endocrinology / Primary Care", "Psychiatry", "Dermatology", "Rheumatology / Pain Medicine", "Sexual Health / Primary Care", "Anaesthesiology / Emergency Medicine"]) {
      expect(names.has(canonicalSpeciality(text)), text).toBe(true);
    }
  });
});

describe("groupBySpeciality", () => {
  const rows = [
    { id: 1, s: "Urology" }, { id: 2, s: "Cardiology" }, { id: 3, s: "" }, { id: 4, s: "Urology" }, { id: 5, s: "Anaesthesiology" },
  ];
  it("sorts sections A to Z, puts Unassigned last and keeps input order inside a section", () => {
    const groups = groupBySpeciality(rows, (row) => row.s);
    expect(groups.map((group) => group.speciality)).toEqual(["Anaesthesiology", "Cardiology", "Urology", UNASSIGNED_SPECIALITY]);
    expect(groups.find((group) => group.speciality === "Urology")?.items.map((row) => row.id)).toEqual([1, 4]);
  });
  it("counts per speciality, largest first, Unassigned last", () => {
    expect(specialityCounts(rows, (row) => row.s)).toEqual([
      { value: "Urology", count: 2 }, { value: "Anaesthesiology", count: 1 }, { value: "Cardiology", count: 1 }, { value: UNASSIGNED_SPECIALITY, count: 1 },
    ]);
  });
});
