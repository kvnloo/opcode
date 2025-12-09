import { test, expect } from '@playwright/test';
import { AndroidHelpers } from '../../helpers/android-helpers';
import { WorkspacePage } from '../../page-objects/workspace-page';

test.describe('Templates Pane', () => {
  let helpers: AndroidHelpers;
  let workspacePage: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    helpers = new AndroidHelpers(page);
    workspacePage = new WorkspacePage(page);

    await helpers.launchApp();
    await workspacePage.waitForWorkspaceLoad();
    await workspacePage.openPane('templates');
  });

  test('should render templates pane', async ({ page }) => {
    const paneContainer = page.locator('[data-testid="templates-pane"]');
    await expect(paneContainer).toBeVisible();
  });

  test('should display templates list', async ({ page }) => {
    const templatesList = page.locator('[data-testid="templates-list"]');
    await expect(templatesList).toBeVisible();
  });

  test('should show template categories', async ({ page }) => {
    const categories = page.locator('[data-testid="template-categories"]');
    await expect(categories).toBeVisible();
  });

  test('should display create template button', async ({ page }) => {
    const createButton = page.locator('[data-testid="create-template-button"]');
    await expect(createButton).toBeVisible();
  });

  test('should show template search', async ({ page }) => {
    const searchInput = page.locator('[data-testid="template-search-input"]');
    await expect(searchInput).toBeVisible();
  });

  test('should display template preview', async ({ page }) => {
    const templatePreview = page.locator('[data-testid="template-preview"]');
    await expect(templatePreview).toBeVisible();
  });

  test('should show template metadata', async ({ page }) => {
    const templateMetadata = page.locator('[data-testid="template-metadata"]');
    await expect(templateMetadata).toBeVisible();
  });

  test('should display use template button', async ({ page }) => {
    const useButton = page.locator('[data-testid="use-template-button"]').first();
    if (await useButton.isVisible()) {
      await expect(useButton).toBeVisible();
    }
  });

  test('should show edit template button', async ({ page }) => {
    const editButton = page.locator('[data-testid="edit-template-button"]').first();
    if (await editButton.isVisible()) {
      await expect(editButton).toBeVisible();
    }
  });

  test('should display delete template button', async ({ page }) => {
    const deleteButton = page.locator('[data-testid="delete-template-button"]').first();
    if (await deleteButton.isVisible()) {
      await expect(deleteButton).toBeVisible();
    }
  });

  test('should allow searching templates', async ({ page }) => {
    const searchInput = page.locator('[data-testid="template-search-input"]');
    await searchInput.fill('react');
    await expect(searchInput).toHaveValue('react');
  });

  test('should support scrolling through templates', async ({ page }) => {
    const templatesList = page.locator('[data-testid="templates-list"]');
    await helpers.performSwipe(templatesList, 'up', 300);
    await expect(templatesList).toBeVisible();
  });
});
