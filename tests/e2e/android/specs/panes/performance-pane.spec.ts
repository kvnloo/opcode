import workspacePage from '../../pageobjects/workspace.page';
import { expectVisible, expectLoadComplete } from '../../helpers/assertions';

describe('Performance Pane', () => {
  const perfPane = {
    get container() { return $('android=new UiSelector().resourceId("performance-pane")'); },
    get cpuChart() { return $('android=new UiSelector().resourceId("cpu-chart")'); },
    get memoryChart() { return $('android=new UiSelector().resourceId("memory-chart")'); },
    get networkChart() { return $('android=new UiSelector().resourceId("network-chart")'); },
    get refreshButton() { return $('android=new UiSelector().resourceId("refresh-metrics-btn")'); },
    get timeRange() { return $('android=new UiSelector().resourceId("time-range-selector")'); },
    get metrics() { return $$('android=new UiSelector().resourceId("metric-card")'); }
  };

  beforeEach(async () => {
    await workspacePage.openToolsOverlay();
    const tools = await workspacePage.toolItems;
    for (const tool of tools) {
      const text = await tool.getText();
      if (text.toLowerCase().includes('performance') || text.toLowerCase().includes('metrics')) {
        await tool.click();
        break;
      }
    }
  });

  it('should display performance pane', async () => {
    await expectVisible(perfPane.container);
  });

  it('should show CPU chart', async () => {
    await expectVisible(perfPane.cpuChart);
  });

  it('should show memory chart', async () => {
    await expectVisible(perfPane.memoryChart);
  });

  it('should show network chart', async () => {
    await expectVisible(perfPane.networkChart);
  });

  it('should have time range selector', async () => {
    await expectVisible(perfPane.timeRange);
  });

  it('should refresh metrics', async () => {
    await perfPane.refreshButton.click();
    await expectLoadComplete();
    const metrics = await perfPane.metrics;
    expect(metrics.length).toBeGreaterThan(0);
  });
});
