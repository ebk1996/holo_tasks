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
        <div>
          <h4 className="text-3xl font-bold text-cyan-400">Holographix&reg;</h4>
          <h6 className="text-[#10a562ff]">Task Management System</h6>
          <span className="text-sky-400 block mt-2 text-sm" style={{ color: '#7ca2efff' }}>
            <b>Holographix&reg;</b> Transforms a <b><i>basic to-do list</i></b> into a <b>shimmering</b> 3D holographic glowing <b><i>aura of hope</i></b>, a holographic text <b><i>rendering</i></b> that you can <b><i>view from any position in X, Y, and Z coordinates in a 3D space.</i></b>
          </span>
        </div>
        <span className="holo-header">"Thank you for trusting the world's most intelligent hologram task management system!" -Holographix&reg; 
        </span>
      </header>

      <div className="flex flex-grow overflow-hidden">
        <ThreeScene tasks={tasks} onToggle={toggleTask} />
        <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onAdd={addTask} onSuggest={suggestPriority} />
      </div>

      <footer className="p-3 bg-gray-800 text-center text-gray-500 text-sm rounded-t-lg">
        <span className="holo-footer">Hologram Task Manager</span>
        <br />
          <span className="text-[#10a562ff]">Holographix&reg;</span>
        <br />
        Design by
        <a href="https://github.com/ebk1996/holo_tasks.git">
          <br />
          <span className="text-cyan-400">
            Bryson K. Echols
          </span>
        </a>
        <br />
          <span className="text-[#10a562ff]">MIT License</span>
        <br />
        2025
        <br />
        &copy;
      </footer>
    </div>
  );
}
