import { test, expect } from '@playwright/test';
import { AndroidHelpers } from '../../helpers/android-helpers';
import { WorkspacePage } from '../../page-objects/workspace-page';

test.describe('Assistant Pane', () => {
  let helpers: AndroidHelpers;
  let workspacePage: WorkspacePage;

  test.beforeEach(async ({ page }) => {
    helpers = new AndroidHelpers(page);
    workspacePage = new WorkspacePage(page);

    await helpers.launchApp();
    await workspacePage.waitForWorkspaceLoad();
    await workspacePage.openPane('assistant');
  });

  test('should render assistant pane', async ({ page }) => {
    const paneContainer = page.locator('[data-testid="assistant-pane"]');
    await expect(paneContainer).toBeVisible();
  });

  test('should display chat interface', async ({ page }) => {
    const chatInterface = page.locator('[data-testid="assistant-chat"]');
    await expect(chatInterface).toBeVisible();
  });

  test('should show message input', async ({ page }) => {
    const messageInput = page.locator('[data-testid="assistant-input"]');
    await expect(messageInput).toBeVisible();
  });

  test('should display send button', async ({ page }) => {
    const sendButton = page.locator('[data-testid="assistant-send-button"]');
    await expect(sendButton).toBeVisible();
  });

  test('should show chat history', async ({ page }) => {
    const chatHistory = page.locator('[data-testid="assistant-history"]');
    await expect(chatHistory).toBeVisible();
  });

  test('should allow message input', async ({ page }) => {
    const messageInput = page.locator('[data-testid="assistant-input"]');
    await messageInput.fill('Hello AI assistant');
    await expect(messageInput).toHaveValue('Hello AI assistant');
  });

  test('should enable send button when input has text', async ({ page }) => {
    const messageInput = page.locator('[data-testid="assistant-input"]');
    const sendButton = page.locator('[data-testid="assistant-send-button"]');

    await messageInput.fill('Test message');
    await expect(sendButton).toBeEnabled();
  });

  test('should display conversation mode selector', async ({ page }) => {
    const modeSelector = page.locator('[data-testid="assistant-mode-selector"]');
    await expect(modeSelector).toBeVisible();
  });

  test('should show clear conversation button', async ({ page }) => {
    const clearButton = page.locator('[data-testid="assistant-clear-button"]');
    await expect(clearButton).toBeVisible();
  });

  test('should support scrolling through chat history', async ({ page }) => {
    const chatHistory = page.locator('[data-testid="assistant-history"]');
    await helpers.performSwipe(chatHistory, 'up', 300);
    // Verify scroll occurred (basic test)
    await expect(chatHistory).toBeVisible();
  });
});
