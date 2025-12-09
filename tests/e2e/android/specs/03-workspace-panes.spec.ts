import { waitForWebViewReady, expectScreenshot } from '../helpers/assertions';
import HomePage from '../pageobjects/home.page';
import WorkspacePage from '../pageobjects/workspace.page';

/**
 * Workspace Pane Navigation Test
 * Tests navigation between all workspace panes and the Tools overlay.
 * Requires a project to be loaded first (uses Demo Project workaround).
 */
describe('03 - Workspace Pane Navigation', () => {
  before(async () => {
    // Setup: Load demo project to access workspace
    await browser.pause(5000);
    await waitForWebViewReady(30000);

    // Navigate to Create and load demo project
    await HomePage.createTab.click();
    await browser.pause(1000);

    const demoButton = await $('button*=Dev: Load Demo Project');
    await demoButton.waitForDisplayed({ timeout: 10000 });
    await demoButton.click();
    await browser.pause(2000);

    // Verify workspace loaded
    const toolbar = await WorkspacePage.toolbar;
    await toolbar.waitForDisplayed({ timeout: 10000 });
  });

  describe('Console Pane', () => {
    it('should default to Console pane on workspace load', async () => {
      const isActive = await WorkspacePage.isPaneActive('console');
      expect(isActive).toBe(true);
      await expectScreenshot('panes-01-console-default');
    });

    it('should display Console pane title and icon', async () => {
      const consoleTitle = await WorkspacePage.consolePaneTitle;
      await consoleTitle.waitForDisplayed({ timeout: 5000 });
      expect(await consoleTitle.isDisplayed()).toBe(true);
      expect(await consoleTitle.getText()).toContain('Console');
    });

    it('should show Console tab as active', async () => {
      const tabClass = await WorkspacePage.consoleTab.getAttribute('class');
      expect(tabClass).toContain('text-primary');
    });
  });

  describe('Agent Pane', () => {
    it('should navigate to Agent pane when tapping Agent tab', async () => {
      await WorkspacePage.navigateToAgent();
      await browser.pause(1000);

      const isActive = await WorkspacePage.isPaneActive('agent');
      expect(isActive).toBe(true);

      await expectScreenshot('panes-02-agent-pane');
    });

    it('should display Agent pane title and icon', async () => {
      const agentTitle = await WorkspacePage.agentPaneTitle;
      await agentTitle.waitForDisplayed({ timeout: 5000 });
      expect(await agentTitle.isDisplayed()).toBe(true);
      expect(await agentTitle.getText()).toContain('Agent');
    });

    it('should show Agent tab as active', async () => {
      const tabClass = await WorkspacePage.agentTab.getAttribute('class');
      expect(tabClass).toContain('text-primary');
    });

    it('should verify Agent pane icon color (purple)', async () => {
      const iconElement = await WorkspacePage.agentPaneIcon;
      await iconElement.waitForDisplayed({ timeout: 3000 });
      const iconClass = await iconElement.getAttribute('class');
      expect(iconClass).toContain('text-purple');
    });
  });

  describe('Deploy Pane', () => {
    it('should navigate to Deploy pane when tapping Deploy tab', async () => {
      await WorkspacePage.navigateToDeploy();
      await browser.pause(1000);

      const isActive = await WorkspacePage.isPaneActive('deploy');
      expect(isActive).toBe(true);

      await expectScreenshot('panes-03-deploy-pane');
    });

    it('should display Deploy pane title and icon', async () => {
      const deployTitle = await WorkspacePage.deployPaneTitle;
      await deployTitle.waitForDisplayed({ timeout: 5000 });
      expect(await deployTitle.isDisplayed()).toBe(true);
      expect(await deployTitle.getText()).toContain('Deploy');
    });

    it('should show Deploy tab as active', async () => {
      const tabClass = await WorkspacePage.deployTab.getAttribute('class');
      expect(tabClass).toContain('text-primary');
    });

    it('should verify Deploy pane icon color (green)', async () => {
      const iconElement = await WorkspacePage.deployPaneIcon;
      await iconElement.waitForDisplayed({ timeout: 3000 });
      const iconClass = await iconElement.getAttribute('class');
      expect(iconClass).toContain('text-green');
    });
  });

  describe('Share Pane', () => {
    it('should navigate to Share pane when tapping Share tab', async () => {
      await WorkspacePage.navigateToShare();
      await browser.pause(1000);

      const isActive = await WorkspacePage.isPaneActive('share');
      expect(isActive).toBe(true);

      await expectScreenshot('panes-04-share-pane');
    });

    it('should display Share pane title and icon', async () => {
      const shareTitle = await WorkspacePage.sharePaneTitle;
      await shareTitle.waitForDisplayed({ timeout: 5000 });
      expect(await shareTitle.isDisplayed()).toBe(true);
      expect(await shareTitle.getText()).toContain('Share');
    });

    it('should show Share tab as active', async () => {
      const tabClass = await WorkspacePage.shareTab.getAttribute('class');
      expect(tabClass).toContain('text-primary');
    });

    it('should verify Share pane icon color (orange)', async () => {
      const iconElement = await WorkspacePage.sharePaneIcon;
      await iconElement.waitForDisplayed({ timeout: 3000 });
      const iconClass = await iconElement.getAttribute('class');
      expect(iconClass).toContain('text-orange');
    });
  });

  describe('Preview Pane', () => {
    it('should navigate to Preview pane when tapping Preview tab', async () => {
      await WorkspacePage.navigateToPreview();
      await browser.pause(1000);

      const isActive = await WorkspacePage.isPaneActive('preview');
      expect(isActive).toBe(true);

      await expectScreenshot('panes-05-preview-pane');
    });

    it('should display Preview pane title and icon', async () => {
      const previewTitle = await WorkspacePage.previewPaneTitle;
      await previewTitle.waitForDisplayed({ timeout: 5000 });
      expect(await previewTitle.isDisplayed()).toBe(true);
      expect(await previewTitle.getText()).toContain('Preview');
    });

    it('should show Preview tab as active', async () => {
      const tabClass = await WorkspacePage.previewTab.getAttribute('class');
      expect(tabClass).toContain('text-primary');
    });

    it('should verify Preview pane icon color (pink)', async () => {
      const iconElement = await WorkspacePage.previewPaneIcon;
      await iconElement.waitForDisplayed({ timeout: 3000 });
      const iconClass = await iconElement.getAttribute('class');
      expect(iconClass).toContain('text-pink');
    });
  });

  describe('Pane State Persistence', () => {
    it('should maintain pane state when switching', async () => {
      // Navigate through all panes sequentially
      await WorkspacePage.navigateToConsole();
      await browser.pause(500);

      await WorkspacePage.navigateToAgent();
      await browser.pause(500);

      await WorkspacePage.navigateToDeploy();
      await browser.pause(500);

      // Return to Console
      await WorkspacePage.navigateToConsole();
      await browser.pause(500);

      const isActive = await WorkspacePage.isPaneActive('console');
      expect(isActive).toBe(true);

      await expectScreenshot('panes-06-state-persistence');
    });
  });

  describe('Tools Overlay', () => {
    it('should open Tools overlay from more menu', async () => {
      // Click more button
      await WorkspacePage.moreButton.click();
      await browser.pause(500);

      // Click "Show Tools" or similar menu item
      const showToolsItem = await $('div*=Show Tools,button*=Tools,span*=Tools');
      await showToolsItem.waitForDisplayed({ timeout: 5000 });
      await showToolsItem.click();
      await browser.pause(1000);

      // Verify overlay is visible
      const toolsOverlay = await WorkspacePage.toolsOverlay;
      await toolsOverlay.waitForDisplayed({ timeout: 5000 });
      expect(await toolsOverlay.isDisplayed()).toBe(true);

      await expectScreenshot('panes-07-tools-overlay-open');
    });

    it('should display at least 9 tool items', async () => {
      const toolsList = await WorkspacePage.toolsList;
      expect(toolsList.length).toBeGreaterThanOrEqual(9);

      await expectScreenshot('panes-08-tools-count');
    });

    it('should verify tool items are visible and interactive', async () => {
      const toolsList = await WorkspacePage.toolsList;

      // Check first 3 tools
      for (let i = 0; i < Math.min(3, toolsList.length); i++) {
        expect(await toolsList[i].isDisplayed()).toBe(true);
        expect(await toolsList[i].isClickable()).toBe(true);
      }
    });

    it('should close Tools overlay by tapping outside or back', async () => {
      // Tap outside the overlay (top-left corner)
      await browser.touchAction({
        action: 'tap',
        x: 50,
        y: 50
      });
      await browser.pause(1000);

      // Verify overlay is closed
      const toolsOverlay = await WorkspacePage.toolsOverlay;
      const isVisible = await toolsOverlay.isDisplayed().catch(() => false);
      expect(isVisible).toBe(false);

      await expectScreenshot('panes-09-tools-overlay-closed');
    });
  });

  describe('Rapid Pane Switching', () => {
    it('should handle rapid pane navigation without errors', async () => {
      // Rapidly switch between panes
      await WorkspacePage.consoleTab.click();
      await browser.pause(200);

      await WorkspacePage.agentTab.click();
      await browser.pause(200);

      await WorkspacePage.deployTab.click();
      await browser.pause(200);

      await WorkspacePage.shareTab.click();
      await browser.pause(200);

      await WorkspacePage.previewTab.click();
      await browser.pause(1000);

      // Verify we end up on Preview and app is stable
      const isActive = await WorkspacePage.isPaneActive('preview');
      expect(isActive).toBe(true);

      await expectScreenshot('panes-10-rapid-switch-stable');
    });
  });

  after(async () => {
    await expectScreenshot('panes-test-complete');
  });
});
