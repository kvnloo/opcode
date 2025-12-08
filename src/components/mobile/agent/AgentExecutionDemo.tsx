import { useState, useEffect } from 'react';
import { AgentExecutionView, AgentExecutionState, AgentTask } from './AgentExecutionView';

/**
 * Demo component showing how to use the AgentExecutionView
 * This simulates an agent executing tasks with realistic timing and states
 */
export function AgentExecutionDemo() {
  const [execution, setExecution] = useState<AgentExecutionState>({
    agentId: 'demo-agent-1',
    agentName: 'React Developer',
    taskDescription: 'Build a responsive landing page with hero section, features, and contact form',
    status: 'idle',
    tasks: [],
    currentTaskIndex: 0,
    changedFiles: []
  });

  const [isRunning, setIsRunning] = useState(false);

  // Simulate task execution
  useEffect(() => {
    if (!isRunning) return;

    const demoTasks: AgentTask[] = [
      {
        id: 'task-1',
        description: 'Analyzing project structure and requirements',
        status: 'pending',
        details: 'Scanning existing components and determining optimal architecture'
      },
      {
        id: 'task-2',
        description: 'Creating component files and folder structure',
        status: 'pending'
      },
      {
        id: 'task-3',
        description: 'Implementing Hero section with responsive design',
        status: 'pending',
        details: 'Using Tailwind CSS for mobile-first responsive layout'
      },
      {
        id: 'task-4',
        description: 'Building Features section with grid layout',
        status: 'pending'
      },
      {
        id: 'task-5',
        description: 'Creating contact form with validation',
        status: 'pending',
        details: 'Implementing form validation and error handling'
      },
      {
        id: 'task-6',
        description: 'Adding animations and transitions',
        status: 'pending'
      },
      {
        id: 'task-7',
        description: 'Testing responsive breakpoints',
        status: 'pending'
      }
    ];

    // Initialize tasks
    setExecution((prev) => ({
      ...prev,
      tasks: demoTasks,
      status: 'running'
    }));

    // Simulate task progression
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex >= demoTasks.length) {
        clearInterval(interval);
        setExecution((prev) => ({
          ...prev,
          status: 'completed',
          changedFiles: [
            {
              path: 'src/components/landing/Hero.tsx',
              oldContent: '',
              newContent: `import React from 'react';\n\nexport function Hero() {\n  return (\n    <section className="min-h-screen flex items-center">\n      <div className="container mx-auto px-4">\n        <h1 className="text-5xl font-bold">Welcome</h1>\n      </div>\n    </section>\n  );\n}`,
              language: 'typescript'
            },
            {
              path: 'src/components/landing/Features.tsx',
              oldContent: '',
              newContent: `import React from 'react';\n\nexport function Features() {\n  return (\n    <section className="py-20">\n      <div className="container mx-auto px-4">\n        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>\n        <div className="grid md:grid-cols-3 gap-8">\n          {/* Feature cards */}\n        </div>\n      </div>\n    </section>\n  );\n}`,
              language: 'typescript'
            },
            {
              path: 'src/components/landing/ContactForm.tsx',
              oldContent: '',
              newContent: `import React, { useState } from 'react';\n\nexport function ContactForm() {\n  const [formData, setFormData] = useState({ name: '', email: '', message: '' });\n\n  return (\n    <section className="py-20 bg-gray-50">\n      <div className="container mx-auto px-4 max-w-2xl">\n        <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>\n        <form className="space-y-6">\n          {/* Form fields */}\n        </form>\n      </div>\n    </section>\n  );\n}`,
              language: 'typescript'
            }
          ]
        }));
        setIsRunning(false);
        return;
      }

      setExecution((prev) => {
        const updatedTasks = [...prev.tasks];

        // Complete previous task
        if (currentIndex > 0) {
          updatedTasks[currentIndex - 1] = {
            ...updatedTasks[currentIndex - 1],
            status: 'completed',
            endTime: Date.now()
          };
        }

        // Start current task
        updatedTasks[currentIndex] = {
          ...updatedTasks[currentIndex],
          status: 'in_progress',
          startTime: Date.now()
        };

        return {
          ...prev,
          tasks: updatedTasks,
          currentTaskIndex: currentIndex
        };
      });

      currentIndex++;
    }, 2000); // Complete each task every 2 seconds

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleCancel = () => {
    setIsRunning(false);
    setExecution((prev) => ({
      ...prev,
      status: 'cancelled'
    }));
  };

  const handleRollback = () => {
    console.log('Rolling back changes...');
    // In a real implementation, this would revert file changes
    alert('Rollback functionality would revert all file changes');
  };

  const handleViewChanges = () => {
    console.log('Viewing changes...');
  };

  const handlePreview = () => {
    console.log('Opening preview...');
    alert('Preview functionality would open the built landing page');
  };

  const startDemo = () => {
    setIsRunning(true);
    setExecution({
      agentId: 'demo-agent-1',
      agentName: 'React Developer',
      taskDescription: 'Build a responsive landing page with hero section, features, and contact form',
      status: 'idle',
      tasks: [],
      currentTaskIndex: 0,
      changedFiles: []
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {!isRunning && execution.status === 'idle' && (
        <div className="flex items-center justify-center h-screen">
          <button
            onClick={startDemo}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Start Agent Execution Demo
          </button>
        </div>
      )}

      {(isRunning || execution.status !== 'idle') && (
        <AgentExecutionView
          execution={execution}
          onCancel={handleCancel}
          onRollback={handleRollback}
          onViewChanges={handleViewChanges}
          onPreview={handlePreview}
        />
      )}
    </div>
  );
}
