/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { X, Trash2, Calendar, CheckSquare, Tag, AlignLeft, User } from 'lucide-react';

interface TaskModalProps {
  task: Task | null; // If null, means creating a new task, otherwise editing
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task> & { title: string }) => void;
  onDelete?: (id: string) => void;
  defaultStatus?: TaskStatus;
}

const CATEGORIES = ['Feature', 'Bug', 'Design', 'Core', 'Marketing'];
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
const ASSIGNEES = [
  { initials: 'JD', name: 'John Doe', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { initials: 'AS', name: 'Alice Smith', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { initials: 'KT', name: 'Kevin Thomas', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { initials: 'ML', name: 'Maria Lopez', color: 'bg-rose-100 text-rose-700 border-rose-200' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  defaultStatus = 'todo',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('low');
  const [category, setCategory] = useState('Feature');
  const [progress, setProgress] = useState(0);
  const [assigneeInitials, setAssigneeInitials] = useState('JD');
  const [color, setColor] = useState('#6366f1'); // Default Indigo

  // Hydrate fields when task opens / changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority || 'low');
      setCategory((task as any).category || 'Feature');
      setProgress((task as any).progress || 0);
      setAssigneeInitials((task as any).assignee?.initials || 'JD');
      setColor(task.color || '#6366f1');
    } else {
      // Set defaults for new task
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('medium');
      setCategory('Feature');
      setProgress(0);
      setAssigneeInitials('JD');
      setColor('#6366f1');
    }
  }, [task, isOpen, defaultStatus]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchingAssignee = ASSIGNEES.find(a => a.initials === assigneeInitials) || ASSIGNEES[0];

    onSave({
      ...(task ? { id: task.id, createdAt: task.createdAt } : {}),
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      color,
      category,
      progress: status === 'done' ? 100 : progress,
      assignee: {
        name: matchingAssignee.name,
        initials: matchingAssignee.initials,
        color: matchingAssignee.color,
      },
    } as any);
  };

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'high': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'medium': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'low': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all duration-300">
      <div 
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Top bar */}
        <div className="h-2 w-full" style={{ backgroundColor: color }} />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            {task ? 'Edit Task Details' : 'Create High Density Task'}
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-12rem)] space-y-4">
          
          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement JWT Auth refresh cycles"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
            />
          </div>

          {/* Category & Accent Color */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Accent Theme Color
              </label>
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-slate-300 cursor-pointer p-0 bg-transparent overflow-hidden"
                />
                <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
                  {color}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Description
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                rows={3}
                placeholder="Briefly summarize objectives, PR requirements, or specific subtasks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* Priority & Assignee selector */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Priority
              </label>
              <div className="flex gap-1.5">
                {PRIORITIES.map((p) => {
                  const isActive = priority === p;
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 px-2 text-xs font-bold uppercase rounded-md border transition-all ${
                        isActive 
                          ? `${getPriorityColor(p)} ring-2 ring-indigo-500/10 scale-95` 
                          : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Assignee
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <select
                  value={assigneeInitials}
                  onChange={(e) => setAssigneeInitials(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
                >
                  {ASSIGNEES.map(as => (
                    <option key={as.initials} value={as.initials}>{as.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status & Progress Slider */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Column Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer font-medium"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {status === 'in_progress' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Progress
                  </label>
                  <span className="text-xs font-bold font-mono text-indigo-600">{progress}%</span>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

        </form>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div>
            {task && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you absolutely sure you want to delete this task?')) {
                    onDelete(task.id);
                  }
                }}
                className="flex items-center gap-1.5 py-2 px-3.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md border border-transparent hover:border-rose-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Task</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent rounded-md transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="py-2 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 rounded-md shadow-sm transition-all flex items-center gap-1"
            >
              <span>{task ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
