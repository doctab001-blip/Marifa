import { expect, test } from "@playwright/test";

test("doctor signs in, searches COPD and opens the quick pathway", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /clinician workspace/i }).click();
  await expect(page.getByRole("heading", { name: /good evening/i })).toBeVisible();
  await page.getByRole("textbox", { name: /search disease management/i }).fill("COPD");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("link", { name: /Acute exacerbation of COPD/ }).click();
  await expect(page.getByRole("heading", { name: "Acute exacerbation of COPD" })).toBeVisible();
  await expect(page.getByText("Illustrative COPD Pathway — Product Demonstration")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Illustrative acute respiratory presentation pathway/i })).toBeVisible();
});

test("clinician opens assigned competencies and sees sign-off safeguards", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /clinician workspace/i }).click();
  await page.goto("/competencies");
  await expect(page.getByRole("heading", { name: "My competencies" })).toBeVisible();
  await expect(page.getByText("Pending sign-off", { exact: true })).toBeVisible();
  await expect(page.getByText(/quiz or course completion is not treated as proof/i)).toBeVisible();
});
