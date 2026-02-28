'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { PlusOutlined, MinusOutlined, ReloadOutlined } from '@ant-design/icons';
import { MAX_COUNT, MIN_COUNT, APP_TITLE } from '@/app/constants/counter';
import type { CounterProps } from '@/app/types/counter';

const CLICK_COOLDOWN = 5000; // 5 seconds in milliseconds

export default function StudyCounter({ maxCount = MAX_COUNT }: CounterProps) {
  const [count, setCount] = useState<number>(0);
  const [isResetModalVisible, setIsResetModalVisible] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [cooldownTime, setCooldownTime] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const playSound = useCallback((frequency: number, duration: number) => {
    if (typeof window !== 'undefined') {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const audioContext = audioContextRef.current;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      } catch (error) {
        // Silently handle audio context errors
      }
    }
  }, []);

  const startCooldown = useCallback(() => {
    setIsDisabled(true);
    setCooldownTime(CLICK_COOLDOWN / 1000);

    const interval = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    cooldownTimerRef.current = interval;
  }, []);

  const handleIncrement = (): void => {
    if (count < maxCount && !isDisabled) {
      vibrate(50);
      playSound(800, 0.15);
      setCount((prev) => prev + 1);
      startCooldown();
    }
  };

  const handleDecrement = (): void => {
    if (count > MIN_COUNT) {
      vibrate(30);
      playSound(400, 0.15);
      setCount((prev) => prev - 1);
    }
  };

  const showResetModal = (): void => {
    vibrate(40);
    playSound(600, 0.15);
    setIsResetModalVisible(true);
  };

  const handleResetConfirm = (): void => {
    vibrate([50, 100, 50]);
    playSound(500, 0.2);
    setCount(0);
    setIsResetModalVisible(false);
    setIsDisabled(false);
    setCooldownTime(0);
    if (cooldownTimerRef.current) {
      clearInterval(cooldownTimerRef.current);
    }
  };

  const handleResetCancel = (): void => {
    setIsResetModalVisible(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-3 relative overflow-hidden">
      {/* Animated background elements - positioned to not overlap header */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-10 w-24 h-24 bg-cyan-400 rounded-full opacity-20 blur-3xl animate-float" />
        <div className="absolute top-2/3 right-10 w-32 h-32 bg-pink-400 rounded-full opacity-20 blur-3xl animate-float-delayed" />
        <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-yellow-400 rounded-full opacity-20 blur-3xl animate-float" />
      </div>

      <div className="w-full max-w-md flex flex-col relative z-10 h-screen">
        {/* Header - Compact and Readable */}
        <header className="py-3 text-center flex-shrink-0">
          <h1 className="font-['Press_Start_2P'] text-sm text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] leading-relaxed">
            MITAKSHI'S
          </h1>
          <h2 className="font-['Press_Start_2P'] text-lg text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] mt-1 leading-relaxed">
            STUDYPULSE
          </h2>
        </header>

        {/* Counter Display - Larger and More Prominent */}
        <div className="flex items-center justify-center py-4 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-pink-500 rounded-3xl blur-xl opacity-60 animate-pulse" />
            <div className="relative flex h-44 w-44 items-center justify-center rounded-3xl bg-black border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)] sm:h-48 sm:w-48">
              <span className="font-['Press_Start_2P'] text-7xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,1)] sm:text-8xl animate-pulse-subtle">
                {count}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar - Compact */}
        <div className="py-2 px-4 flex-shrink-0">
          <div className="bg-black/50 rounded-full p-1.5 border-2 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)]">
            <div className="flex items-center justify-between px-2">
              <span className="font-['Press_Start_2P'] text-[10px] text-pink-400">LV</span>
              <div className="flex-1 mx-2 h-3 bg-gray-800 rounded-full overflow-hidden border border-pink-400">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 transition-all duration-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="font-['Press_Start_2P'] text-[10px] text-yellow-400">{count}/{maxCount}</span>
            </div>
          </div>
        </div>

        {/* Main Counter Button - Balanced Size */}
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-2">
          <div className="relative">
            {/* Pulsing rings animation */}
            {!isDisabled && count < maxCount && (
              <>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-pink-500 opacity-75 animate-ping-slow" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 to-yellow-400 opacity-50 animate-pulse-ring" />
              </>
            )}
            
            {/* Main Button */}
            <button
              onClick={handleIncrement}
              disabled={count >= maxCount || isDisabled}
              className={`
                relative z-10 flex h-56 w-56 items-center justify-center rounded-full 
                transition-all duration-300 border-6
                ${count >= maxCount || isDisabled 
                  ? 'bg-gray-700 border-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 border-cyan-400 hover:border-pink-400 active:scale-95 cursor-pointer shadow-[0_0_50px_rgba(236,72,153,0.8)]'
                }
                sm:h-64 sm:w-64
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <PlusOutlined 
                    className={`${count >= maxCount || isDisabled ? 'text-gray-500' : 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)]'}`}
                    style={{ fontSize: '100px' }} 
                  />
                  {!isDisabled && count < maxCount && (
                    <div className="absolute inset-0 animate-spin-slow">
                      <div className="absolute top-0 left-1/2 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,1)]" />
                    </div>
                  )}
                </div>
                <span className={`font-['Press_Start_2P'] text-xs tracking-wider ${count >= maxCount || isDisabled ? 'text-gray-500' : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'}`}>
                  TAP ME!
                </span>
              </div>
            </button>
          </div>

          {/* Status Messages - Compact */}
          {isDisabled && cooldownTime > 0 && (
            <div className="text-center bg-black/50 px-4 py-2 rounded-xl border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
              <p className="font-['Press_Start_2P'] text-xs text-yellow-400 leading-relaxed">
                WAIT {cooldownTime}s
              </p>
            </div>
          )}

          {!isDisabled && count < maxCount && (
            <p className="font-['Press_Start_2P'] text-[10px] text-center text-cyan-400 leading-relaxed px-4">
              👆 TAP TO LEVEL UP!
            </p>
          )}

          {count >= maxCount && (
            <div className="text-center bg-gradient-to-r from-yellow-400 to-pink-400 px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.8)]">
              <p className="font-['Press_Start_2P'] text-xs text-black leading-relaxed">
                🎉 MAX LEVEL! 🎉
              </p>
            </div>
          )}
        </div>

        {/* Control Buttons - Compact */}
        <div className="flex gap-3 pb-4 flex-shrink-0">
          <button
            onClick={handleDecrement}
            disabled={count <= MIN_COUNT}
            className={`
              flex-1 h-14 rounded-xl font-['Poppins'] font-bold text-sm
              border-3 transition-all duration-200
              ${count <= MIN_COUNT 
                ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 border-cyan-400 text-white hover:border-pink-400 active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
              }
            `}
          >
            <MinusOutlined className="mr-1" />
            MINUS
          </button>
          <button
            onClick={showResetModal}
            className="flex-1 h-14 rounded-xl font-['Poppins'] font-bold text-sm bg-gradient-to-r from-pink-600 to-red-600 border-3 border-yellow-400 text-white hover:border-cyan-400 active:scale-95 shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all duration-200"
          >
            <ReloadOutlined className="mr-1" />
            RESET
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        title={<span className="font-['Press_Start_2P'] text-xs">RESET?</span>}
        open={isResetModalVisible}
        onOk={handleResetConfirm}
        onCancel={handleResetCancel}
        okText="YES"
        cancelText="NO"
        okButtonProps={{ danger: true, className: "font-['Poppins'] font-bold" }}
        cancelButtonProps={{ className: "font-['Poppins'] font-bold" }}
        centered
      >
        <p className="font-['Poppins'] text-sm py-3">
          Reset counter to zero?
        </p>
      </Modal>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(8px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(-10px); }
        }
        
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        
        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.3;
          }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
