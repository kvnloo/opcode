import workspacePage from '../pageobjects/workspace.page';
import commonPage from '../pageobjects/common.page';
import { expectVisible, expectText } from '../helpers/assertions';

describe('Connection Manager', () => {
  const connectionManager = {
    get container() { return $('android=new UiSelector().resourceId("connection-manager")'); },
    get statusIndicator() { return $('android=new UiSelector().resourceId("connection-status")'); },
    get tailscaleOption() { return $('android=new UiSelector().resourceId("tailscale-connect")'); },
    get claudeWebOption() { return $('android=new UiSelector().resourceId("claude-web-connect")'); },
    get localOption() { return $('android=new UiSelector().resourceId("local-connect")'); },
    get connectButton() { return $('android=new UiSelector().resourceId("connect-btn")'); },
    get disconnectButton() { return $('android=new UiSelector().resourceId("disconnect-btn")'); },
    get hostInput() { return $('android=new UiSelector().resourceId("host-input")'); },
    get errorMessage() { return $('android=new UiSelector().resourceId("connection-error")'); }
  };

  beforeEach(async () => {
    await workspacePage.openToolsOverlay();
    // Find and click connection manager tool
    const tools = await workspacePage.toolItems;
    for (const tool of tools) {
      const text = await tool.getText();
      if (text.toLowerCase().includes('connection')) {
        await tool.click();
        break;
      }
    }
  });

  it('should display connection manager', async () => {
    await expectVisible(connectionManager.container);
  });

  it('should show current connection status', async () => {
    await expectVisible(connectionManager.statusIndicator);
  });

  it('should display Tailscale option', async () => {
    await expectVisible(connectionManager.tailscaleOption);
  });

  it('should display Claude Web option', async () => {
    await expectVisible(connectionManager.claudeWebOption);
  });

  it('should display Local option', async () => {
    await expectVisible(connectionManager.localOption);
  });

  it('should select Tailscale mode', async () => {
    await connectionManager.tailscaleOption.click();
    const selected = await connectionManager.tailscaleOption.getAttribute('selected');
    expect(selected).toBe('true');
  });

  it('should show host input for Tailscale', async () => {
    await connectionManager.tailscaleOption.click();
    await expectVisible(connectionManager.hostInput);
  });

  it('should show error for invalid host', async () => {
    await connectionManager.tailscaleOption.click();
    await connectionManager.hostInput.setValue('invalid-host');
    await connectionManager.connectButton.click();
    await commonPage.waitForLoading();
    await expectVisible(connectionManager.errorMessage);
  });
});
