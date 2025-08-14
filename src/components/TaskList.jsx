import React, { useMemo, useState } from 'react';
import { priorityBadgeClass, priorityLabel } from '../utils/priority';

export default function TaskList({ tasks, onToggle, onDelete, onAdd, onSuggest }) {
  const [text, setText] = useState('');
  const [suggested, setSuggested] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('created');

  const pending = tasks.filter(t => !t.completed).length;

  const visible = useMemo(() => {
    let arr = tasks.slice();
    if (filter === 'active') arr = arr.filter(t => !t.completed);
    else if (filter === 'done') arr = arr.filter(t => t.completed);
    if (sort === 'priority') arr.sort((a,b) => b.priority - a.priority);
    return arr;
  }, [tasks, filter, sort]);

  async function handleSuggest() {
    if (!text.trim()) return;
    setIsLoading(true); setSuggested(null);
    try {
      const n = await onSuggest(text.trim());
      setSuggested(n);
    } finally { setIsLoading(false); }
  }

  function handleAdd() {
    if (!text.trim()) return;
    onAdd(text.trim(), suggested);
    setText('');
    setSuggested(null);
  }

  return (
    <div className="w-1/3 p-6 bg-gray-800 m-4 rounded-lg shadow-xl flex flex-col">
      <h2 className="text-2xl font-semibold mb-2 text-cyan-300">My Tasks</h2>
      <p className="text-sm text-gray-400 mb-4">{pending} pending</p>

      <div className="mb-4 flex gap-2">
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg p-2">
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="done">Completed</option>
        </select>
        <select value={sort} onChange={e=>setSort(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg p-2">
          <option value="created">Sort: Created</option>
          <option value="priority">Sort: Priority</option>
        </select>
      </div>

      <div className="mb-6 flex space-x-2">
        <input
          type="text"
          className="flex-grow p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Add a new holographic task..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') { setText(''); setSuggested(null); }
          }}
        />
        <button onClick={handleAdd} className="px-5 py-3 bg-cyan-600 text-white rounded-lg shadow-md hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500">
          Add Task
        </button>
        <button
          onClick={handleSuggest}
          disabled={isLoading || !text.trim()}
          className={`px-5 py-3 rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
        >
          {isLoading ? 'Suggesting...' : 'Suggest Priority ✨'}
        </button>
      </div>

      {suggested !== null && (
        <p className="text-sm text-gray-300 mb-4">
          Suggested Priority: <span className={`font-bold ${priorityBadgeClass(suggested)}`}>{priorityLabel(suggested)}</span>
          <span className="ml-2 text-gray-400">(Click Add Task to use this)</span>
        </p>
      )}

      <div className="flex-grow overflow-y-auto pr-2" style={{ scrollbarGutter: 'stable' }}>
        {visible.length === 0 ? (
          <p className="text-gray-400 text-center mt-8">No tasks yet! Add some above.</p>
        ) : (
          <ul className="space-y-3">
            {visible.map((task) => (
              <li key={task.id} className={`flex items-center justify-between p-4 rounded-lg shadow-md transition-all duration-200 ${task.completed ? 'bg-green-800/50 border border-green-700' : 'bg-gray-700 border border-gray-600'}`}>
                <div className="flex items-center">
                  <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} className="form-checkbox h-5 w-5 text-cyan-500 rounded border-gray-500 focus:ring-cyan-500 cursor-pointer" />
                  <span className={`ml-3 text-lg ${task.completed ? 'line-through text-gray-400' : 'text-white'}`}>{task.text}</span>
                  <span className={`ml-3 text-xs px-2 py-1 rounded-full ${priorityBadgeClass(task.priority)}`}>{priorityLabel(task.priority)}</span>
                </div>
                <button onClick={() => onDelete(task.id)} className="ml-4 p-2 text-red-400 hover:text-red-500 transition-colors duration-200 rounded-full hover:bg-gray-600" title="Delete Task">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
