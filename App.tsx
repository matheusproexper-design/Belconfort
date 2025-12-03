import React, { useState, useCallback, useRef, useEffect } from 'react';
import GameLoop from './components/GameLoop';
import { GameState, TruckConfig } from './types';
import { Play, Trophy, RotateCcw, Award, Settings, Check, ArrowLeft, Zap, Wind, Package, Disc, Layers } from 'lucide-react';
import { QUESTIONS } from './constants';
import TruckCharacter, { TRUCK_COLORS } from './components/TruckCharacter';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [finalMessage, setFinalMessage] = useState('');
  
  // Customization State
  const [truckConfig, setTruckConfig] = useState<TruckConfig>({
    color: 'blue',
    pattern: 'solid',
    hasSpoiler: false,
    hasRack: false,
    hasNeon: false,
    hasExhaust: false,
    cargoType: 'mattress', // Default load
    wheelType: 'classic',
  });

  // --- AUDIO SYSTEM ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const musicReqRef = useRef<number>();
  const nextNoteTimeRef = useRef<number>(0);
  const noteIndexRef = useRef<number>(0);

  // Initialize Audio Context on interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioContext();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };

    const handleInteraction = () => {
      initAudio();
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Load High Score from LocalStorage
  useEffect(() => {
    const storedScore = localStorage.getItem('belconfort_highscore');
    if (storedScore) setHighScore(parseInt(storedScore));
  }, []);

  // Background Music Logic
  useEffect(() => {
    if (musicReqRef.current) cancelAnimationFrame(musicReqRef.current);
    
    const scheduleMusic = () => {
      if (!audioCtxRef.current) {
         musicReqRef.current = requestAnimationFrame(scheduleMusic);
         return;
      }
      const ctx = audioCtxRef.current;

      // Music Config based on State
      let sequence: number[] = [];
      let speed = 0.2;
      let type: OscillatorType = 'sine';
      let vol = 0.05;

      if (gameState === 'MENU' || gameState === 'CUSTOMIZE') {
        // Funky / Chill - C Major 7 ish arpeggio
        sequence = [261.63, 0, 329.63, 0, 392.00, 0, 493.88, 0, 392.00, 0, 329.63, 0, 261.63, 0, 196.00, 0];
        speed = 0.18;
        type = 'triangle';
        vol = 0.05;
      } else if (gameState === 'PLAYING') {
        // Fast Driving Bass - E minor ish
        sequence = [82.41, 82.41, 164.81, 82.41, 98.00, 98.00, 196.00, 98.00]; 
        speed = 0.13;
        type = 'square';
        vol = 0.03;
      } else if (gameState === 'GAME_OVER') {
        // Sad / Slow
        sequence = [110.00, 103.83, 98.00, 92.50];
        speed = 0.5;
        type = 'sawtooth';
        vol = 0.05;
      } else if (gameState === 'VICTORY') {
        // Happy
        sequence = [261.63, 329.63, 392.00, 523.25, 0, 523.25, 0];
        speed = 0.15;
        type = 'sine';
        vol = 0.1;
      }

      // Initialize nextNoteTime if needed
      if (nextNoteTimeRef.current < ctx.currentTime) {
        nextNoteTimeRef.current = ctx.currentTime + 0.1;
      }

      // Scheduler
      while (nextNoteTimeRef.current < ctx.currentTime + 0.1) {
         const freq = sequence[noteIndexRef.current % sequence.length];
         
         if (freq > 0) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = type;
            osc.frequency.value = freq;

            // Simple Envelope
            gain.gain.setValueAtTime(vol, nextNoteTimeRef.current);
            gain.gain.exponentialRampToValueAtTime(0.001, nextNoteTimeRef.current + speed - 0.02);

            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(nextNoteTimeRef.current);
            osc.stop(nextNoteTimeRef.current + speed);
         }

         nextNoteTimeRef.current += speed;
         noteIndexRef.current++;
      }
      
      musicReqRef.current = requestAnimationFrame(scheduleMusic);
    };

    musicReqRef.current = requestAnimationFrame(scheduleMusic);

    return () => {
      if (musicReqRef.current) cancelAnimationFrame(musicReqRef.current);
    };
  }, [gameState]);

  const playSound = useCallback((type: 'success' | 'fail') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.start(t);
      osc.stop(t + 0.5);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.start(t);
      osc.stop(t + 0.4);
    }
  }, []);

  // --- HANDLERS ---

  const handleStart = () => {
    setScore(0);
    setGameState('PLAYING');
  };

  const handleEnterGarage = () => {
    setGameState('CUSTOMIZE');
  };

  const handleCustomize = (updater: (prev: TruckConfig) => TruckConfig) => {
    setTruckConfig(updater);
  };

  const handleGameOver = (finalScore: number, passed: boolean, correctAnswer?: string) => {
    setScore(finalScore);
    
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('belconfort_highscore', finalScore.toString());
    }
    
    if (passed) {
        setFinalMessage("Parabéns! Você completou o treinamento!");
        setGameState('VICTORY');
    } else {
        setFinalMessage(`Você perdeu a venda! A resposta certa era:\n"${correctAnswer}"`);
        setGameState('GAME_OVER');
    }
  };

  return (
    <div className="w-full h-screen bg-slate-900 flex flex-col items-center justify-center font-sans overflow-hidden">
      
      {/* Header / HUD */}
      {gameState !== 'CUSTOMIZE' && (
        <div className="absolute top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <Trophy className="text-white w-5 h-5" />
                </div>
                <div className="flex flex-col">
                    <span className="text-blue-300 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                        PONTOS
                    </span>
                    <span className="text-white font-black text-2xl leading-none">{score}</span>
                </div>
            </div>
            <div className="text-right">
                <span className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider block">
                    Recorde Pessoal
                </span>
                <div className="text-white font-bold text-lg">{highScore}</div>
            </div>
        </div>
      )}

      {/* Game Screens */}
      {gameState === 'MENU' && (
        <div className="relative z-10 p-8 max-w-md w-full bg-white rounded-2xl shadow-2xl text-center border-b-8 border-blue-600 animate-fade-in mx-4">
          <div className="mb-6 flex justify-center">
            <div className="bg-blue-100 p-4 rounded-full ring-8 ring-blue-50">
                <Award className="w-16 h-16 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 leading-tight">
            TESTE DE CONHECIMENTO <br />
            <span className="text-blue-600 text-4xl md:text-5xl block mt-1">BELCONFORT</span>
          </h1>
          <p className="text-slate-500 mb-8 font-medium">Desvie e acerte as perguntas sobre vendas, descontos e comissões!</p>
          
          <div className="space-y-3">
            
            <button 
                onClick={handleStart}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 shadow-blue-500/30 cursor-pointer flex items-center justify-center gap-2"
            >
                <Play fill="currentColor" />
                JOGAR AGORA
            </button>
            
            <button 
                onClick={handleEnterGarage}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-lg border-2 border-slate-200 transition-all flex items-center justify-center gap-2"
            >
                <Settings className="w-5 h-5" />
                GARAGEM
            </button>

            <div className="text-xs text-slate-400 mt-4">
                Use as Setas ⬅️ ➡️ ou toque na tela
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
              {QUESTIONS.length} Perguntas de Treinamento
          </div>
        </div>
      )}

      {/* Customization Screen */}
      {gameState === 'CUSTOMIZE' && (
        <div className="relative z-10 w-full max-w-md h-full md:h-auto md:max-h-[85vh] bg-white md:rounded-2xl shadow-2xl flex flex-col">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center gap-4">
                <button 
                  onClick={() => setGameState('MENU')} 
                  className="p-2 hover:bg-slate-200 rounded-full transition"
                >
                    <ArrowLeft className="text-slate-700" />
                </button>
                <h2 className="text-2xl font-black text-slate-800">GARAGEM</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                {/* Preview Area */}
                <div className="w-full h-56 bg-slate-800 rounded-xl mb-6 relative overflow-hidden flex items-center justify-center border-b-8 border-slate-700 shadow-inner shrink-0">
                    <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }}
                    />
                    <div className="transform scale-150 mt-12">
                        <TruckCharacter config={truckConfig} isRunning={false} />
                    </div>
                </div>

                {/* --- CONTROLS --- */}
                <div className="w-full space-y-6">
                    
                    {/* Color Selection */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pintura</h3>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {(Object.keys(TRUCK_COLORS) as Array<TruckConfig['color']>).map((color) => (
                                <button
                                    key={color}
                                    onClick={() => handleCustomize(prev => ({ ...prev, color }))}
                                    className={`
                                        w-10 h-10 rounded-full border-2 shadow-sm transition-transform hover:scale-110 relative
                                        ${truckConfig.color === color ? 'border-slate-800 scale-110 ring-2 ring-slate-300 ring-offset-2' : 'border-white'}
                                    `}
                                    style={{ backgroundColor: color === 'slate' ? '#334155' : color }}
                                >
                                    {truckConfig.color === color && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Check className="w-5 h-5 text-white drop-shadow-md" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                         {/* Pattern Toggle */}
                         <div className="flex justify-center mt-3">
                             <button
                                onClick={() => handleCustomize(prev => ({ ...prev, pattern: prev.pattern === 'solid' ? 'stripe' : 'solid' }))}
                                className={`
                                    px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 transition-colors
                                    ${truckConfig.pattern === 'stripe' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-300'}
                                `}
                             >
                                 <Layers className="w-3 h-3" />
                                 Listra de Corrida
                             </button>
                         </div>
                    </div>

                    {/* Cargo Load */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                             <Package className="w-4 h-4" /> Carga na Caçamba
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            <button
                                onClick={() => handleCustomize(prev => ({ ...prev, cargoType: 'mattress' }))}
                                className={`py-2 rounded-lg border-2 text-[10px] font-bold ${truckConfig.cargoType === 'mattress' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400'}`}
                            >
                                Colchões
                            </button>
                            <button
                                onClick={() => handleCustomize(prev => ({ ...prev, cargoType: 'box_bed' }))}
                                className={`py-2 rounded-lg border-2 text-[10px] font-bold ${truckConfig.cargoType === 'box_bed' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400'}`}
                            >
                                Cama Box
                            </button>
                            <button
                                onClick={() => handleCustomize(prev => ({ ...prev, cargoType: 'sofa' }))}
                                className={`py-2 rounded-lg border-2 text-[10px] font-bold ${truckConfig.cargoType === 'sofa' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400'}`}
                            >
                                Sofá
                            </button>
                             <button
                                onClick={() => handleCustomize(prev => ({ ...prev, cargoType: 'empty' }))}
                                className={`py-2 rounded-lg border-2 text-[10px] font-bold ${truckConfig.cargoType === 'empty' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400'}`}
                            >
                                Vazio
                            </button>
                        </div>
                    </div>

                     {/* Wheel Type */}
                     <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                             <Disc className="w-4 h-4" /> Rodas
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => handleCustomize(prev => ({ ...prev, wheelType: 'classic' }))}
                                className={`py-2 rounded-lg border-2 text-xs font-bold ${truckConfig.wheelType === 'classic' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400'}`}
                            >
                                Clássica
                            </button>
                            <button
                                onClick={() => handleCustomize(prev => ({ ...prev, wheelType: 'chrome' }))}
                                className={`py-2 rounded-lg border-2 text-xs font-bold ${truckConfig.wheelType === 'chrome' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400'}`}
                            >
                                Cromada
                            </button>
                            <button
                                onClick={() => handleCustomize(prev => ({ ...prev, wheelType: 'dark' }))}
                                className={`py-2 rounded-lg border-2 text-xs font-bold ${truckConfig.wheelType === 'dark' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white text-slate-400'}`}
                            >
                                Esportiva
                            </button>
                        </div>
                    </div>


                    {/* Accessories */}
                    <div className="w-full">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Acessórios</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleCustomize(prev => ({ ...prev, hasSpoiler: !prev.hasSpoiler }))}
                                className={`
                                    py-3 px-3 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-1
                                    ${truckConfig.hasSpoiler 
                                        ? 'bg-blue-50 border-blue-500 text-blue-700' 
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                    }
                                `}
                            >
                                <span className="text-xl">🏎️</span>
                                <span className="text-sm">Aerofólio</span>
                            </button>
                            <button
                                onClick={() => handleCustomize(prev => ({ ...prev, hasRack: !prev.hasRack }))}
                                className={`
                                    py-3 px-3 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-1
                                    ${truckConfig.hasRack 
                                        ? 'bg-blue-50 border-blue-500 text-blue-700' 
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                    }
                                `}
                            >
                                <span className="text-xl">🪜</span>
                                <span className="text-sm">Rack</span>
                            </button>
                            <button
                                onClick={() => handleCustomize(prev => ({ ...prev, hasNeon: !prev.hasNeon }))}
                                className={`
                                    py-3 px-3 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-1
                                    ${truckConfig.hasNeon 
                                        ? 'bg-purple-50 border-purple-500 text-purple-700' 
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                    }
                                `}
                            >
                                <Zap className="w-5 h-5 mb-0.5" />
                                <span className="text-sm">Neon</span>
                            </button>
                            <button
                                onClick={() => handleCustomize(prev => ({ ...prev, hasExhaust: !prev.hasExhaust }))}
                                className={`
                                    py-3 px-3 rounded-xl border-2 font-bold transition-all flex flex-col items-center gap-1
                                    ${truckConfig.hasExhaust 
                                        ? 'bg-gray-50 border-gray-500 text-gray-700' 
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                    }
                                `}
                            >
                                <Wind className="w-5 h-5 mb-0.5" />
                                <span className="text-sm">Turbo</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
                <button 
                    onClick={() => setGameState('MENU')}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xl shadow-lg transition-all active:scale-95"
                >
                    SALVAR E VOLTAR
                </button>
            </div>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <GameLoop 
          onGameOver={handleGameOver} 
          onScoreUpdate={setScore}
          truckConfig={truckConfig}
          onPlaySound={playSound}
        />
      )}

      {(gameState === 'GAME_OVER' || gameState === 'VICTORY') && (
        <div className="relative z-10 p-8 max-w-md w-full bg-white rounded-2xl shadow-2xl text-center border-b-8 border-slate-200">
          <div className="mb-4">
              {gameState === 'VICTORY' ? (
                  <div className="text-6xl mb-2">👑</div>
              ) : (
                  <div className="text-6xl mb-2">💥</div>
              )}
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">{gameState === 'VICTORY' ? 'EXCELENTE!' : 'FIM DE JOGO'}</h2>
          <p className="text-slate-500 mb-6 whitespace-pre-wrap">{finalMessage}</p>
          
          <div className="bg-slate-100 rounded-xl p-4 mb-6 flex justify-between items-center">
              <span className="text-slate-500 font-bold">Pontuação Final</span>
              <span className="text-3xl font-black text-blue-600">{score}</span>
          </div>

          <button 
            onClick={handleStart}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <RotateCcw />
            TENTAR NOVAMENTE
          </button>
          
          <button 
            onClick={() => setGameState('MENU')}
            className="w-full mt-3 py-3 text-slate-500 font-bold hover:text-slate-700 transition"
          >
            Voltar ao Menu
          </button>
        </div>
      )}
    </div>
  );
};

export default App;