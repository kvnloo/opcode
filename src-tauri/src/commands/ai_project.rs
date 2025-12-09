use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

/// Represents an AI-generated project
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIProject {
    pub id: String,
    pub name: String,
    pub path: String,
    pub template: String,
    pub description: Option<String>,
}

/// Analyzes a project description and suggests templates
#[tauri::command]
pub async fn analyze_project_description(description: String) -> Result<Vec<String>, String> {
    // Simple keyword-based analysis
    // In production, this could call Claude API for better suggestions
    let description_lower = description.to_lowercase();
    let mut suggestions = Vec::new();

    if description_lower.contains("web") || description_lower.contains("website") {
        suggestions.push("nextjs".to_string());
    }
    if description_lower.contains("api") || description_lower.contains("backend") {
        suggestions.push("express-api".to_string());
    }
    if description_lower.contains("mobile") || description_lower.contains("app") {
        suggestions.push("react-native".to_string());
    }
    if description_lower.contains("full") || description_lower.contains("database") {
        suggestions.push("fullstack".to_string());
    }

    // Default to fullstack if no matches
    if suggestions.is_empty() {
        suggestions.push("fullstack".to_string());
    }

    Ok(suggestions)
}

/// Creates a new AI project
#[tauri::command]
pub async fn create_ai_project(
    name: String,
    description: Option<String>,
    template: String,
) -> Result<AIProject, String> {
    let home_dir = dirs::home_dir()
        .ok_or("Could not find home directory")?;

    let projects_dir = home_dir.join(".claude").join("projects");
    let project_dir = projects_dir.join(&name);

    // Create project directory
    std::fs::create_dir_all(&project_dir)
        .map_err(|e| format!("Failed to create project directory: {}", e))?;

    // Create project metadata
    let project_id = uuid::Uuid::new_v4().to_string();
    let project = AIProject {
        id: project_id.clone(),
        name: name.clone(),
        path: project_dir.to_string_lossy().to_string(),
        template: template.clone(),
        description: description.clone(),
    };

    // Create project.json
    let project_json = serde_json::json!({
        "id": project_id,
        "name": name,
        "description": description,
        "template": template,
        "createdAt": chrono::Utc::now().to_rfc3339(),
    });

    let project_json_path = project_dir.join("project.json");
    std::fs::write(&project_json_path, serde_json::to_string_pretty(&project_json).unwrap())
        .map_err(|e| format!("Failed to write project.json: {}", e))?;

    // Create initial scaffold based on template
    create_template_scaffold(&project_dir, &template)?;

    Ok(project)
}

/// Creates the initial project scaffold based on template
fn create_template_scaffold(project_dir: &std::path::Path, template: &str) -> Result<(), String> {
    match template {
        "nextjs" => {
            // Create Next.js structure
            std::fs::create_dir_all(project_dir.join("src/app"))
                .map_err(|e| format!("Failed to create src/app: {}", e))?;
            std::fs::create_dir_all(project_dir.join("src/components"))
                .map_err(|e| format!("Failed to create src/components: {}", e))?;
            std::fs::write(
                project_dir.join("package.json"),
                r#"{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  }
}
"#
            ).map_err(|e| format!("Failed to write package.json: {}", e))?;

            std::fs::write(
                project_dir.join("tsconfig.json"),
                r#"{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
"#
            ).map_err(|e| format!("Failed to write tsconfig.json: {}", e))?;
        }
        "express-api" => {
            std::fs::create_dir_all(project_dir.join("src/routes"))
                .map_err(|e| format!("Failed to create src/routes: {}", e))?;
            std::fs::write(
                project_dir.join("package.json"),
                r#"{
  "name": "api",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "ts-node-dev src/index.ts",
    "build": "tsc"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20",
    "typescript": "^5",
    "ts-node-dev": "^2.0.0"
  }
}
"#
            ).map_err(|e| format!("Failed to write package.json: {}", e))?;
        }
        "react-native" => {
            std::fs::create_dir_all(project_dir.join("src/screens"))
                .map_err(|e| format!("Failed to create src/screens: {}", e))?;
            std::fs::write(
                project_dir.join("package.json"),
                r#"{
  "name": "mobile-app",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~49.0.0",
    "react": "18.2.0",
    "react-native": "0.72.6"
  },
  "devDependencies": {
    "@types/react": "~18.2.14",
    "typescript": "^5.1.3"
  }
}
"#
            ).map_err(|e| format!("Failed to write package.json: {}", e))?;
        }
        "fullstack" => {
            std::fs::create_dir_all(project_dir.join("src/app"))
                .map_err(|e| format!("Failed to create src/app: {}", e))?;
            std::fs::create_dir_all(project_dir.join("prisma"))
                .map_err(|e| format!("Failed to create prisma: {}", e))?;
            std::fs::write(
                project_dir.join("package.json"),
                r#"{
  "name": "fullstack",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "prisma": "^5.0.0",
    "typescript": "^5"
  }
}
"#
            ).map_err(|e| format!("Failed to write package.json: {}", e))?;

            std::fs::write(
                project_dir.join("prisma/schema.prisma"),
                r#"generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
"#
            ).map_err(|e| format!("Failed to write schema.prisma: {}", e))?;
        }
        _ => {}
    }
    Ok(())
}
