/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  status: TaskStatus;
  priority?: TaskPriority;
  color?: string; // Hex code or Tailwind accent color name
  category?: string;
  progress?: number;
  assignee?: {
    name: string;
    initials: string;
    color: string;
  };
}

export interface KanbanState {
  tasks: Task[];
}
