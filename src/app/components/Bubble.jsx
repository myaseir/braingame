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
const [won, setWon] = useState(false);
const [gameStarted, setGameStarted] = useState(false);

const [health, setHealth] = useState(0);
const [streak, setStreak] = useState(0);



// music
  const audioRef = useRef(null);           // background music
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const gameOverAudioRef = useRef(null);
  const winAudioRef = useRef(null);
  const startSoundRef = useRef(null);
const returnSoundRef = useRef(null);






  const [showRoundScreen, setShowRoundScreen] = useState(false);
const [perfectRound, setPerfectRound] = useState(false); // For suggestion #5

// PASTE INSIDE startRound FUNCTION (replace your current one)

  // Configuration
  const initialCount = 3;
  const maxRound = 20;
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



  useEffect(() => {
    if (!audioRef.current) return;

    let targetVolume;
    if (gameState === 'playing') {
      targetVolume = 1.0;  // loud when playing
    } else if (gameState === 'showing' || gameState === 'idle') {
      targetVolume = 0.3;  // quieter during countdown or idle
    } else if (gameState === 'gameover') {
      targetVolume = 0.1;  // very low on game over
    } else {
      targetVolume = 0.1;  // fallback volume
    }

    const duration = 1000; // 1 second fade
    const stepTime = 50;
    const steps = duration / stepTime;
    const volumeStep = (targetVolume - audioRef.current.volume) / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      if (audioRef.current) {
        audioRef.current.volume = Math.min(
          Math.max(audioRef.current.volume + volumeStep, 0),
          1
        );
      }
      currentStep++;
      if (currentStep >= steps) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, [gameState]);

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
  }, 500);
}, [generateNumbers, generatePositions]);
  // Start new game
const startGame = useCallback(() => {
  setGameStarted(true);
  setHealth(0);      // Reset health to 0 when starting game
  setStreak(0);      // Reset streak to 0
  setScore(0);
  setRound(1);
  setClickedNumbers([]);
  setCorrectNumbers([]);
  startRound(1);
  if (audioRef.current) {
    audioRef.current.play().catch(() => {
      // autoplay might be blocked, can handle fallback here if needed
    });
  }
}, [startRound]);


  // Start new round
// Update the startRound function in your BubbleGame component





  // Handle bubble click
const handleClick = (num) => {
  if (gameState !== 'playing') return;

  const sorted = [...numbers].sort((a, b) => a - b);
  setClickedNumbers(prev => [...prev, num]);

  if (num === sorted[currentStep]) {
    setCorrectNumbers(prev => [...prev, num]);
    vibrate(100); // short buzz on correct click

    // Play correct click sound
    if (correctAudioRef.current) {
      correctAudioRef.current.currentTime = 0;
      correctAudioRef.current.play().catch(() => {});
    }

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

      // Increase streak by 1 or reset if hits 4
      setStreak(prevStreak => (prevStreak + 1 === 4 ? 0 : prevStreak + 1));

      // Show Perfect Round celebration if no errors this round
      if (!error) {
        setShowPerfectRound(true);
        setTimeout(() => setShowPerfectRound(false), 2000);
      }

      if (newRound > maxRound) {
        setWon(true);
        setGameState('gameover');

        // Play winning sound
        if (winAudioRef.current) {
          winAudioRef.current.currentTime = 0;
          winAudioRef.current.play().catch(() => {});
        }
      } else {
        setRound(newRound);
        startRound(newRound);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  } else {
    vibrate([200, 100, 200]); // longer vibration on error

    // Play wrong click sound
    if (wrongAudioRef.current) {
      wrongAudioRef.current.currentTime = 0;
      wrongAudioRef.current.play().catch(() => {});
    }

    // On error: consume health if available, reset streak
    if (health > 0) {
      setHealth(h => h - 1);
      setStreak(0);
      setError(true);
      setTimeout(() => setError(false), 1000);
    } else {
      // no health left -> game over
      setError(true);
      setTimeout(() => setGameState('gameover'), 1000);

      // Play game over sound
      if (gameOverAudioRef.current) {
        gameOverAudioRef.current.currentTime = 0;
        gameOverAudioRef.current.play().catch(() => {});
      }
    }
  }
};

// And add this useEffect somewhere inside your component to handle health increment:
useEffect(() => {
  if (streak === 4) {
    setHealth(h => h + 1);
  }
}, [streak]);



  return (
    
    <div className={styles.container}>
      <ParticlesBackground />
       {/* Background music */}
      <audio ref={audioRef} src="/bgmusic.mp3" loop preload="auto" />

      {/* Sound effects */}
      <audio ref={correctAudioRef} src="/tap.wav" preload="auto" />
      <audio ref={wrongAudioRef} src="/error.mp3" preload="auto" />
      <audio ref={gameOverAudioRef} src="/over.wav" preload="auto" />
      <audio ref={winAudioRef} src="/win.wav" preload="auto" />
  <audio ref={startSoundRef} src="/start.wav" />
<audio ref={returnSoundRef} src="/return.wav" />


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
          <button onClick={() => {
  if (startSoundRef.current) {
    startSoundRef.current.currentTime = 0;
    startSoundRef.current.play().catch(() => {});
  }
  startGame();
}}>Start Game</button>

        </div>
      )}

    {gameState === 'gameover' && (
  <div className={styles.gameOverScreen}>
    {won ? (
      <>
        <h2>🎉 Congratulations, You Won! 🎉</h2>
        <p>Final Score: {score}</p>
      </>
    ) : (
      <>
        <h2>Game Over</h2>
        <p>Score: {score}</p>
      </>
    )}
  <button onClick={() => {
  if (returnSoundRef.current) {
    returnSoundRef.current.currentTime = 0;
    returnSoundRef.current.play().catch(() => {});
  }
  setWon(false); // reset winning state on restart
  startGame();
}}>Restart</button>
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