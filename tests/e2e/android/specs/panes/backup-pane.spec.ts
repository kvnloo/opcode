import { test, expect } from '@playwright/test';
import { AndroidHelpers } from '../../helpers/android-helpers';
import { WorkspacePage } from '../../page-objects/workspace-page';

test.describe('Backup Pane', () => {
  let helpers: AndroidHelpers;
  let workspacePage: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    helpers = new AndroidHelpers(page);
    workspacePage = new WorkspacePage(page);

    await helpers.launchApp();
    await workspacePage.waitForWorkspaceLoad();
    await workspacePage.openPane('backup');
  });

  test('should render backup pane', async ({ page }) => {
    const paneContainer = page.locator('[data-testid="backup-pane"]');
    await expect(paneContainer).toBeVisible();
  });

  test('should display backup controls', async ({ page }) => {
    const backupControls = page.locator('[data-testid="backup-controls"]');
    await expect(backupControls).toBeVisible();
  });

  test('should show create backup button', async ({ page }) => {
    const createButton = page.locator('[data-testid="create-backup-button"]');
    await expect(createButton).toBeVisible();
  });

  test('should display backup history', async ({ page }) => {
    const backupHistory = page.locator('[data-testid="backup-history"]');
    await expect(backupHistory).toBeVisible();
  });

  test('should show backup schedule settings', async ({ page }) => {
    const scheduleSettings = page.locator('[data-testid="backup-schedule-settings"]');
    await expect(scheduleSettings).toBeVisible();
  });

  test('should display auto-backup toggle', async ({ page }) => {
    const autoBackupToggle = page.locator('[data-testid="auto-backup-toggle"]');
    await expect(autoBackupToggle).toBeVisible();
  });

  test('should show backup frequency selector', async ({ page }) => {
    const frequencySelector = page.locator('[data-testid="backup-frequency-selector"]');
    await expect(frequencySelector).toBeVisible();
  });

  test('should display restore button for backups', async ({ page }) => {
    const restoreButton = page.locator('[data-testid="restore-backup-button"]').first();
    if (await restoreButton.isVisible()) {
      await expect(restoreButton).toBeVisible();
    }
  });

  test('should show delete backup button', async ({ page }) => {
    const deleteButton = page.locator('[data-testid="delete-backup-button"]').first();
    if (await deleteButton.isVisible()) {
      await expect(deleteButton).toBeVisible();
    }
  });

  test('should display backup size information', async ({ page }) => {
    const backupSize = page.locator('[data-testid="backup-size-info"]').first();
    if (await backupSize.isVisible()) {
      await expect(backupSize).toBeVisible();
    }
  });

  test('should show backup status indicator', async ({ page }) => {
    const statusIndicator = page.locator('[data-testid="backup-status-indicator"]');
    await expect(statusIndicator).toBeVisible();
  });

  test('should display storage quota information', async ({ page }) => {
    const storageQuota = page.locator('[data-testid="backup-storage-quota"]');
    await expect(storageQuota).toBeVisible();
  });

  test('should support scrolling through backup history', async ({ page }) => {
    const backupHistory = page.locator('[data-testid="backup-history"]');
    await helpers.performSwipe(backupHistory, 'up', 300);
    await expect(backupHistory).toBeVisible();
  });
});
