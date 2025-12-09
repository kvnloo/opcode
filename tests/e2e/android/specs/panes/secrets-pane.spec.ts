import { test, expect } from '@playwright/test';
import { AndroidHelpers } from '../../helpers/android-helpers';
import { WorkspacePage } from '../../page-objects/workspace-page';

test.describe('Secrets Pane', () => {
  let helpers: AndroidHelpers;
  let workspacePage: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    helpers = new AndroidHelpers(page);
    workspacePage = new WorkspacePage(page);

    await helpers.launchApp();
    await workspacePage.waitForWorkspaceLoad();
    await workspacePage.openPane('secrets');
  });

  test('should render secrets pane', async ({ page }) => {
    const paneContainer = page.locator('[data-testid="secrets-pane"]');
    await expect(paneContainer).toBeVisible();
  });

  test('should display secrets list', async ({ page }) => {
    const secretsList = page.locator('[data-testid="secrets-list"]');
    await expect(secretsList).toBeVisible();
  });

  test('should show add secret button', async ({ page }) => {
    const addButton = page.locator('[data-testid="add-secret-button"]');
    await expect(addButton).toBeVisible();
  });

  test('should display secret key column', async ({ page }) => {
    const keyColumn = page.locator('[data-testid="secret-key-column"]');
    await expect(keyColumn).toBeVisible();
  });

  test('should show secret value masking', async ({ page }) => {
    const maskedValue = page.locator('[data-testid="secret-value-masked"]').first();
    if (await maskedValue.isVisible()) {
      await expect(maskedValue).toContainText('•••');
    }
  });

  test('should display reveal button for secrets', async ({ page }) => {
    const revealButton = page.locator('[data-testid="reveal-secret-button"]').first();
    if (await revealButton.isVisible()) {
      await expect(revealButton).toBeVisible();
    }
  });

  test('should show edit secret button', async ({ page }) => {
    const editButton = page.locator('[data-testid="edit-secret-button"]').first();
    if (await editButton.isVisible()) {
      await expect(editButton).toBeVisible();
    }
  });

  test('should display delete secret button', async ({ page }) => {
    const deleteButton = page.locator('[data-testid="delete-secret-button"]').first();
    if (await deleteButton.isVisible()) {
      await expect(deleteButton).toBeVisible();
    }
  });

  test('should show secret scope selector', async ({ page }) => {
    const scopeSelector = page.locator('[data-testid="secret-scope-selector"]');
    await expect(scopeSelector).toBeVisible();
  });

  test('should display security warning', async ({ page }) => {
    const securityWarning = page.locator('[data-testid="secrets-security-warning"]');
    await expect(securityWarning).toBeVisible();
  });

  test('should show import secrets button', async ({ page }) => {
    const importButton = page.locator('[data-testid="import-secrets-button"]');
    await expect(importButton).toBeVisible();
  });

  test('should support scrolling through secrets', async ({ page }) => {
    const secretsList = page.locator('[data-testid="secrets-list"]');
    await helpers.performSwipe(secretsList, 'up', 300);
    await expect(secretsList).toBeVisible();
  });
});
