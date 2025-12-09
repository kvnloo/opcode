# Documentation Structure Specification

**Version:** 3.0
**Status:** Active

---

## Overview

This specification defines the organizational structure for LLM-optimized documentation in the `claudedocs/` directory. The structure follows a numbered folder convention for logical progression through the development lifecycle, with consolidated planning and streamlined navigation.

---

## Folder Structure

```
claudedocs/
├── 00-index/           # Navigation, getting started, specifications
├── 01-architecture/    # System architecture, ADRs, design decisions
├── 02-research/        # Research findings, studies, explorations
│   └── active/         # Currently ongoing research
├── 03-vision/          # Strategic vision, concepts, future direction
├── 04-planning/        # Consolidated planning hub
│   ├── features/       # Feature documentation
│   ├── sprints/        # Sprint planning and tracking
│   └── STATUS.md       # Current project status
├── 05-implementation/  # Implementation guides, technical specs
│   ├── screens/        # Screen implementations
│   ├── features/       # Feature implementations
│   └── mobile/         # Mobile-specific guides
├── 06-testing/         # Testing guides, strategies, coverage
│   ├── general/        # General testing guides
│   ├── reports/        # Test reports
│   └── visual-evidence/# Screenshots and visual tests
├── 07-operations/      # Monitoring, performance, maintenance
├── 08-workflows/       # Deployment, CI/CD, processes
├── 99-archive/         # Historical documentation (date-organized)
└── reference-images/   # Design reference screenshots
```

---

## Folder Purposes

### 00-index/
**Purpose:** Entry point and navigation hub
**Contents:**
- README.md - Main documentation index with quick links
- STRUCTURE_SPECIFICATION.md - This specification document
- GETTING_STARTED.md - Onboarding guide for new team members
- QUICK_REFERENCE.md - Quick reference card
- Cross-references to major documentation areas

### 01-architecture/
**Purpose:** System design and architectural decisions
**Contents:**
- Core system architecture documentation
- ADRs (Architecture Decision Records)
- Component interaction specifications
- Design patterns and architectural patterns

### 02-research/
**Purpose:** Research findings and technology evaluations
**Contents:**
- Topic-specific research documents
- Comparative analyses
- Technology evaluations and proof-of-concepts
- External references and benchmark studies
- active/ - Currently ongoing research

### 03-vision/
**Purpose:** Strategic vision and future direction
**Contents:**
- Product vision and goals
- Concept documents and innovation proposals
- Long-term strategic roadmap
- Future capability planning

### 04-planning/
**Purpose:** Consolidated planning hub for all planning artifacts
**Structure:**
- **features/** - Feature documentation and analysis
- **sprints/** - Sprint planning and iteration summaries
- **STATUS.md** - Current project status (primary status doc)
- **QUALITY_REPORT.md** - Code quality metrics

### 05-implementation/
**Purpose:** Technical implementation guides and specifications
**Contents:**
- **screens/** - Screen-by-screen implementation details
- **features/** - Feature implementation specifications
- **mobile/** - Mobile-specific implementation guides
- Platform adaptation documentation

### 06-testing/
**Purpose:** Testing strategies and documentation
**Contents:**
- **general/** - General testing guides
- **reports/** - Test execution reports and summaries
- **visual-evidence/** - Screenshots and visual tests
- Test strategies and coverage requirements

### 07-operations/
**Purpose:** Operational procedures and monitoring
**Contents:**
- Performance monitoring guides
- Maintenance procedures and schedules
- Incident response playbooks
- Health check definitions

### 08-workflows/
**Purpose:** Development processes and deployment
**Contents:**
- Deployment procedures
- CI/CD pipeline documentation
- Development workflows and standards
- Release processes and checklists

### 99-archive/
**Purpose:** Historical documentation and completed work
**Organization:** By date or topic
**Contents:**
- Superseded documents with archival reasons
- Completed milestone documentation
- Historical records

---

## Workflow Mapping

The folder structure maps to the development lifecycle:

```
Vision (03) → Research (02) → Architecture (01)
     ↓             ↓                 ↓
Planning (04) ←─────────────────────┘
     ↓
     ├─→ Features (04/features/)
     └─→ Sprints (04/sprints/)
     ↓
Implementation (05) → Testing (06)
     ↓                      ↓
Operations (07) ←───────────┘
     ↓
Workflows (08) → Archive (99)
```

**Lifecycle Stages:**
1. **Discovery**: 03-vision, 02-research
2. **Design**: 01-architecture
3. **Planning**: 04-planning
4. **Implementation**: 05-implementation
5. **Validation**: 06-testing
6. **Deployment**: 07-operations, 08-workflows
7. **Archival**: 99-archive

---

## File Naming Conventions

- **UPPERCASE.md** - Major documents (README.md, STATUS.md)
- **Title-Case.md** - Feature/topic documents (PLATFORM_ADAPTATION.md)
- **lowercase-hyphen.md** - Supporting documents (e2e-report.md)
- **iteration-N.md** - Sprint iteration summaries

**Directory Naming:**
- Lowercase with hyphens for multi-word directories
- Short, descriptive names
- Consistent with folder purpose

---

## Document Lifecycle

```
Draft → Review → Active → Superseded → Archived
  ↓       ↓        ↓          ↓           ↓
(WIP)  (Review) (Current)  (Outdated)  (99-archive/)
```

**Status Indicators in Frontmatter:**
```yaml
---
status: draft | review | active | superseded | archived
version: X.Y
last_updated: YYYY-MM-DD
---
```

---

## Best Practices

1. **One Source of Truth**: Each topic has a single canonical document
2. **Cross-Reference Liberally**: Link related documents for context
3. **Date Everything**: Include creation and update dates
4. **Version Control**: Use semantic versioning for major documents
5. **Archive Don't Delete**: Move outdated docs to 99-archive/ with explanation
6. **Maintain README**: Each subdirectory should have a README explaining its contents
7. **Use Consistent Formatting**: Follow markdown standards and heading hierarchy
8. **Update Navigation**: Keep 00-index/README.md current

---

**Last Updated:** 2025-12-09
**Version:** 3.0
