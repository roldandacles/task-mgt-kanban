/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Task } from '../types';
import { Clock, AlertTriangle, AlertCircle, ArrowDown, ArrowUp } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onSelect,
  onDragStart,
  onDragEnd,
  isDragging,
}) => {
  const getPriorityBadgeStyles = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-rose-50 border-rose-100 text-rose-700';
      case 'medium':
        return 'bg-amber-50 border-amber-100 text-amber-700';
      case 'low':
      default:
        return 'bg-emerald-50 border-emerald-100 text-emerald-700';
    }
  };

  const getPriorityIcon = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return <ArrowUp className="w-3 h-3 text-rose-500 mr-1" />;
      case 'medium':
        return <AlertTriangle className="w-3 h-3 text-amber-500 mr-1" />;
      case 'low':
      default:
        return <ArrowDown className="w-3 h-3 text-emerald-500 mr-1" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, task.id);
  };

  return (
    <div
      id={`task-card-${task.id}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(task)}
      className={`group relative flex flex-col justify-between p-3 mb-2 bg-white hover:bg-slate-50 border ${
        task.status === 'done' ? 'border-slate-200/60 opacity-80' : 'border-slate-200 shadow-xs'
      } hover:border-indigo-300 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-150 select-none ${
        isDragging ? 'opacity-40 border-dashed border-indigo-400 rotate-2 scale-95 shadow-lg' : ''
      }`}
    >
      {/* Accent strip on the left instead of top, or top, High Density style can have border-l-4 or left border indicator */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{
          backgroundColor: task.color || (task.priority === 'high' ? '#f43f5e' : task.priority === 'medium' ? '#f59e0b' : '#10b981')
        }}
      />

      <div className="pl-2">
        {/* Category Header */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: task.color || (task.priority === 'high' ? '#f43f5e' : task.priority === 'medium' ? '#f59e0b' : '#10b981') }}
            ></span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              {(task as any).category || 'Feature'}
            </span>
          </div>

          {/* Mini Priority Badge */}
          {task.priority && task.status !== 'done' && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${getPriorityBadgeStyles(
                task.priority
              )}`}
            >
              {task.priority.toUpperCase()}
            </span>
          )}
        </div>

        {/* Task Title */}
        <h4 
          className={`text-sm font-semibold text-slate-700 leading-snug group-hover:text-indigo-600 transition-colors pointer-events-none line-clamp-2 ${
            task.status === 'done' ? 'line-through text-slate-400 font-normal' : ''
          }`}
        >
          {task.title}
        </h4>

        {/* Task Description */}
        {task.description && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed pointer-events-none">
            {task.description}
          </p>
        )}

        {/* Progress bar for In Progress */}
        {task.status === 'in_progress' && (task as any).progress !== undefined && (
          <div className="mt-3 w-full">
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-1">
              <span>Progress</span>
              <span>{(task as any).progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1">
              <div 
                className="bg-indigo-500 h-1 rounded-full transition-all duration-300" 
                style={{ width: `${(task as any).progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="mt-4 pl-2 pt-2 border-t border-slate-100/80 flex items-center justify-between">
        {/* Assignee initials bubble */}
        <div className="flex -space-x-1">
          <div 
            className={`w-5.5 h-5.5 rounded-full border border-white flex items-center justify-center text-[9px] font-bold shadow-2xs ${
              (task as any).assignee?.color || 'bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
            title={(task as any).assignee?.name || 'Assignee'}
          >
            {(task as any).assignee?.initials || 'JD'}
          </div>
        </div>

        {/* Date and ID */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
          <span className="truncate">{formatDate(task.createdAt)}</span>
          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] text-slate-500 font-mono">
            #{task.id.slice(-4)}
          </span>
        </div>
      </div>
    </div>
  );
};
