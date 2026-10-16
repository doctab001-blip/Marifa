import { Pill } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function MedicinesFormularyPage() {
  return (
    <ModulePlaceholder
      title="Medicines and Formulary"
      purpose="A future reference point for medicine information and organization-specific formulary content."
      plannedWork="This module will connect source-linked SFDA medicine references with the local formulary after validation and hospital governance review."
      icon={Pill}
    />
  );
}
