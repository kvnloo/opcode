class CreatePage {
  get templateList() { return $('[data-testid="template-list"]'); }
  get templateCards() { return $$('[data-testid="template-card"]'); }
  get projectNameInput() { return $('[data-testid="project-name-input"]'); }
  get createButton() { return $('[data-testid="create-project-btn"]'); }

  async createProject(name: string, templateIndex = 0) {
    const templates = await this.templateCards;
    if (templates[templateIndex]) {
      await templates[templateIndex].click();
    }
    await this.projectNameInput.setValue(name);
    await this.createButton.click();
  }
}

export default new CreatePage();
