class HomePage {
  // Consent dialog
  get consentDialog() { return $('div*=Help improve Claudia'); }
  get consentNoThanks() { return $('button*=No Thanks'); }
  get consentAllow() { return $('button*=Allow'); }
  get consentDismiss() { return $('button[class*="absolute"]'); } // X button

  // Bottom navigation - using data-testid selectors
  get bottomNav() { return $('[data-testid="bottom-navigation"]'); }
  get appsTab() { return $('[data-testid="nav-apps"]'); }
  get createTab() { return $('[data-testid="nav-create"]'); }
  get accountTab() { return $('[data-testid="nav-account"]'); }

  // Apps screen header
  get appsHeader() { return $('h1=Apps'); }

  // Project list elements - using text content and semantic HTML
  get projectList() { return $('.space-y-4'); } // Project list container
  get loadingSpinner() { return $('.animate-spin'); }
  get loadingText() { return $('p*=Loading projects'); }
  get emptyStateIcon() { return $('div*=📦'); }
  get emptyStateText() { return $('h3=No projects yet'); }
  get errorIcon() { return $('div*=⚠️'); }
  get errorTitle() { return $('h3=Failed to load projects'); }
  get retryButton() { return $('button*=Retry'); }

  // Filter button
  get filterButton() { return $('button*=All Apps'); }

  async navigateToCreate() {
    await this.createTab.click();
  }

  async navigateToAccount() {
    await this.accountTab.click();
  }

  async waitForProjectsLoad(timeout = 10000) {
    // Wait for loading to disappear
    try {
      await this.loadingSpinner.waitForDisplayed({ timeout: 2000 });
      await this.loadingSpinner.waitForDisplayed({ timeout, reverse: true });
    } catch {
      // Loading may be too fast to catch
    }
  }

  async isLoadingProjects() {
    return await this.loadingSpinner.isDisplayed();
  }

  async hasProjects() {
    const isEmpty = await this.emptyStateText.isDisplayed();
    return !isEmpty;
  }

  async hasError() {
    try {
      return await this.errorTitle.isDisplayed();
    } catch {
      return false;
    }
  }
}

export default new HomePage();
