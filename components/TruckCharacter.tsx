import React, { useMemo } from 'react';
import { TruckConfig } from '../types';

interface TruckProps {
  config: TruckConfig;
  isRunning?: boolean;
  scoreEffect?: 'success' | 'fail' | null;
  failPhrase?: string;
}

// Updated colors to match the soft Pixar-like aesthetic from the image
export const TRUCK_COLORS = {
  blue: { 
    body: 'bg-[#5D9CEC]', 
    gradient: 'from-[#5D9CEC] to-[#4A89DC]',
    dark: 'bg-[#4A89DC]', 
    border: 'border-[#3572C6]',
    neon: 'shadow-[0_0_35px_rgba(93,156,236,0.9)]' 
  },
  red: { 
    body: 'bg-[#EF5350]', 
    gradient: 'from-[#EF5350] to-[#E53935]',
    dark: 'bg-[#E53935]', 
    border: 'border-[#C62828]',
    neon: 'shadow-[0_0_35px_rgba(239,83,80,0.9)]' 
  },
  green: { 
    body: 'bg-[#66BB6A]', 
    gradient: 'from-[#66BB6A] to-[#43A047]',
    dark: 'bg-[#43A047]', 
    border: 'border-[#2E7D32]',
    neon: 'shadow-[0_0_35px_rgba(102,187,106,0.9)]' 
  },
  purple: { 
    body: 'bg-[#AB47BC]', 
    gradient: 'from-[#AB47BC] to-[#8E24AA]',
    dark: 'bg-[#8E24AA]', 
    border: 'border-[#7B1FA2]',
    neon: 'shadow-[0_0_35px_rgba(171,71,188,0.9)]' 
  },
  orange: { 
    body: 'bg-[#FFA726]', 
    gradient: 'from-[#FFA726] to-[#FB8C00]',
    dark: 'bg-[#FB8C00]', 
    border: 'border-[#EF6C00]',
    neon: 'shadow-[0_0_35px_rgba(255,167,38,0.9)]' 
  },
  slate: { 
    body: 'bg-[#78909C]', 
    gradient: 'from-[#78909C] to-[#546E7A]',
    dark: 'bg-[#546E7A]', 
    border: 'border-[#455A64]',
    neon: 'shadow-[0_0_35px_rgba(120,144,156,0.9)]' 
  },
};

const Wheel = ({ type, side }: { type: TruckConfig['wheelType'], side: 'left' | 'right' }) => {
  const rotation = side === 'left' ? '-rotate-2 origin-bottom-right' : 'rotate-2 origin-bottom-left';
  const border = side === 'left' ? 'border-l-4' : 'border-r-4';
  
  // Wheel Styles
  const baseClass = `absolute bottom-6 ${side === 'left' ? 'left-0' : 'right-0'} w-8 h-12 rounded-2xl shadow-lg transform ${rotation}`;
  
  if (type === 'chrome') {
    return (
      <div className={`${baseClass} bg-gray-900 ${border} border-gray-400`}>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-gradient-to-br from-white via-gray-300 to-gray-500 rounded-lg shadow-inner"></div>
      </div>
    );
  }
  
  if (type === 'dark') {
     return (
      <div className={`${baseClass} bg-black ${border} border-gray-800`}>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-gray-800 rounded-lg border border-gray-700"></div>
      </div>
    );
  }

  // Classic
  return (
      <div className={`${baseClass} bg-[#263238] ${border} border-[#37474F]`}>
         {/* Hubcap detail */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-500 rounded-full"></div>
      </div>
  );
};

const Driver = ({ 
    mode, 
    customPhrase 
}: { 
    mode: 'normal' | 'celebrate' | 'rage',
    customPhrase?: string 
}) => {
    // Frases aleatórias para o balão quando não há frase customizada
    const phrases = ["Bora!", "Acelera!", "Cuidado!", "Ave Maria!", "Eita!", "Meu Deus!"];
    const randomPhrase = useMemo(() => phrases[Math.floor(Math.random() * phrases.length)], []);
    
    // Choose animation based on mode
    let animationClass = 'animate-driver-peek';
    if (mode === 'celebrate') animationClass = 'animate-driver-celebrate';
    if (mode === 'rage') animationClass = 'animate-driver-rage';

    // Se estiver em rage (fail), mostramos as pernas
    const showLegs = mode === 'rage';

    return (
        <div className={`absolute -left-3 bottom-0 w-8 h-10 z-[25] ${animationClass} origin-bottom-right`}>
             
             {/* Speech Bubble - UPDATED FOR BETTER READABILITY */}
             <div className={`
                absolute -top-24 -left-24 
                bg-white border-2 border-black 
                rounded-2xl rounded-br-none 
                p-2 
                w-32 
                shadow-[3px_3px_0px_rgba(0,0,0,0.2)] 
                z-50 flex flex-col items-center justify-center text-center
                ${customPhrase ? 'bubble-visible' : 'animate-pop-bubble'}
             `}>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 leading-none">Seu Pedro</span>
                <span className="text-[11px] font-black text-red-600 leading-tight block w-full break-words">
                    {customPhrase || randomPhrase}
                </span>
                
                {/* Tail */}
                <div className="absolute -bottom-2 -right-[1px] w-4 h-4 bg-white border-b-2 border-r-2 border-black transform rotate-45"></div>
             </div>

             {/* Head */}
             <div className="w-7 h-8 bg-[#8D6E63] rounded-lg relative shadow-md border border-black/10">
                 {/* Hair (White/Grey) */}
                 <div className="absolute -top-1 left-0 w-full h-3 bg-gray-200 rounded-t-lg"></div>
                 <div className="absolute top-1 -left-0.5 w-1 h-3 bg-gray-200 rounded-l-md"></div>
                 
                 {/* Sweat drops (Agoniado effect) */}
                 <div className="absolute -top-2 -right-1 w-1 h-1.5 bg-blue-300 rounded-full animate-sweat" style={{ animationDelay: '0s' }}></div>
                 <div className="absolute -top-1 right-0 w-1 h-1.5 bg-blue-300 rounded-full animate-sweat" style={{ animationDelay: '0.3s' }}></div>

                 {/* Glasses - Retangulares (requested previously) */}
                 <div className="absolute top-3 left-0.5 flex gap-0.5">
                     <div className="w-2.5 h-2 bg-blue-100/60 border-2 border-slate-800 rounded-sm"></div>
                     <div className="w-0.5 h-0.5 bg-slate-800 mt-1"></div>
                     <div className="w-2.5 h-2 bg-blue-100/60 border-2 border-slate-800 rounded-sm"></div>
                 </div>

                 {/* Nose */}
                 <div className="absolute top-5 left-2.5 w-1.5 h-2 bg-[#795548] rounded-full opacity-50"></div>

                 {/* Mouth */}
                 <div className={`absolute bottom-1 left-2 w-3 h-1 bg-black/60 rounded-full ${mode === 'rage' ? 'h-2 rounded-md' : ''}`}></div>
             </div>

             {/* Body (Shirt) - Brown (requested previously) */}
             <div className="absolute top-8 left-[-2px] w-8 h-6 bg-[#5D4037] rounded-b-md flex justify-center border-x border-black/10">
                 {/* Buttons */}
                 <div className="w-1 h-full border-r border-dashed border-white/20"></div>
             </div>
             
             {/* Arm resting (Visual trick to connect to window, hide in rage) */}
             {mode !== 'rage' && (
                 <div className="absolute bottom-[-5px] right-0 w-6 h-4 bg-white border border-gray-300 rounded-l-md transform -rotate-12"></div>
             )}

             {/* Legs (Only visible when jumping out) */}
             {showLegs && (
                 <div className="absolute top-[3.5rem] left-1 flex gap-1">
                     <div className="w-3 h-6 bg-blue-800 rounded-sm"></div> {/* Jeans Shorts */}
                     <div className="w-3 h-6 bg-blue-800 rounded-sm"></div>
                 </div>
             )}
        </div>
    );
};

const Cargo = ({ type }: { type: TruckConfig['cargoType'] }) => {
    if (type === 'empty') return null;

    if (type === 'box_bed') {
         // Cama Box
        return (
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-1 px-1">
                {/* Box Base */}
                <div className="w-[90%] h-5 bg-[#3E2723] rounded-sm relative shadow-md"></div>
                {/* Mattress */}
                <div className="w-[90%] h-6 bg-white rounded-sm border-b border-gray-200 relative z-10 shadow-sm">
                     <div className="absolute inset-0 bg-[radial-gradient(#EEE_1px,transparent_1px)] [background-size:3px_3px]"></div>
                     {/* Label strip */}
                     <div className="absolute bottom-2 right-0 w-full h-2 bg-blue-900/10"></div>
                </div>
            </div>
        );
    }

    if (type === 'sofa') {
        // Sofa
        return (
            <div className="absolute bottom-0 left-1 right-1 h-12 flex items-end justify-center">
                 {/* Sofa Body */}
                 <div className="w-full h-8 bg-amber-700 rounded-sm relative shadow-md flex items-end">
                      {/* Arms */}
                      <div className="w-2 h-10 bg-amber-800 rounded-t-lg -mt-2"></div>
                      <div className="flex-1 h-full bg-amber-700 relative border-t-2 border-amber-600">
                          {/* Cushions */}
                          <div className="absolute top-0 left-1 w-5 h-5 bg-amber-600 rounded-sm border-b border-amber-800"></div>
                          <div className="absolute top-0 right-1 w-5 h-5 bg-amber-600 rounded-sm border-b border-amber-800"></div>
                      </div>
                      <div className="w-2 h-10 bg-amber-800 rounded-t-lg -mt-2"></div>
                 </div>
            </div>
        );
    }

    // Default: Mattress Stack (The classic look)
    return (
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-1 px-1">
            {/* Bottom Mattress (Thick) */}
            <div className="w-[95%] h-6 bg-[#F5F5F5] rounded-sm shadow-sm border-b-4 border-[#E0E0E0] mb-[-2px] relative">
                    <div className="absolute inset-0 bg-[radial-gradient(#E0E0E0_1px,transparent_1px)] [background-size:4px_4px] opacity-50"></div>
            </div>
            
            {/* Middle Mattress (Blue Sheet) */}
            <div className="w-[92%] h-5 bg-[#90CAF9] rounded-sm shadow-sm border-b-2 border-[#64B5F6] mb-[-2px] relative z-10">
                <div className="absolute right-2 top-0 bottom-0 w-8 bg-[#64B5F6]/30 skew-x-12"></div>
            </div>

            {/* Top Pillows/Mattress */}
            <div className="w-[88%] h-4 bg-[#FFF9C4] rounded-full shadow-md border-b border-[#FFF59D] relative z-20 flex justify-center items-center">
                    <div className="w-[40%] h-full border-r border-[#FFF59D]/50"></div>
            </div>

            {/* Folded Blanket/Accessory */}
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#8D6E63] rounded shadow-lg transform rotate-12 z-30 border border-[#6D4C41]"></div>
        </div>
    );
};

const ParticleSystem = ({ type }: { type: 'success' | 'fail' }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      // Random angle and distance
      const angle = Math.random() * 360;
      const distance = 120 + Math.random() * 100; // Explode outwards
      const tx = Math.cos(angle * Math.PI / 180) * distance;
      const ty = Math.sin(angle * Math.PI / 180) * distance;
      
      // Random colors based on type
      const successColors = ['bg-yellow-300', 'bg-white', 'bg-blue-300', 'bg-green-300', 'bg-pink-400'];
      const failColors = ['bg-gray-600', 'bg-red-600', 'bg-orange-600', 'bg-black', 'bg-slate-700'];
      const colors = type === 'success' ? successColors : failColors;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Random shape/size
      const size = 6 + Math.random() * 8;
      const delay = Math.random() * 0.15;
      
      return { id: i, tx, ty, color, size, delay };
    });
  }, [type]);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 z-[60] overflow-visible pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className={`absolute rounded-full ${p.color} animate-particle shadow-sm`}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animationDelay: `${p.delay}s`
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const TruckCharacter: React.FC<TruckProps> = ({ config, isRunning = true, scoreEffect, failPhrase }) => {
  const colors = TRUCK_COLORS[config.color];

  // Determine Driver Mode
  let driverMode: 'normal' | 'celebrate' | 'rage' = 'normal';
  if (scoreEffect === 'success') driverMode = 'celebrate';
  if (scoreEffect === 'fail') driverMode = 'rage';

  return (
    <div className={`
      relative w-36 h-48
      transition-transform duration-200
      ${scoreEffect === 'success' ? 'animate-jump-success' : ''}
      ${scoreEffect === 'fail' ? 'scale-90 opacity-100' : ''} 
    `}>
      {/* Particle System for Impacts */}
      {scoreEffect && <ParticleSystem type={scoreEffect} />}

      <div className={`relative w-full h-full ${isRunning ? 'animate-truck-run' : ''}`}>
        
        {/* --- SHADOWS & GLOWS --- */}
        {/* Neon Underglow */}
        {config.hasNeon && (
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-12 rounded-[100%] ${colors.neon} opacity-100 mix-blend-screen animate-pulse`}></div>
        )}
        {/* Regular ground shadow */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-8 bg-black/40 blur-md rounded-full"></div>


        {/* --- WHEELS --- */}
        <Wheel type={config.wheelType || 'classic'} side="left" />
        <Wheel type={config.wheelType || 'classic'} side="right" />


        {/* --- MAIN BODY (PICKUP BED AREA) --- */}
        <div className={`
            absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-24 
            bg-gradient-to-b ${colors.gradient}
            rounded-2xl shadow-inner border-x-2 border-b-4 ${colors.border}
            overflow-hidden z-10
        `}>
            
            {/* Pattern Overlay */}
            {config.pattern === 'stripe' && (
                <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
                     <div className="absolute left-1/2 -translate-x-1/2 h-full w-8 bg-white/20"></div>
                </div>
            )}

            {/* Truck Bed Interior (The "Hole") */}
            <div className="absolute top-1 left-2 right-2 bottom-8 bg-[#3E2723] rounded-lg shadow-[inset_0_5px_10px_rgba(0,0,0,0.5)] overflow-hidden">
                
                {/* CARGO */}
                <Cargo type={config.cargoType || 'mattress'} />

                {/* Cargo Bar */}
                <div className="absolute bottom-6 left-0 right-0 h-2 bg-gray-400/80 shadow-md z-40 rounded-full mx-1"></div>

                {/* Rack Accessory (Bed Mounted) */}
                {config.hasRack && (
                    <div className="absolute inset-0 border-x-4 border-t-4 border-dashed border-gray-800/30 rounded-t-lg z-0 pointer-events-none"></div>
                )}
            </div>

            {/* Tailgate (Rear Face) */}
            <div className={`absolute bottom-0 w-full h-8 bg-gradient-to-b ${colors.gradient} flex items-center justify-center z-50 shadow-[0_-2px_5px_rgba(0,0,0,0.2)]`}>
                 {/* Pattern Overlay on Tailgate */}
                 {config.pattern === 'stripe' && (
                    <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
                        <div className="absolute left-1/2 -translate-x-1/2 h-full w-8 bg-white/20"></div>
                    </div>
                )}
                
                {/* BelConfort Logo */}
                <div className="flex flex-col items-center justify-center -mt-1 relative z-10">
                    <span className="text-[8px] font-serif text-white drop-shadow-md tracking-wider opacity-90">BelConfort</span>
                    <div className="flex gap-0.5 mt-[1px]">
                         <div className="w-1.5 h-1 border border-white/70 rounded-[1px]"></div>
                         <div className="w-2 h-1 border border-white/70 rounded-[1px]"></div>
                    </div>
                </div>

                {/* Tail Lights */}
                <div className="absolute left-2 top-1.5 bottom-1.5 w-3 bg-red-600 rounded-sm shadow-[inset_0_0_4px_rgba(0,0,0,0.4)] border border-red-800 flex flex-col justify-between p-[1px]">
                    <div className="w-full h-[40%] bg-red-400 rounded-[1px]"></div>
                </div>
                <div className="absolute right-2 top-1.5 bottom-1.5 w-3 bg-red-600 rounded-sm shadow-[inset_0_0_4px_rgba(0,0,0,0.4)] border border-red-800 flex flex-col justify-between p-[1px]">
                    <div className="w-full h-[40%] bg-red-400 rounded-[1px]"></div>
                </div>

                {/* Spoiler Accessory */}
                {config.hasSpoiler && (
                    <div className="absolute -top-3 w-[110%] h-4 bg-[#263238] rounded-full shadow-xl flex items-center justify-center">
                        <div className="w-[80%] h-1 bg-gray-600 rounded-full mt-1"></div>
                    </div>
                )}
            </div>
        </div>


        {/* --- CABIN (ROOF) --- */}
        <div className={`
            absolute bottom-[6.5rem] left-1/2 -translate-x-1/2 w-28 h-20
            bg-gradient-to-br from-white/20 to-transparent
            rounded-t-3xl rounded-b-lg
            z-20 transform scale-x-110
        `}>
            {/* The Driver (Sticking Head Out - Now with modes) */}
            {/* Move driver container out slightly to prevent clipping on jump out */}
            <div className="absolute inset-0 overflow-visible">
                <Driver mode={driverMode} customPhrase={failPhrase} />
            </div>

             {/* Main Roof Shape */}
             <div className={`
                w-full h-full 
                bg-gradient-to-b ${colors.gradient}
                rounded-t-3xl rounded-b-xl
                shadow-2xl border-t border-white/30
                flex flex-col items-center
                relative overflow-hidden
             `}>
                {/* Pattern Overlay on Roof */}
                 {config.pattern === 'stripe' && (
                    <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
                        <div className="absolute left-1/2 -translate-x-1/2 h-full w-8 bg-white/20"></div>
                    </div>
                )}

                {/* Roof Highlights */}
                <div className="absolute top-2 left-4 right-4 h-12 bg-white/10 rounded-full blur-md"></div>

                {/* Rear Window */}
                <div className="mt-8 w-[80%] h-8 bg-[#263238] rounded-lg border border-gray-700 shadow-inner relative overflow-hidden z-10">
                    {/* Interior seats hint */}
                    <div className="absolute bottom-0 left-2 w-6 h-6 bg-[#37474F] rounded-t-lg"></div>
                    <div className="absolute bottom-0 right-2 w-6 h-6 bg-[#37474F] rounded-t-lg"></div>
                    {/* Glass Reflection */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -rotate-45 translate-x-4"></div>
                </div>
                
                {/* Roof Rack (Top Part) */}
                {config.hasRack && (
                    <div className="absolute top-2 w-[90%] h-1 bg-gray-800 rounded-full shadow-sm flex justify-between px-2 z-20">
                        <div className="w-1 h-2 bg-gray-800 -mt-1"></div>
                        <div className="w-1 h-2 bg-gray-800 -mt-1"></div>
                    </div>
                )}
             </div>
        </div>


        {/* --- EXHAUST & BUMPER --- */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-4 bg-[#37474F] rounded-full shadow-lg z-20 flex items-center justify-center">
             <div className="text-[6px] text-gray-500 font-mono tracking-[0.2em] uppercase">BelConfort</div>
        </div>

        {config.hasExhaust && (
            <>
                {/* Left Exhaust Pipe + Particles */}
                <div className="absolute bottom-5 left-8 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800 z-0 flex items-center justify-center">
                     {isRunning && (
                         <>
                            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                                <div 
                                    key={`sl-${i}`}
                                    className="absolute top-0 left-0 w-3 h-3 rounded-full animate-fume-left"
                                    style={{ 
                                        animationDelay: `${i * 0.15}s`,
                                        left: `${Math.random() * 4 - 2}px` // Slight random jitter
                                    }}
                                ></div>
                            ))}
                         </>
                     )}
                </div>
                
                {/* Right Exhaust Pipe + Particles */}
                <div className="absolute bottom-5 right-8 w-4 h-4 bg-gray-600 rounded-full border-2 border-gray-800 z-0 flex items-center justify-center">
                     {isRunning && (
                         <>
                            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                                <div 
                                    key={`sr-${i}`}
                                    className="absolute top-0 right-0 w-3 h-3 rounded-full animate-fume-right"
                                    style={{ 
                                        animationDelay: `${i * 0.15}s`,
                                        left: `${Math.random() * 4 - 2}px` 
                                    }}
                                ></div>
                            ))}
                         </>
                     )}
                </div>
            </>
        )}

      </div>
      
      {/* Score Text Effect */}
      {scoreEffect && (
          <div className={`
            absolute -top-20 left-0 w-full text-center
            font-black text-6xl
            ${scoreEffect === 'success' ? 'text-green-400 animate-float-text' : 'text-red-500 animate-bounce'} 
            z-[60] pointer-events-none
          `} style={{ textShadow: '2px 2px 0 #000' }}>
              {scoreEffect === 'success' ? '+10' : 'X'}
          </div>
      )}
    </div>
  );
};

export default TruckCharacter;