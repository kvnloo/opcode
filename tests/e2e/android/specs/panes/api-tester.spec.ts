import workspacePage from '../../pageobjects/workspace.page';
import { expectVisible, expectLoadComplete } from '../../helpers/assertions';

describe('API Tester Pane', () => {
  const apiPane = {
    get container() { return $('android=new UiSelector().resourceId("api-tester-pane")'); },
    get urlInput() { return $('android=new UiSelector().resourceId("api-url-input")'); },
    get methodSelector() { return $('android=new UiSelector().resourceId("method-selector")'); },
    get sendButton() { return $('android=new UiSelector().resourceId("send-request-btn")'); },
    get headersTab() { return $('android=new UiSelector().resourceId("headers-tab")'); },
    get bodyTab() { return $('android=new UiSelector().resourceId("body-tab")'); },
    get responseArea() { return $('android=new UiSelector().resourceId("response-area")'); },
    get statusCode() { return $('android=new UiSelector().resourceId("status-code")'); },
    get responseTime() { return $('android=new UiSelector().resourceId("response-time")'); }
  };

  beforeEach(async () => {
    await workspacePage.openToolsOverlay();
    const tools = await workspacePage.toolItems;
    for (const tool of tools) {
      const text = await tool.getText();
      if (text.toLowerCase().includes('api')) {
        await tool.click();
        break;
      }
    }
  });

  it('should display API tester pane', async () => {
    await expectVisible(apiPane.container);
  });

  it('should have URL input', async () => {
    await expectVisible(apiPane.urlInput);
  });

  it('should have method selector', async () => {
    await expectVisible(apiPane.methodSelector);
  });

  it('should have send button', async () => {
    await expectVisible(apiPane.sendButton);
  });

  it('should have headers tab', async () => {
    await expectVisible(apiPane.headersTab);
  });

  it('should have body tab', async () => {
    await expectVisible(apiPane.bodyTab);
  });

  it('should send request and show response', async () => {
    await apiPane.urlInput.setValue('https://httpbin.org/get');
    await apiPane.sendButton.click();
    await expectLoadComplete();
    await expectVisible(apiPane.responseArea);
    await expectVisible(apiPane.statusCode);
  });

  it('should show response time', async () => {
    await apiPane.urlInput.setValue('https://httpbin.org/get');
    await apiPane.sendButton.click();
    await expectLoadComplete();
    await expectVisible(apiPane.responseTime);
  });
});
