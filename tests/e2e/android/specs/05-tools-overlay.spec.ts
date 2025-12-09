import workspacePage from '../pageobjects/workspace.page';
import commonPage from '../pageobjects/common.page';
import { expectVisible, expectNotVisible, expectCountAtLeast } from '../helpers/assertions';

describe('Tools Overlay', () => {
  beforeEach(async () => {
    // Ensure we're in workspace
    await workspacePage.bottomTabs.waitForDisplayed();
  });

  it('should open tools overlay', async () => {
    await workspacePage.openToolsOverlay();
    await expectVisible(workspacePage.toolsOverlay);
  });

  it('should display all tool items', async () => {
    await workspacePage.openToolsOverlay();
    const tools = await workspacePage.toolItems;
    await expectCountAtLeast(tools, 18);
  });

  it('should close overlay on back', async () => {
    await workspacePage.openToolsOverlay();
    await workspacePage.closeToolsOverlay();
    await expectNotVisible(workspacePage.toolsOverlay);
  });

  it('should navigate to tool pane on selection', async () => {
    await workspacePage.openToolsOverlay();
    await workspacePage.selectTool(0);
    await expectNotVisible(workspacePage.toolsOverlay);
    await expectVisible(workspacePage.paneContainer);
  });

  it('should be scrollable with many tools', async () => {
    await workspacePage.openToolsOverlay();
    const overlay = workspacePage.toolsOverlay;
    const scrollable = await overlay.getAttribute('scrollable');
    expect(scrollable).toBe('true');
    await workspacePage.closeToolsOverlay();
  });

  it('should show tool icons', async () => {
    await workspacePage.openToolsOverlay();
    const tools = await workspacePage.toolItems;
    for (const tool of tools.slice(0, 5)) {
      const icon = await tool.$('android=new UiSelector().className("android.widget.ImageView")');
      expect(await icon.isDisplayed()).toBe(true);
    }
    await workspacePage.closeToolsOverlay();
  });

  it('should show tool labels', async () => {
    await workspacePage.openToolsOverlay();
    const tools = await workspacePage.toolItems;
    for (const tool of tools.slice(0, 5)) {
      const text = await tool.getText();
      expect(text.length).toBeGreaterThan(0);
    }
    await workspacePage.closeToolsOverlay();
  });
});
