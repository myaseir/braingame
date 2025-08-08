// components/BubbleGame.jsx
"use client";
import ParticlesBackground from './ParticlesBackground';
import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './BubbleGame.module.css';

const BubbleGame = ({ onRestart }) => {

  // Game state
  const [gameState, setGameState] = useState('idle');
  const [numbers, setNumbers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(false);
  const [clickedNumbers, setClickedNumbers] = useState([]);
  const [correctNumbers, setCorrectNumbers] = useState([]);
  const [countdown, setCountdown] = useState(3);
  const [showPerfectRound, setShowPerfectRound] = useState(false);

const [health, setHealth] = useState(0);
const [streak, setStreak] = useState(0);




  const [showRoundScreen, setShowRoundScreen] = useState(false);
const [perfectRound, setPerfectRound] = useState(false); // For suggestion #5

// PASTE INSIDE startRound FUNCTION (replace your current one)

  // Configuration
  const initialCount = 3;
  const maxRound = 10;
  const initialRevealTime = 3000;
  const minRevealTime = 1000;
// max 7 seconds (7000 ms)

  
const [highScore, setHighScore] = useState(0);

useEffect(() => {
  const savedHighScore = localStorage.getItem('highScore');
  if (savedHighScore) setHighScore(parseInt(savedHighScore));
}, []);
  
  const vibrate = (pattern = 200) => {
  if (navigator.vibrate) navigator.vibrate(pattern);
};


// Call vibrate() on correct/wrong answers
  // Generate random positions
 const generatePositions = useCallback((count) => {
  const positions = [];

  const minDistance = 15; // minimum distance in % between bubbles

  function distance(pos1, pos2) {
    const dx = pos1.left - pos2.left;
    const dy = pos1.top - pos2.top;
    return Math.sqrt(dx * dx + dy * dy);
  }

  for (let i = 0; i < count; i++) {
    let newPos;
    let tries = 0;
    do {
      newPos = {
        left: 10 + Math.random() * 80,
        top: 15 + Math.random() * 70
      };
      tries++;
      if (tries > 100) break; // fail-safe to avoid infinite loops
    } while (positions.some(pos => distance(pos, newPos) < minDistance));
    positions.push(newPos);
  }

  return positions;
}, []);


  // Generate unique numbers
  const generateNumbers = useCallback((count) => {
    const nums = new Set();
    while (nums.size < count) {
      nums.add(Math.floor(Math.random() * 21));
    }
    return Array.from(nums);
  }, []);

  // Start new game
  const startGame = useCallback(() => {
    setScore(0);
    setRound(1);
    setClickedNumbers([]);
    setCorrectNumbers([]);
    startRound(1);
  }, []);

  // Start new round
// Update the startRound function in your BubbleGame component
const startRound = useCallback((roundNum) => {
  setShowRoundScreen(true);
  setCountdown(3);

  let counter = 3;
  const interval = setInterval(() => {
    counter -= 1;
    if (counter === 0) {
      clearInterval(interval);
      setShowRoundScreen(false);

      const count = 4; // keep 5 bubbles always
      const nums = generateNumbers(count);
      const pos = generatePositions(count);
      setNumbers(nums);
      setPositions(pos);
      setCurrentStep(0);
      setError(false);
      setClickedNumbers([]);
      setCorrectNumbers([]);
      setGameState('showing');

    const revealTime = Math.max(initialRevealTime - (roundNum - 1) * 500, minRevealTime);


      console.log('Round:', roundNum, 'Reveal time (ms):', revealTime);
      
      setTimeout(() => {
        setGameState('playing');
      }, revealTime);
    } else {
      setCountdown(counter);
    }
  }, 1000);
}, [generateNumbers, generatePositions]);




  // Handle bubble click
const handleClick = (num) => {
  if (gameState !== 'playing') return;

  const sorted = [...numbers].sort((a, b) => a - b);
  setClickedNumbers(prev => [...prev, num]);

  if (num === sorted[currentStep]) {
    setCorrectNumbers(prev => [...prev, num]);
    vibrate(100); // short buzz on correct click

    if (currentStep + 1 === sorted.length) {
      // Round complete - calculate new score first
      const updatedScore = score + numbers.length;
      const newRound = round + 1;

      // Then check high score
      if (updatedScore > highScore) {
        localStorage.setItem('highScore', updatedScore);
        setHighScore(updatedScore);
      }

      setScore(updatedScore);

      // Increase streak by 1
      setStreak(prevStreak => {
        const newStreak = prevStreak + 1;

        // If streak hits 4, add 1 health and reset streak to 0
        if (newStreak === 4) {
          setHealth(h => h + 1);
          return 0;
        }
        return newStreak;
      });

      // Show Perfect Round celebration if no errors this round
      if (!error) {
        setShowPerfectRound(true);
        setTimeout(() => setShowPerfectRound(false), 2000);
      }

      if (newRound > maxRound) {
        setGameState('gameover');
      } else {
        setRound(newRound);
        startRound(newRound);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }

  } else {
    vibrate([200, 100, 200]); // longer vibration on error

    // On error: 
    // if health > 0, consume health and keep playing (reset streak)
    if (health > 0) {
      setHealth(h => h - 1);
      setStreak(0);
      setError(true);
      // maybe reset current step to allow retry? Or just continue playing
      // Here I suggest you can just mark error but allow retry on same step:
      setTimeout(() => setError(false), 1000);
    } else {
      // no health left -> game over
      setError(true);
      setTimeout(() => setGameState('gameover'), 1000);
    }
  }
};


  return (
    
    <div className={styles.container}>
      <ParticlesBackground />
      <div className={styles.header}>
        <div className={styles.icon}>🧠</div>
        {/* <div className={styles.highScore}>Best: {highScore} Round: {round} </div> */}

        <div className={styles.score}>Score: {score}
</div>
        <div className={styles.icon}>☰</div>
      </div>
<div className={styles.statusBar}>
  <div>Health: {health}</div>
  <div>Streak: {streak}</div>
</div>


      <div className={styles.bubblesContainer}>
        {numbers.map((num, i) => (
          <button
            key={i}
            className={`${styles.bubble} ${error ? styles.error : ''} ${
              clickedNumbers.includes(num) ? styles.clicked : ''
            } ${correctNumbers.includes(num) ? styles.correct : ''}`}
            style={{
              left: `${positions[i]?.left || 0}%`,
              top: `${positions[i]?.top || 0}%`
            }}
            onClick={() => handleClick(num)}
          >
            {(gameState === 'showing' || gameState === 'gameover' || clickedNumbers.includes(num)) && (
              <span className={styles.number}>{num}</span>
            )}
            {correctNumbers.includes(num) && (
              <span className={styles.checkmark}>✓</span>
            )}
          </button>
        ))}
      </div>

      {gameState === 'idle' && (
        <div className={styles.startScreen}>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className={styles.gameOverScreen}>
          <h2>Game Over</h2>
          <p>Score: {score}</p>
          <button onClick={startGame}>Restart</button>
        </div>
      )}
{showRoundScreen && (
  <div className={styles.roundTransition}>
    <h2>Round {round}</h2>
    <div className={styles.countdown}>{countdown}</div>
  </div>
)}


{showPerfectRound && (
  <div className={styles.perfectRoundCelebration}>
    🎉 Perfect Round! 🎉
  </div>
)}

    </div>
  );
};

export default BubbleGame;