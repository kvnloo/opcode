class WorkspacePage {
  // Workspace toolbar - using data-testid selectors
  get toolbar() { return $('[data-testid="workspace-toolbar"]'); }
  get consoleTab() { return $('[data-testid="workspace-console"]'); }
  get agentTab() { return $('[data-testid="workspace-agent"]'); }
  get deployTab() { return $('[data-testid="workspace-deploy"]'); }
  get shareTab() { return $('[data-testid="workspace-share"]'); }
  get previewTab() { return $('[data-testid="workspace-preview"]'); }

  // Header elements
  get backButton() { return $('button[aria-label="Go back"]'); }
  get projectTitle() { return $('h1.text-lg'); }
  get moreButton() { return $('button[aria-label="More options"]'); }

  // Tools overlay
  get toolsOverlay() { return $('[data-testid="tools-overlay"]'); }
  get toolsList() { return $$('[data-testid^="tool-"]'); }

  // Pane content indicators
  get consolePaneIcon() { return $('.text-blue-500'); }
  get consolePaneTitle() { return $('h2=Console'); }

  get agentPaneIcon() { return $('.text-purple-500'); }
  get agentPaneTitle() { return $('h2=Agent'); }

  get deployPaneIcon() { return $('.text-green-500'); }
  get deployPaneTitle() { return $('h2=Deploy'); }

  get sharePaneIcon() { return $('.text-orange-500'); }
  get sharePaneTitle() { return $('h2=Share'); }

  get previewPaneIcon() { return $('.text-pink-500'); }
  get previewPaneTitle() { return $('h2=Preview'); }

  async navigateToConsole() {
    await this.consoleTab.click();
  }

  async navigateToAgent() {
    await this.agentTab.click();
  }

  async navigateToDeploy() {
    await this.deployTab.click();
  }

  async navigateToShare() {
    await this.shareTab.click();
  }

  async navigateToPreview() {
    await this.previewTab.click();
  }

  async goBack() {
    await this.backButton.click();
  }

  async openMenu() {
    await this.moreButton.click();
  }

  async openTools() {
    await this.moreButton.click();
    // Click on "Show Tools" menu item
    const showToolsItem = await $('div*=Show Tools');
    await showToolsItem.click();
    await this.toolsOverlay.waitForDisplayed();
  }

  // Alias for tests that use openToolsOverlay
  async openToolsOverlay() {
    return await this.openTools();
  }

  // Get all tool items in the overlay
  get toolItems() {
    return $$('[data-testid^="tool-"]');
  }

  // Switch to a specific tool pane from the overlay
  async switchToFiles() {
    await this.openToolsOverlay();
    const tools = await this.toolItems;
    for (const tool of tools) {
      const text = await tool.getText();
      if (text.toLowerCase().includes('file')) {
        await tool.click();
        break;
      }
    }
  }

  async closeTools() {
    // Tap outside or find close button
    await browser.touchAction({ action: 'tap', x: 100, y: 100 });
  }

  async selectTool(toolId: string) {
    const tool = await $(`[data-testid="tool-${toolId}"]`);
    await tool.click();
  }

  async getProjectName() {
    return await this.projectTitle.getText();
  }

  async isPaneActive(paneName: 'console' | 'agent' | 'deploy' | 'share' | 'preview') {
    const titleMap = {
      'console': this.consolePaneTitle,
      'agent': this.agentPaneTitle,
      'deploy': this.deployPaneTitle,
      'share': this.sharePaneTitle,
      'preview': this.previewPaneTitle,
    };

    const title = titleMap[paneName];
    try {
      return await title.isDisplayed();
    } catch {
      return false;
    }
  }
}

export default new WorkspacePage();
