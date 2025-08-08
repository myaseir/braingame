// components/Header.jsx
import React from 'react'

export default function Header() {
  return (
    <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between relative">
      {/* Center block with logo + title */}
      <div className="absolute inset-x-0 top-3 flex items-center justify-center pointer-events-none">
        <div className="flex items-center space-x-3 bg-white/40 backdrop-blur rounded-full px-3 py-1 shadow-sm pointer-events-auto">
          <img
            src="/neuron.svg"
            alt="Neuron"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
            aria-hidden="false"
          />
          <div className="text-left">
            <h1 className="text-sm sm:text-lg md:text-xl font-semibold leading-tight tracking-tight text-slate-900">
              Neuron
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-500 -mt-0.5">Short-term memory trainer</p>
          </div>
        </div>
      </div>

      {/* Left: spacer to keep center logo visually centered */}
      <div className="w-12" />

      {/* Right: Score block (responsive) */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-[11px] sm:text-xs text-slate-500">Score</div>
          <div
            id="score-display"
            className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 leading-none select-none"
            aria-live="polite"
          >
            0
          </div>
        </div>
        {/* Optional small trophy icon placeholder (keeps visual balance) */}
        <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-md bg-white/60 shadow-sm">
          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M8 21h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M7 3h10v3a3 3 0 0 1-3 3H10A3 3 0 0 1 7 6V3z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </header>
  )
}
