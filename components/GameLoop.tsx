
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { QUESTIONS } from '../constants';
import { Question, TruckConfig } from '../types';
import { Bed, Truck, DollarSign, Package, Users } from 'lucide-react';
import TruckCharacter from './TruckCharacter';

interface GameLoopProps {
  onGameOver: (score: number, passed: boolean, correctAnswer?: string) => void;
  onScoreUpdate: (score: number) => void;
  truckConfig: TruckConfig;
  onPlaySound: (type: 'success' | 'fail') => void;
}

interface Obstacle {
  id: number;
  y: number; // Percentage 0 to 100
  question: Question;
}

interface SceneryObject {
  id: number;
  type: 'house' | 'tree';
  side: 'left' | 'right';
  xOffset: number; // pixel offset from road edge
  y: number; // Percentage
  scale: number;
  color: string;
}

const PLAYER_Z_INDEX = 50;

// Simple 3D House Component
const House3D = ({ color, scale }: { color: string, scale: number }) => (
  <div style={{ transform: `scale(${scale})` }} className="relative w-24 h-24">
    {/* Shadow */}
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-8 bg-black/30 blur-md rounded-full" />
    
    {/* Main Body */}
    <div className={`absolute bottom-2 left-2 right-2 h-16 ${color} rounded-sm shadow-lg border-b-4 border-black/20 flex justify-around items-end pb-2`}>
        {/* Door */}
        <div className="w-6 h-8 bg-gray-800 rounded-t-sm mx-1 border-2 border-gray-600"></div>
        {/* Window */}
        <div className="w-6 h-6 bg-blue-300 rounded-sm mb-2 border-2 border-white/50 shadow-inner"></div>
    </div>
    
    {/* Roof (Front Face) */}
    <div className="absolute bottom-[4.5rem] left-0 w-full h-12 bg-slate-800 clip-path-triangle shadow-sm flex items-center justify-center z-10"
         style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
          <div className="w-8 h-8 bg-slate-700/50 rounded-full mt-4"></div>
    </div>
    
    {/* Chimney */}
    <div className="absolute bottom-16 right-4 w-3 h-8 bg-orange-700 border border-orange-900"></div>
  </div>
);

// Simple 3D Tree Component
const Tree3D = ({ scale }: { scale: number }) => (
  <div style={{ transform: `scale(${scale})` }} className="relative w-16 h-24 flex flex-col items-center justify-end">
    {/* Shadow */}
    <div className="absolute bottom-0 w-16 h-4 bg-black/20 blur-sm rounded-full" />
    
    {/* Trunk */}
    <div className="w-4 h-8 bg-[#5D4037] rounded-sm relative z-10"></div>
    
    {/* Foliage Layers */}
    <div className="w-14 h-14 bg-[#388E3C] rounded-full absolute bottom-6 z-20 shadow-md border-b-2 border-[#1B5E20]"></div>
    <div className="w-10 h-10 bg-[#4CAF50] rounded-full absolute bottom-14 z-20 shadow-sm"></div>
  </div>
);

// Fisher-Yates Shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const GameLoop: React.FC<GameLoopProps> = ({ onGameOver, onScoreUpdate, truckConfig, onPlaySound }) => {
  const [playerLane, setPlayerLane] = useState<0 | 1 | 2>(1); // 0=Left, 1=Center, 2=Right
  const [currentObstacle, setCurrentObstacle] = useState<Obstacle | null>(null);
  const [scenery, setScenery] = useState<SceneryObject[]>([]);
  const [score, setScore] = useState(0);
  const [animatingHit, setAnimatingHit] = useState<'success' | 'fail' | null>(null);

  // Refs for loop state to avoid closure staleness
  const requestRef = useRef<number>(0);
  const scoreRef = useRef(0);
  const speedRef = useRef(0.2); // Starting speed (adjusted for 200% height)
  const obstacleRef = useRef<Obstacle | null>(null);
  const sceneryRef = useRef<SceneryObject[]>([]);
  const playerLaneRef = useRef(1);
  const isGameOverRef = useRef(false);
  const questionIndexRef = useRef(0);
  const frameCountRef = useRef(0);
  
  // Store the shuffled questions for this session
  const shuffledQuestionsRef = useRef<Question[]>([]);

  // Initialize Game
  useEffect(() => {
    // Shuffle questions when component mounts (start of game)
    shuffledQuestionsRef.current = shuffleArray(QUESTIONS);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOverRef.current) return;
      
      if (e.key === 'ArrowLeft') {
        setPlayerLane((prev) => {
          const next = Math.max(0, prev - 1) as 0 | 1 | 2;
          playerLaneRef.current = next;
          return next;
        });
      } else if (e.key === 'ArrowRight') {
        setPlayerLane((prev) => {
          const next = Math.min(2, prev + 1) as 0 | 1 | 2;
          playerLaneRef.current = next;
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch controls
  const handleTouch = (lane: 0 | 1 | 2) => {
    if (isGameOverRef.current) return;
    setPlayerLane(lane);
    playerLaneRef.current = lane;
  }

  // Spawning logic
  const spawnObstacle = () => {
    if (questionIndexRef.current >= shuffledQuestionsRef.current.length) {
      isGameOverRef.current = true;
      onGameOver(scoreRef.current, true);
      return;
    }

    const question = shuffledQuestionsRef.current[questionIndexRef.current];
    questionIndexRef.current += 1;

    const newObstacle: Obstacle = {
      id: Date.now(),
      y: -30, // Start closer to view (was -50) to appear faster
      question: question
    };
    
    obstacleRef.current = newObstacle;
    setCurrentObstacle(newObstacle);
  };

  const spawnScenery = () => {
    // Spawn scenery more frequently
    if (frameCountRef.current % 30 === 0) { // Every ~0.5 seconds
        const id = Date.now() + Math.random();
        const side = Math.random() > 0.5 ? 'left' : 'right';
        const type = Math.random() > 0.3 ? 'house' : 'tree';
        
        // Random visual properties
        const houseColors = ['bg-indigo-500', 'bg-orange-400', 'bg-teal-500', 'bg-rose-500'];
        const color = houseColors[Math.floor(Math.random() * houseColors.length)];
        const scale = 0.8 + Math.random() * 0.4;
        
        // Position offset from road
        // Road is centered. We place items relative to the road container.
        // Left side: -120px to -300px
        // Right side: 120% to 150% (roughly width + offset)
        const xOffset = side === 'left' 
            ? -150 - Math.random() * 200 
            : 100 + Math.random() * 200; // Simplified for CSS logic later

        const newObj: SceneryObject = {
            id,
            type,
            side,
            xOffset,
            y: -20, // Start just above
            scale,
            color
        };

        sceneryRef.current.push(newObj);
    }
  };

  // Main Loop
  const animate = useCallback(() => {
    if (isGameOverRef.current) return;
    
    frameCountRef.current += 1;
    
    // --- OBSTACLES ---
    if (!obstacleRef.current) {
      spawnObstacle();
    } else {
      // Move obstacle down
      obstacleRef.current.y += speedRef.current;
      setCurrentObstacle({ ...obstacleRef.current });

      // Collision Check
      // Player is at bottom-[4%] (approx 96% from top of container visually)
      // Collision threshold logic
      if (obstacleRef.current.y > 92 && obstacleRef.current.y < 98) {
        // Simple hit detection logic: checks once when it crosses the threshold
        if (obstacleRef.current.y > 92 && obstacleRef.current.y < 92 + speedRef.current + 0.1) {
             const isCorrect = playerLaneRef.current === obstacleRef.current.question.correctIndex;
             
             if (isCorrect) {
                setAnimatingHit('success');
                onPlaySound('success');
                scoreRef.current += 10;
                setScore(scoreRef.current);
                onScoreUpdate(scoreRef.current);
                
                // Continuous Speed Increase
                // Base 0.2 + (Score * 0.001)
                // Example: 0 pts = 0.2
                // Example: 100 pts = 0.3
                // Example: 500 pts = 0.7
                const newSpeed = 0.2 + (scoreRef.current * 0.001);
                // Cap max speed to remain playable
                speedRef.current = Math.min(newSpeed, 2.0);

                setTimeout(() => setAnimatingHit(null), 1000); // 1s animation duration
             } else {
                 setAnimatingHit('fail');
                 onPlaySound('fail');
                 isGameOverRef.current = true;
                 
                 // Get the correct answer to display
                 const correctAnswerText = obstacleRef.current.question.answers[obstacleRef.current.question.correctIndex];
                 
                 setTimeout(() => {
                     onGameOver(scoreRef.current, false, correctAnswerText);
                 }, 500);
             }
        }
      }

      // Cleanup if off screen
      if (obstacleRef.current.y > 120) {
        obstacleRef.current = null;
        setCurrentObstacle(null);
      }
    }

    // --- SCENERY ---
    spawnScenery();
    // Move and filter scenery
    sceneryRef.current.forEach(obj => {
        obj.y += speedRef.current;
    });
    // Remove off-screen
    sceneryRef.current = sceneryRef.current.filter(obj => obj.y < 120);
    setScenery([...sceneryRef.current]);


    requestRef.current = requestAnimationFrame(animate);
  }, [onGameOver, onScoreUpdate, onPlaySound]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  // Visual helper for category icon
  const getIcon = (category: string) => {
    switch(category) {
        case 'Desconto': return <DollarSign className="w-6 h-6 text-green-500" />;
        case 'Travesseiro': return <Bed className="w-6 h-6 text-blue-500" />;
        case 'Frete': return <Truck className="w-6 h-6 text-yellow-500" />;
        case 'Comissão': return <Package className="w-6 h-6 text-purple-500" />;
        case 'Atendimento': return <Users className="w-6 h-6 text-orange-500" />;
        default: return <Bed />;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-green-600 perspective-container select-none">
      
      {/* Grass Environment Detail */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            transform: 'scale(1.5)',
        }}
      />
      {/* Horizon Fade */}
      <div className="absolute top-0 w-full h-1/3 bg-gradient-to-b from-sky-300 to-transparent z-0"></div>

      {/* --- QUESTION HUD (Rendered outside of 3D transformed container) --- */}
      {currentObstacle && (
          <div className="fixed top-16 left-0 right-0 z-[100] flex justify-center pointer-events-none">
              <div 
                  key={currentObstacle.question.id}
                  className="bg-white/95 backdrop-blur-md border-b-4 border-blue-600 shadow-xl rounded-xl p-4 max-w-sm w-full mx-4 text-center animate-slide-in-soft"
              >
                  <div className="flex items-center justify-center gap-2 mb-1 text-xs font-bold tracking-widest text-slate-500 uppercase">
                      {getIcon(currentObstacle.question.category)}
                      {currentObstacle.question.category}
                  </div>
                  <h2 className="text-xl font-black text-slate-800 leading-tight">
                      {currentObstacle.question.text}
                  </h2>
              </div>
          </div>
      )}

      {/* Main Game Container - Extended Height for better perspective */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[200%] game-lane overflow-visible"
      >
        
        {/* The Asphalt Road */}
        <div 
            className="absolute top-0 bottom-0 left-0 right-0 shadow-2xl overflow-hidden"
            style={{
                backgroundColor: '#0f172a', // Darker Slate-900 base for wet look
                borderLeft: '12px solid #fbbf24', // Yellow Edge Line
                borderRight: '12px solid #fbbf24', // Yellow Edge Line
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)' // Vignette for depth
            }}
        >
            {/* Detailed Asphalt Texture (Noise) */}
            <div 
                className="absolute inset-0 opacity-40 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px 128px'
                }}
            />

            {/* Wet Road Reflection / Sheen */}
            {/* Simulating light reflecting off wet pavement - brighter at top (horizon), darker near bottom, with streaks */}
            <div 
                className="absolute inset-0 opacity-30"
                style={{
                    background: 'linear-gradient(180deg, rgba(148, 163, 184, 0.4) 0%, rgba(148, 163, 184, 0.1) 25%, rgba(0, 0, 0, 0) 60%)',
                    mixBlendMode: 'screen'
                }}
            />

            {/* Animated Lane Dividers */}
            <div 
                className="absolute left-1/3 top-0 bottom-0 w-4 -ml-2 h-full animate-road-scroll"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 50%, transparent 50%)',
                    backgroundSize: '16px 100px',
                }}
            ></div>
            <div 
                className="absolute left-2/3 top-0 bottom-0 w-4 -ml-2 h-full animate-road-scroll"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.8) 50%, transparent 50%)',
                    backgroundSize: '16px 100px',
                }}
            ></div>
        </div>

        {/* --- SCENERY ITEMS --- */}
        {scenery.map((obj) => (
            <div
                key={obj.id}
                className="absolute transition-transform"
                style={{
                    top: `${obj.y}%`,
                    left: obj.side === 'left' ? `${obj.xOffset}px` : 'auto',
                    right: obj.side === 'right' ? `-${obj.xOffset - 50}px` : 'auto', // Adjust for width
                    zIndex: Math.floor(obj.y), // Depth sorting
                }}
            >
                {obj.type === 'house' ? (
                    <House3D color={obj.color} scale={obj.scale} />
                ) : (
                    <Tree3D scale={obj.scale} />
                )}
            </div>
        ))}


        {/* Touch Zones (Interactive) */}
        <div onClick={() => handleTouch(0)} className="absolute left-0 top-0 bottom-0 w-1/3 z-20 active:bg-white/5 transition-colors"></div>
        <div onClick={() => handleTouch(1)} className="absolute left-1/3 top-0 bottom-0 w-1/3 z-20 active:bg-white/5 transition-colors"></div>
        <div onClick={() => handleTouch(2)} className="absolute left-2/3 top-0 bottom-0 w-1/3 z-20 active:bg-white/5 transition-colors"></div>

        {/* The Gates (Answers) */}
        {currentObstacle && (
          <div 
            className="absolute w-full flex justify-between items-end px-2 transition-transform duration-75 z-30"
            style={{ 
                top: `${currentObstacle.y}%`, 
                height: '100px',
                opacity: currentObstacle.y < -40 ? 0 : 1 // Show gates almost immediately
            }}
          >
            {/* Answer Gates */}
            {currentObstacle.question.answers.map((ans, idx) => (
                <div 
                    key={idx} 
                    className={`
                        w-[30%] h-32 flex flex-col items-center justify-center p-2 text-center rounded-lg shadow-lg border-b-8
                        transition-transform
                        ${idx === 0 ? 'bg-red-500 border-red-700' : idx === 1 ? 'bg-blue-500 border-blue-700' : 'bg-green-500 border-green-700'}
                    `}
                    style={{
                        transform: 'translateY(-50%)'
                    }}
                >
                    <span className="text-white font-bold text-sm md:text-base drop-shadow-md leading-tight">{ans}</span>
                </div>
            ))}
          </div>
        )}

        {/* The Player (3D Truck) */}
        <div 
          className="absolute bottom-[4%] w-1/3 flex justify-center transition-all duration-200 ease-out"
          style={{ 
              left: `${playerLane * 33.33}%`,
              zIndex: PLAYER_Z_INDEX
          }}
        >
          <TruckCharacter 
            config={truckConfig} 
            isRunning={true} 
            scoreEffect={animatingHit} 
          />
        </div>

      </div>
    </div>
  );
};

export default GameLoop;
    