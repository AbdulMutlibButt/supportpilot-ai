import { test, expect } from "@playwright/test";

test("owner uploads and reads a private knowledge document", async ({ page }) => {
  const marker=`knowledge-${Date.now()}`,email=`${marker}@example.test`;
  await page.goto("/register"); await page.getByLabel("Full name").fill("Knowledge Owner"); await page.getByLabel("Workspace name").fill(marker); await page.getByLabel("Work email").fill(email); await page.getByLabel("Password").fill("BrowserPass123"); await page.getByRole("button",{name:"Create workspace"}).click(); await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/knowledge"); await page.locator("summary").filter({hasText:"Upload a document"}).click(); await page.getByPlaceholder("Document title").fill("Browser knowledge guide"); await page.locator('input[type="file"]').setInputFiles({name:"guide.txt",mimeType:"text/plain",buffer:Buffer.from("Browser-uploaded support knowledge.")}); await page.getByRole("button",{name:"Upload and process"}).click();
  await expect(page.getByRole("heading",{name:"Browser knowledge guide"})).toBeVisible(); await expect(page.getByText("Browser-uploaded support knowledge.")).toBeVisible(); await expect(page.getByText(/TXT · ready/i)).toBeVisible();
});
