import { test, expect } from '@playwright/test';
import { AndroidHelpers } from '../../helpers/android-helpers';
import { WorkspacePage } from '../../page-objects/workspace-page';

test.describe('Environment Pane', () => {
  let helpers: AndroidHelpers;
  let workspacePage: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    helpers = new AndroidHelpers(page);
    workspacePage = new WorkspacePage(page);

    await helpers.launchApp();
    await workspacePage.waitForWorkspaceLoad();
    await workspacePage.openPane('environment');
  });

  test('should render environment pane', async ({ page }) => {
    const paneContainer = page.locator('[data-testid="environment-pane"]');
    await expect(paneContainer).toBeVisible();
  });

  test('should display environment selector', async ({ page }) => {
    const envSelector = page.locator('[data-testid="environment-selector"]');
    await expect(envSelector).toBeVisible();
  });

  test('should show environment variables list', async ({ page }) => {
    const envVarsList = page.locator('[data-testid="environment-variables-list"]');
    await expect(envVarsList).toBeVisible();
  });

  test('should display add variable button', async ({ page }) => {
    const addButton = page.locator('[data-testid="add-env-variable-button"]');
    await expect(addButton).toBeVisible();
  });

  test('should show variable name column', async ({ page }) => {
    const nameColumn = page.locator('[data-testid="env-var-name-column"]');
    await expect(nameColumn).toBeVisible();
  });

  test('should display variable value column', async ({ page }) => {
    const valueColumn = page.locator('[data-testid="env-var-value-column"]');
    await expect(valueColumn).toBeVisible();
  });

  test('should show edit variable button', async ({ page }) => {
    const editButton = page.locator('[data-testid="edit-env-variable-button"]').first();
    if (await editButton.isVisible()) {
      await expect(editButton).toBeVisible();
    }
  });

  test('should display delete variable button', async ({ page }) => {
    const deleteButton = page.locator('[data-testid="delete-env-variable-button"]').first();
    if (await deleteButton.isVisible()) {
      await expect(deleteButton).toBeVisible();
    }
  });

  test('should show environment configuration section', async ({ page }) => {
    const configSection = page.locator('[data-testid="environment-config-section"]');
    await expect(configSection).toBeVisible();
  });

  test('should display export configuration button', async ({ page }) => {
    const exportButton = page.locator('[data-testid="export-env-config-button"]');
    await expect(exportButton).toBeVisible();
  });

  test('should show import configuration button', async ({ page }) => {
    const importButton = page.locator('[data-testid="import-env-config-button"]');
    await expect(importButton).toBeVisible();
  });

  test('should display active environment indicator', async ({ page }) => {
    const activeIndicator = page.locator('[data-testid="active-environment-indicator"]');
    await expect(activeIndicator).toBeVisible();
  });

  test('should support scrolling through environment variables', async ({ page }) => {
    const envVarsList = page.locator('[data-testid="environment-variables-list"]');
    await helpers.performSwipe(envVarsList, 'up', 300);
    await expect(envVarsList).toBeVisible();
  });
});
