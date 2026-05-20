/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { Plus, CheckCircle2, Circle, PlayCircle } from 'lucide-react';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  draggedTaskId: string | null;
  onAddTaskClick: (status: TaskStatus) => void;
  onSelectTask: (task: Task) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  draggedTaskId,
  onAddTaskClick,
  onSelectTask,
  onDragStart,
  onDragEnd,
  onDropTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // Style variations based on column status
  const getHeaderStyle = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return {
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          dot: 'bg-indigo-500',
          icon: <Circle className="w-4 h-4 text-indigo-500 mr-2" />,
          button: 'text-indigo-600 hover:bg-indigo-100/60 hover:text-indigo-700',
        };
      case 'in_progress':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          dot: 'bg-amber-500',
          icon: <PlayCircle className="w-4 h-4 text-amber-500 mr-2" />,
          button: 'text-amber-600 hover:bg-amber-100/60 hover:text-amber-700',
        };
      case 'done':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />,
          button: 'text-emerald-00 hover:bg-emerald-100/60 hover:text-emerald-700',
        };
    }
  };

  const colors = getHeaderStyle(status);

  // Drag listeners
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    // Only highlight if we are dragging a valid task and not within the same status column
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  return (
    <div
      id={`kanban-column-${status}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 h-[calc(100vh-12rem)] min-h-[35rem] min-w-[290px] rounded-xl p-3 bg-slate-100/40 border transition-all duration-150 ${
        isDragOver
          ? 'border-dashed border-indigo-500 bg-indigo-50/20 shadow-md scale-[1.01]'
          : 'border-slate-200/50 shadow-2xs'
      }`}
    >
      {/* Column Header - Clean, High Density styling */}
      <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-200/30">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            status === 'todo' ? 'bg-slate-200 text-slate-600' :
            status === 'in_progress' ? 'bg-indigo-100 text-indigo-600' :
            'bg-emerald-100 text-emerald-700'
          }`}>
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onAddTaskClick(status)}
          className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/40 p-1 rounded-md transition-all font-bold text-sm"
          title={`Add task to ${title}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Task Cards Stack */}
      <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSelect={onSelectTask}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggedTaskId === task.id}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-200 rounded-lg bg-white/20 text-center pointer-events-none">
            <p className="text-xs font-semibold text-slate-400">Column empty</p>
            <p className="text-[10px] text-slate-400 mt-1">Add a new card or drag-and-drop here</p>
          </div>
        )}
      </div>

      {/* Bottom add button */}
      <button
        onClick={() => onAddTaskClick(status)}
        className="mt-3 w-full py-1.5 px-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md active:bg-slate-100 transition-all shadow-3xs"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add card</span>
      </button>
    </div>
  );
};
