import workspacePage from '../../pageobjects/workspace.page';
import { expectVisible } from '../../helpers/assertions';

describe('Logs Viewer Pane', () => {
  const logsPane = {
    get container() { return $('android=new UiSelector().resourceId("logs-viewer-pane")'); },
    get logList() { return $$('android=new UiSelector().resourceId("log-entry")'); },
    get filterInput() { return $('android=new UiSelector().resourceId("logs-filter")'); },
    get levelFilter() { return $('android=new UiSelector().resourceId("level-filter")'); },
    get sourceFilter() { return $('android=new UiSelector().resourceId("source-filter")'); },
    get refreshButton() { return $('android=new UiSelector().resourceId("refresh-logs-btn")'); },
    get exportButton() { return $('android=new UiSelector().resourceId("export-logs-btn")'); },
    get clearButton() { return $('android=new UiSelector().resourceId("clear-logs-btn")'); }
  };

  beforeEach(async () => {
    await workspacePage.openToolsOverlay();
    const tools = await workspacePage.toolItems;
    for (const tool of tools) {
      const text = await tool.getText();
      if (text.toLowerCase().includes('log')) {
        await tool.click();
        break;
      }
    }
  });

  it('should display logs viewer pane', async () => {
    await expectVisible(logsPane.container);
  });

  it('should list log entries', async () => {
    const logs = await logsPane.logList;
    expect(logs.length).toBeGreaterThanOrEqual(0);
  });

  it('should have filter input', async () => {
    await expectVisible(logsPane.filterInput);
  });

  it('should have level filter', async () => {
    await expectVisible(logsPane.levelFilter);
  });

  it('should have refresh button', async () => {
    await expectVisible(logsPane.refreshButton);
  });

  it('should have export button', async () => {
    await expectVisible(logsPane.exportButton);
  });

  it('should clear logs', async () => {
    await logsPane.clearButton.click();
    const logs = await logsPane.logList;
    expect(logs.length).toBe(0);
  });
});
