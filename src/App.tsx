/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from './types';
import { KanbanColumn } from './components/KanbanColumn';
import { TaskModal } from './components/TaskModal';
import { 
  Search, 
  Plus, 
  FolderGit2, 
  Layout, 
  Clock, 
  Users, 
  Settings, 
  Layers, 
  TrendingUp, 
  CheckCircle,
  HelpCircle,
  BarChart3
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'vibe_kanban_state';

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Welcome to your Kanban board!',
    description: 'This is a high-density task board. Drag-and-drop cards between columns to update their status instantly.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    status: 'todo',
    priority: 'high',
    color: '#3b82f6', // blue
    category: 'Core',
    progress: 0,
    assignee: { name: 'John Doe', initials: 'JD', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' }
  },
  {
    id: 'task-2',
    title: 'Click me to edit the title and description.',
    description: 'Inside the task modal, you can change priorities, set custom accent color bars, select categories and choose assignees.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    status: 'todo',
    priority: 'medium',
    color: '#eab308', // amber
    category: 'Design',
    progress: 0,
    assignee: { name: 'Alice Smith', initials: 'AS', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
  },
  {
    id: 'task-3',
    title: 'Drag me to \'In Progress\' to get started.',
    description: 'Once moved to In Progress, you can manage progress sliders (0-100%) that visually fill on High Density cards.',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(), // 1 hour ago
    status: 'todo',
    priority: 'low',
    color: '#10b981', // emerald
    category: 'Feature',
    progress: 0,
    assignee: { name: 'Kevin Thomas', initials: 'KT', color: 'bg-amber-100 text-amber-700 border-amber-200' }
  }
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<TaskStatus>('todo');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState('board');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Load state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setTasks(JSON.parse(saved));
      } else {
        setTasks(DEFAULT_TASKS);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_TASKS));
      }
    } catch (e) {
      console.error('Failed to load tasks from local storage:', e);
      setTasks(DEFAULT_TASKS);
    }
  }, []);

  // Save state on mutation
  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTasks));
    } catch (e) {
      console.error('Failed to save tasks to local storage:', e);
    }
  };

  // Create or Update task
  const handleSaveTask = (taskData: Partial<Task> & { title: string }) => {
    if (taskData.id) {
      // Editing Mode
      const updated = tasks.map((t) => (t.id === taskData.id ? { ...t, ...taskData } : t));
      saveTasks(updated as Task[]);
    } else {
      // Adding Mode
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: taskData.title,
        description: taskData.description || '',
        createdAt: new Date().toISOString(),
        status: taskData.status || modalDefaultStatus,
        priority: taskData.priority || 'medium',
        color: taskData.color || '#6366f1',
        category: (taskData as any).category || 'Feature',
        progress: (taskData as any).progress || 0,
        assignee: (taskData as any).assignee || { 
          name: 'John Doe', 
          initials: 'JD', 
          color: 'bg-indigo-100 text-indigo-700 border-indigo-200' 
        },
      } as any;
      saveTasks([...tasks, newTask]);
    }
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Open Modal to create
  const handleAddTaskClick = (status: TaskStatus) => {
    setModalDefaultStatus(status);
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  // Open Modal to edit
  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDropTask = (taskId: string, targetStatus: TaskStatus) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: targetStatus,
          // Set full progress automatically if moved to Done
          progress: targetStatus === 'done' ? 100 : (t as any).progress || 0,
        };
      }
      return t;
    });
    saveTasks(updated);
  };

  // Filtering Logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((task as any).category || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = 
      selectedPriorityFilter === 'all' || 
      task.priority === selectedPriorityFilter;

    const matchesCategory = 
      selectedCategoryFilter === 'all' || 
      (task as any).category === selectedCategoryFilter;

    return matchesSearch && matchesPriority && matchesCategory;
  });

  // Split tasks by status columns
  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  // Stats calculation
  const totalCompleted = tasks.filter(t => t.status === 'done').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completionPercentage = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;

  return (
    <div id="app-root" className="flex h-screen w-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans select-none">
      
      {/* Sidebar Navigation - High Density style */}
      <aside id="app-sidebar" className="w-16 flex flex-col items-center py-4 bg-slate-900 text-slate-400 border-r border-slate-800 flex-shrink-0">
        {/* Logo Icon */}
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mb-8 shadow-md">
          KB
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col gap-5 flex-1">
          <button 
            type="button"
            onClick={() => setActiveSidebarTab('board')}
            className={`w-10 h-10 rounded flex items-center justify-center transition-all ${
              activeSidebarTab === 'board' 
                ? 'bg-slate-800 text-indigo-400 border border-slate-700' 
                : 'hover:bg-slate-800 hover:text-slate-200'
            }`}
            title="Kanban Board View"
          >
            <Layout className="w-5 h-5" />
          </button>

          <button 
            type="button"
            onClick={() => setActiveSidebarTab('stats')}
            className={`w-10 h-10 rounded flex items-center justify-center transition-all ${
              activeSidebarTab === 'stats' 
                ? 'bg-slate-800 text-indigo-400 border border-slate-700' 
                : 'hover:bg-slate-800 hover:text-slate-200'
            }`}
            title="Overview Metrics"
          >
            <BarChart3 className="w-5 h-5" />
          </button>

          <button 
            type="button"
            onClick={() => alert('Vibe Kanban Board operates 100% offline. High Density workspace active.')}
            className="w-10 h-10 hover:bg-slate-800 hover:text-slate-200 rounded flex items-center justify-center transition-all"
            title="Timeline Logs"
          >
            <Clock className="w-5 h-5" />
          </button>

          <button 
            type="button"
            onClick={() => alert('Teams module is offline. Invite, collaborate and sync locally.')}
            className="w-10 h-10 hover:bg-slate-800 hover:text-slate-200 rounded flex items-center justify-center transition-all"
            title="Collaborators"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>

        {/* User Info bottom */}
        <div id="sidebar-user" className="mt-auto pt-4 flex flex-col items-center gap-4 border-t border-slate-800 w-full">
          <button 
            type="button"
            onClick={() => alert('Settings: Vibe Kanban Board v1.0. Applied Style: High Density Theme.')}
            className="w-10 h-10 hover:bg-slate-800 hover:text-slate-200 rounded flex items-center justify-center transition-all"
            title="System Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <div className="w-8 h-8 rounded-full bg-indigo-500 border border-indigo-400 flex items-center justify-center text-white text-xs font-bold font-mono shadow-xs">
            ME
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main id="app-main-content" className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header - High Density styled */}
        <header id="board-header" className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 shadow-3xs">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-800 tracking-tight">Main Board</h1>
            <div className="h-4 w-px bg-slate-300"></div>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wide">
              Dev Roadmap v1.0
            </span>
          </div>

          {/* Quick Header Search and Button */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                id="search-input"
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs rounded-md pl-8 pr-4 py-1.5 w-60 focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-slate-300 focus:bg-white transition-all text-slate-700 font-medium"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>

            <button 
              id="create-task-btn"
              onClick={() => handleAddTaskClick('todo')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-md transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>
          </div>
        </header>

        {/* Active View Container */}
        {activeSidebarTab === 'board' ? (
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            
            {/* Context Toolset Header (Filters and Quick stats) */}
            <div id="board-filters" className="flex flex-wrap items-center justify-between gap-4 mb-5 bg-white border border-slate-200/60 p-3 rounded-xl flex-shrink-0 shadow-2xs">
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Priority Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Priority:</span>
                  <div className="flex rounded-md bg-slate-100 p-0.5">
                    {['all', 'high', 'medium', 'low'].map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setSelectedPriorityFilter(p)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase transition-all ${
                          selectedPriorityFilter === p 
                            ? 'bg-white text-indigo-600 shadow-3xs' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Category:</span>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-[10px] font-extrabold text-slate-600 rounded-md px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-slate-300 transition-all cursor-pointer"
                  >
                    <option value="all">ALL CATEGORIES</option>
                    <option value="Feature">FEATURE</option>
                    <option value="Bug">BUG</option>
                    <option value="Design">DESIGN</option>
                    <option value="Core">CORE</option>
                    <option value="Marketing">MARKETING</option>
                  </select>
                </div>

                {/* Clear Filters Indicator */}
                {(selectedPriorityFilter !== 'all' || selectedCategoryFilter !== 'all' || searchQuery !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPriorityFilter('all');
                      setSelectedCategoryFilter('all');
                      setSearchQuery('');
                    }}
                    className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 hover:underline transition-all uppercase pl-2"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Quick Metrics display inside toolset */}
              <div className="flex items-center gap-5 text-right font-medium">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <div className="text-left">
                    <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">High Density Tasks</div>
                    <div className="text-xs font-extrabold text-slate-700 leading-snug">{filteredTasks.length} shown</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <div className="text-left">
                    <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">Completion</div>
                    <div className="text-xs font-extrabold text-slate-700 leading-snug">{completionPercentage}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kanban columns Grid */}
            <div id="tasks-grid" className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
              <KanbanColumn
                status="todo"
                title="To Do"
                tasks={todoTasks}
                draggedTaskId={draggedTaskId}
                onAddTaskClick={handleAddTaskClick}
                onSelectTask={handleSelectTask}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDropTask={handleDropTask}
              />

              <KanbanColumn
                status="in_progress"
                title="In Progress"
                tasks={inProgressTasks}
                draggedTaskId={draggedTaskId}
                onAddTaskClick={handleAddTaskClick}
                onSelectTask={handleSelectTask}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDropTask={handleDropTask}
              />

              <KanbanColumn
                status="done"
                title="Done"
                tasks={doneTasks}
                draggedTaskId={draggedTaskId}
                onAddTaskClick={handleAddTaskClick}
                onSelectTask={handleSelectTask}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDropTask={handleDropTask}
              />
            </div>

          </div>
        ) : (
          /* Stats dashboard view */
          <div id="stats-view" className="flex-1 p-6 overflow-y-auto space-y-6">
            <h2 className="text-base font-bold text-slate-800">Workspace Metrics Summary</h2>
            
            {/* Grid of counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Backlog/Todo</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{tasks.filter(t => t.status === 'todo').length}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Under Development</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{inProgressCount}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Completed Milestones</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{totalCompleted}</h3>
                </div>
                <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Completion metrics */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase">Operational Efficiency</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Task Completion Progress</span>
                  <span>{completionPercentage}% ({totalCompleted} of {tasks.length} tasks)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div 
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs font-medium text-slate-500">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <h4 className="font-bold text-slate-700 mb-1">High Priority Task Distribution</h4>
                  <p className="text-lg font-extrabold text-indigo-600">
                    {tasks.filter(t => t.priority === 'high').length} Tasks
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <h4 className="font-bold text-slate-700 mb-1">Local Latency Protection</h4>
                  <p className="text-lg font-extrabold text-emerald-600">
                    Active / 100% Client-Side
                  </p>
                </div>
              </div>
            </div>
            
            {/* Help / FAQ for users */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60 flex gap-4">
              <HelpCircle className="w-8 h-8 text-indigo-500 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">Helpful tips:</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every card move or edit operates in true sandbox isolation—saved immediately under key <code>vibe_kanban_state</code> inside <code>localStorage</code>. There are no remote networks tracking your boards.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Detail overlay modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        defaultStatus={modalDefaultStatus}
      />

    </div>
  );
}
