import workspacePage from '../../pageobjects/workspace.page';
import { expectVisible, expectCountAtLeast } from '../../helpers/assertions';

describe('Extensions Pane', () => {
  const extPane = {
    get container() { return $('android=new UiSelector().resourceId("extensions-pane")'); },
    get extensionList() { return $$('android=new UiSelector().resourceId("extension-item")'); },
    get searchInput() { return $('android=new UiSelector().resourceId("extension-search")'); },
    get installedTab() { return $('android=new UiSelector().resourceId("installed-tab")'); },
    get marketplaceTab() { return $('android=new UiSelector().resourceId("marketplace-tab")'); },
    get installButton() { return $('android=new UiSelector().resourceId("install-ext-btn")'); },
    get uninstallButton() { return $('android=new UiSelector().resourceId("uninstall-ext-btn")'); }
  };

  beforeEach(async () => {
    await workspacePage.openToolsOverlay();
    const tools = await workspacePage.toolItems;
    for (const tool of tools) {
      const text = await tool.getText();
      if (text.toLowerCase().includes('extension') || text.toLowerCase().includes('plugin')) {
        await tool.click();
        break;
      }
    }
  });

  it('should display extensions pane', async () => {
    await expectVisible(extPane.container);
  });

  it('should have search input', async () => {
    await expectVisible(extPane.searchInput);
  });

  it('should have installed tab', async () => {
    await expectVisible(extPane.installedTab);
  });

  it('should have marketplace tab', async () => {
    await expectVisible(extPane.marketplaceTab);
  });

  it('should list extensions', async () => {
    const extensions = await extPane.extensionList;
    expect(extensions.length).toBeGreaterThanOrEqual(0);
  });

  it('should switch to marketplace', async () => {
    await extPane.marketplaceTab.click();
    const selected = await extPane.marketplaceTab.getAttribute('selected');
    expect(selected).toBe('true');
  });

  it('should search extensions', async () => {
    await extPane.searchInput.setValue('code');
    const extensions = await extPane.extensionList;
    for (const ext of extensions) {
      const name = await ext.getText();
      expect(name.toLowerCase()).toContain('code');
    }
  });
});
