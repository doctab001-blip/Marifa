import { expect, test } from "@playwright/test";

test("clinician searches the demo directory and opens the COPD pathway", async ({ page, context }) => {
  await context.addCookies([{ name: "marifa_demo_session", value: "clinician", url: "http://localhost:3000" }]);
  await page.goto("/diseases?q=COPD");
  await page.getByRole("link", { name: /Acute exacerbation of COPD/ }).click();
  await expect(page.getByRole("heading", { name: "Acute exacerbation of COPD" })).toBeVisible();
  await expect(page.getByText("Illustrative COPD Pathway — Product Demonstration")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Illustrative acute respiratory presentation pathway/i })).toBeVisible();
});

test("clinician opens demo competencies and sees sign-off safeguards", async ({ page, context }) => {
  await context.addCookies([{ name: "marifa_demo_session", value: "clinician", url: "http://localhost:3000" }]);
  await page.goto("/competencies");
  await expect(page.getByRole("heading", { name: "My competencies" })).toBeVisible();
  await expect(page.getByText("Pending sign-off", { exact: true })).toBeVisible();
  await expect(page.getByText(/quiz or course completion is not treated as proof/i)).toBeVisible();
});

test("dashboard requires authentication even with a demo session cookie", async ({ page, context }) => {
  await context.addCookies([{ name: "marifa_demo_session", value: "clinician", url: "http://localhost:3000" }]);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(page.getByRole("heading", { name: "Sign in to Marifa" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Work email" })).toBeVisible();
});
