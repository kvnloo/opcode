import { test, expect } from '@playwright/test';
import { AndroidHelpers } from '../../helpers/android-helpers';
import { WorkspacePage } from '../../page-objects/workspace-page';

test.describe('Share Pane', () => {
  let helpers: AndroidHelpers;
  let workspacePage: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    helpers = new AndroidHelpers(page);
    workspacePage = new WorkspacePage(page);

    await helpers.launchApp();
    await workspacePage.waitForWorkspaceLoad();
    await workspacePage.openPane('share');
  });

  test('should render share pane', async ({ page }) => {
    const paneContainer = page.locator('[data-testid="share-pane"]');
    await expect(paneContainer).toBeVisible();
  });

  test('should display share options', async ({ page }) => {
    const shareOptions = page.locator('[data-testid="share-options"]');
    await expect(shareOptions).toBeVisible();
  });

  test('should show share link section', async ({ page }) => {
    const shareLinkSection = page.locator('[data-testid="share-link-section"]');
    await expect(shareLinkSection).toBeVisible();
  });

  test('should display generate link button', async ({ page }) => {
    const generateButton = page.locator('[data-testid="generate-share-link-button"]');
    await expect(generateButton).toBeVisible();
  });

  test('should show collaboration settings', async ({ page }) => {
    const collabSettings = page.locator('[data-testid="collaboration-settings"]');
    await expect(collabSettings).toBeVisible();
  });

  test('should display permission controls', async ({ page }) => {
    const permissionControls = page.locator('[data-testid="share-permissions"]');
    await expect(permissionControls).toBeVisible();
  });

  test('should show expiration settings', async ({ page }) => {
    const expirationSettings = page.locator('[data-testid="share-expiration"]');
    await expect(expirationSettings).toBeVisible();
  });

  test('should display copy link button', async ({ page }) => {
    const copyButton = page.locator('[data-testid="copy-share-link-button"]');
    await expect(copyButton).toBeVisible();
  });

  test('should show active shares list', async ({ page }) => {
    const activeShares = page.locator('[data-testid="active-shares-list"]');
    await expect(activeShares).toBeVisible();
  });

  test('should allow generating share link', async ({ page }) => {
    const generateButton = page.locator('[data-testid="generate-share-link-button"]');
    await generateButton.tap();

    const shareLink = page.locator('[data-testid="generated-share-link"]');
    await expect(shareLink).toBeVisible({ timeout: 10000 });
  });

  test('should support revoking share access', async ({ page }) => {
    const revokeButton = page.locator('[data-testid="revoke-share-button"]').first();
    if (await revokeButton.isVisible()) {
      await expect(revokeButton).toBeEnabled();
    }
  });
});
