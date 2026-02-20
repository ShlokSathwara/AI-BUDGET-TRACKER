import React from 'react';

export default function Navbar() {
  return (
    <header className="w-full py-4 px-6 bg-gradient-to-r from-indigo-900 to-indigo-700 text-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Smart Budget Tracker</h1>
        <nav className="space-x-4">
          <button className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded">Sign in</button>
          <button className="bg-white text-indigo-800 px-3 py-1 rounded">Get started</button>
        </nav>
      </div>
    </header>
  );
}
