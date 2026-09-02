import { expect, test } from "@playwright/test";

const chatbot = "/chat/89c85fd2-91b7-4b23-b5e1-5890c13db3cf";

test("public portfolio mode labels the experience and protects private workspace creation", async ({ page }) => {
  test.skip(process.env.APP_MODE !== "public-demo", "This workflow runs only in public-demo mode.");
  await page.goto("/register");
  await expect(page.getByText("Public portfolio demonstration")).toBeVisible();
  await expect(page.getByText("Registration and private workspace creation are disabled.")).toBeVisible();
  await expect(page.locator("form input")).toHaveCount(0);
  await page.goto(chatbot);
  await expect(page.getByText("Northstar Assistant")).toBeVisible();
});
