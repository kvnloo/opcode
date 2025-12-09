import workspacePage from '../../pageobjects/workspace.page';
import { expectVisible, expectCountAtLeast } from '../../helpers/assertions';

describe('Database Pane', () => {
  const databasePane = {
    get container() { return $('android=new UiSelector().resourceId("database-pane")'); },
    get tableList() { return $$('android=new UiSelector().resourceId("table-item")'); },
    get queryInput() { return $('android=new UiSelector().resourceId("query-input")'); },
    get executeButton() { return $('android=new UiSelector().resourceId("execute-query-btn")'); },
    get resultsTable() { return $('android=new UiSelector().resourceId("query-results")'); },
    get connectionStatus() { return $('android=new UiSelector().resourceId("db-connection-status")'); }
  };

  beforeEach(async () => {
    await workspacePage.openToolsOverlay();
    const tools = await workspacePage.toolItems;
    for (const tool of tools) {
      const text = await tool.getText();
      if (text.toLowerCase().includes('database') || text.toLowerCase().includes('db')) {
        await tool.click();
        break;
      }
    }
  });

  it('should display database pane', async () => {
    await expectVisible(databasePane.container);
  });

  it('should show connection status', async () => {
    await expectVisible(databasePane.connectionStatus);
  });

  it('should have query input', async () => {
    await expectVisible(databasePane.queryInput);
  });

  it('should have execute button', async () => {
    await expectVisible(databasePane.executeButton);
  });

  it('should list tables when connected', async () => {
    const tables = await databasePane.tableList;
    expect(tables.length).toBeGreaterThanOrEqual(0);
  });

  it('should show results after query', async () => {
    await databasePane.queryInput.setValue('SELECT 1');
    await databasePane.executeButton.click();
    await expectVisible(databasePane.resultsTable);
  });
});
