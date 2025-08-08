'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Bubble from './Bubble'

// Utility: create n unique random numbers in range
function genNumbers(count) {
  const arr = new Set()
  while (arr.size < count) arr.add(Math.floor(Math.random() * 21))
  return Array.from(arr)
}

export default function GameArea({ onRestart }) {
  const [phase, setPhase] = useState('idle') // idle, showing, playing, gameover
  const [count, setCount] = useState(5)
  const [numbers, setNumbers] = useState([])
  const [order, setOrder] = useState([])
  const [revealed, setRevealed] = useState(true)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [fadeDelay, setFadeDelay] = useState(1800) // ms - will decrease each round
  const [message, setMessage] = useState('')
  const correctIndex = useRef(0)
  const successAudio = useRef(null)
  const gameOverAudio = useRef(null)

  // preload audio
  useEffect(() => {
    try {
      successAudio.current = new Audio('/success.mp3')
      gameOverAudio.current = new Audio('/gameover.mp3')
    } catch (e) {
      successAudio.current = { play: () => {} }
      gameOverAudio.current = { play: () => {} }
    }
  }, [])

  // score display animation: updates header element
  useEffect(() => {
    const el = document.getElementById('score-display')
    if (!el) return
    el.textContent = score
    // gently animate when score changes (micro-interaction)
    el.animate(
      [
        { transform: 'translateY(0) scale(1)', opacity: 1 },
        { transform: 'translateY(-6px) scale(1.06)', opacity: 0.98 },
        { transform: 'translateY(0) scale(1)', opacity: 1 }
      ],
      { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1)' }
    )
  }, [score])

  useEffect(() => {
    let t
    if (phase === 'showing') {
      // numbers generated and visible; hide numbers after fadeDelay
      t = setTimeout(() => {
        setRevealed(false)
        setPhase('playing')
      }, fadeDelay)
    }
    return () => clearTimeout(t)
  }, [phase, fadeDelay])

  function startGame() {
    const nums = genNumbers(count)
    const ord = nums.slice().sort((a, b) => a - b)
    setNumbers(nums)
    setOrder(ord)
    correctIndex.current = 0
    setRevealed(true)
    setPhase('showing')
    setMessage('Remember the numbers')
  }

  function handleBubbleClick(val) {
    if (phase !== 'playing') return
    const expected = order[correctIndex.current]
    if (val === expected) {
      // correct
      correctIndex.current += 1
      setScore(s => s + 10)
      // soft success chime
      try { successAudio.current?.play() } catch (e) {}

      if (correctIndex.current >= order.length) {
        // round complete
        setMessage(['Great job!', "You're getting sharper!", 'Nice memory!'][Math.floor(Math.random() * 3)])
        setRound(r => r + 1)
        // increase difficulty: shorter fadeDelay to a minimum
        setFadeDelay(d => Math.max(450, Math.round(d * 0.85)))
        // add another bubble every 3 rounds up to 8
        setCount(c => Math.min(8, c + (round % 3 === 0 ? 1 : 0)))
        // brief pause before next round
        setPhase('showing')
        setNumbers(() => {
          const nums = genNumbers(Math.min(8, count + (round % 3 === 0 ? 1 : 0)))
          setOrder(nums.slice().sort((a, b) => a - b))
          correctIndex.current = 0
          setRevealed(true)
          return nums
        })
      }
    } else {
      // incorrect -> game over
      triggerWrongFeedback()
    }
  }

  function triggerWrongFeedback() {
    // vibration when supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
    // red flash
    const el = document.querySelector('#game-area')
    if (el) {
      el.animate(
        [
          { boxShadow: '0 0 0px rgba(255,0,0,0)' },
          { boxShadow: '0 0 40px rgba(220,38,38,0.28)' }
        ],
        { duration: 280, iterations: 1, easing: 'ease-out' }
      )
    }

    // Reveal numbers so player can see correct order
    setRevealed(true)

    try { gameOverAudio.current?.play() } catch (e) {}

    // Small delay before game over so they can see numbers
    setTimeout(() => {
      setPhase('gameover')
    }, 1200) // 1.2 seconds
  }

  function resetFull() {
    setPhase('idle')
    setCount(5)
    setNumbers([])
    setOrder([])
    setScore(0)
    setRound(1)
    setFadeDelay(1400)
    setMessage('')
    onRestart && onRestart()
  }

  // generate initial numbers when entering showing phase with no numbers
  useEffect(() => {
    if (phase === 'showing' && numbers.length === 0) {
      startGame()
    }
  }, [phase])

  // layout positions for bubbles: responsive grid/fallback polar placement.
  const positions = useMemo(() => {
    // We'll still return absolute positions for larger screens,
    // but on small screens the Bubble component also supports grid placement.
    const arr = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 18 + (i % 2) * 6
      const x = 50 + radius * Math.cos(angle)
      const y = 50 + radius * Math.sin(angle)
      arr.push({ left: `${Math.min(86, Math.max(8, x))}%`, top: `${Math.min(86, Math.max(8, y))}%` })
    }
    return arr
  }, [count])

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs sm:text-sm text-slate-500">Round</div>
          <div className="text-lg sm:text-xl font-semibold">{round}</div>
        </div>

        <div className="text-center">
          <div className="text-xs sm:text-sm text-slate-500">Speed</div>
          <div className="text-sm sm:text-base">{Math.round(2000 / fadeDelay * 100) / 100}x</div>
        </div>

        <div className="flex-1 text-right">
          <div className="text-xs sm:text-sm text-slate-500">Score</div>
          <div className="text-lg sm:text-2xl font-bold">{score}</div>
        </div>
      </div>

      <div
        id="game-area"
        className="relative bg-gradient-to-b from-white to-blue-50 rounded-2xl p-4 sm:p-6 min-h-[420px] shadow-lg overflow-hidden"
        role="application"
        aria-label="Memory game area"
      >
        {/* Message pill (fade-in on round/message change) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 top-4 px-4 py-1 rounded-full bg-white/70 backdrop-blur-sm text-sm font-medium animate-fadein"
          key={message + phase}
        >
          {message || (phase === 'idle' ? 'Tap Start to begin' : phase === 'showing' ? 'Memorize the numbers' : phase === 'playing' ? 'Tap in ascending order' : 'Game over')}
        </div>

        {/* bubbles layout: responsive grid on small screens, absolute on larger */}
        <div className="relative">
          <div className="mx-auto w-full max-w-2xl">
            {/* Grid for small screens */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 md:hidden">
              {numbers.map((n, i) => (
                <Bubble
                  key={i}
                  number={n}
                  visible={revealed}
                  style={{}} // grid layout handled in Bubble when style is empty
                  onClick={() => handleBubbleClick(n)}
                />
              ))}
            </div>

            {/* Absolute layout for md+ */}
            <div className="hidden md:block relative h-[360px]">
              {numbers.map((n, i) => (
                <Bubble
                  key={i}
                  number={n}
                  visible={revealed}
                  style={positions[i]}
                  onClick={() => handleBubbleClick(n)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {phase === 'idle' && (
            <button
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.99] transition transform duration-200"
              onClick={() => startGame()}
            >
              Start Game
            </button>
          )}

          {phase === 'playing' && (
            <button
              className="w-full sm:w-auto px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 transition"
              onClick={() => { setPhase('idle'); setNumbers([]) }}
            >
              Quit
            </button>
          )}

          {phase === 'gameover' && (
            <div className="flex flex-col items-center">
              <div className="text-2xl sm:text-3xl font-extrabold">Final Score: {score}</div>
              <p className="mt-2 text-slate-600">{['Keep going — you improved already!', 'Nice attempt — try again!', 'Practice makes perfect!'][Math.floor(Math.random() * 3)]}</p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold" onClick={() => { resetFull(); startGame() }}>Play Again</button>
                <button className="px-4 py-2 rounded-full border" onClick={resetFull}>Home</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
