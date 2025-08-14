import React, { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ThreeScene from './components/ThreeScene';
import TaskList from './components/TaskList';
import { useLocalStorage } from './hooks/useLocalStorage';
import { suggestPriority } from './services/priorityService';

export default function App() {
  const [tasks, setTasks] = useLocalStorage('holo.tasks', []);

  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, [setTasks]);

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, [setTasks]);

  const addTask = useCallback((text, suggestedPriorityValue) => {
    const task = {
      id: uuidv4(),
      text,
      completed: false,
      priority: Number.isInteger(suggestedPriorityValue) ? suggestedPriorityValue : Math.floor(Math.random() * 3),
      createdAt: Date.now(),
    };
    setTasks(prev => [...prev, task]);
  }, [setTasks]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-inter">
      <header className="p-4 bg-gray-800 shadow-lg flex justify-between items-center rounded-b-lg">
        <h1 className="text-3xl font-bold text-cyan-400">Holographic Task Manager&trade;</h1>
        <span className="text-sm text-gray-400">Drag to rotate, scroll to zoom, click 3D tasks to toggle</span>
      </header>

      <div className="flex flex-grow overflow-hidden">
        <ThreeScene tasks={tasks} onToggle={toggleTask} />
        <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onAdd={addTask} onSuggest={suggestPriority} />
      </div>

      <footer className="p-3 bg-gray-800 text-center text-gray-500 text-sm rounded-t-lg">
        Holographic Task Manager&trade; by <a href="https://github.com/ebk1996/holo_tasks.git">ebk1996</a>
      </footer>
    </div>
  );
}
