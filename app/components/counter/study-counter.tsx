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
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-400 rounded-full opacity-20 blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-400 rounded-full opacity-20 blur-3xl animate-float-delayed" />
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-yellow-400 rounded-full opacity-20 blur-3xl animate-float" />
      </div>

      <div className="w-full max-w-md flex-1 flex flex-col relative z-10">
        {/* Header - Retro Gaming Style */}
        <header className="py-6 text-center">
          <div className="relative inline-block">
            <h1 className="font-['Press_Start_2P'] text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-glow leading-relaxed">
              MITAKSHI'S
            </h1>
            <h2 className="font-['Press_Start_2P'] text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 drop-shadow-[0_0_30px_rgba(255,255,255,0.7)] animate-glow-delayed mt-2 leading-relaxed">
              STUDYPULSE
            </h2>
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">⚡</div>
            <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce-delayed">🎮</div>
          </div>
        </header>

        {/* Counter Display - Retro LCD Style */}
        <div className="flex items-center justify-center py-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-pink-500 rounded-3xl blur-xl opacity-60 animate-pulse" />
            <div className="relative flex h-36 w-36 items-center justify-center rounded-3xl bg-black border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)] sm:h-40 sm:w-40">
              <span className="font-['Press_Start_2P'] text-6xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,1)] sm:text-7xl animate-pulse-subtle">
                {count}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar - Gaming Style */}
        <div className="py-4 px-6">
          <div className="bg-black/50 rounded-full p-2 border-2 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]">
            <div className="flex items-center justify-between px-3">
              <span className="font-['Press_Start_2P'] text-xs text-pink-400">LVL</span>
              <div className="flex-1 mx-3 h-4 bg-gray-800 rounded-full overflow-hidden border border-pink-400">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 transition-all duration-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="font-['Press_Start_2P'] text-xs text-yellow-400">{count}/{maxCount}</span>
            </div>
          </div>
        </div>

        {/* Main Counter Button - MEGA Gaming Button */}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-4">
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
                relative z-10 flex h-72 w-72 items-center justify-center rounded-full 
                transition-all duration-300 border-8
                ${count >= maxCount || isDisabled 
                  ? 'bg-gray-700 border-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 border-cyan-400 hover:border-pink-400 active:scale-95 cursor-pointer shadow-[0_0_60px_rgba(236,72,153,0.8)]'
                }
                sm:h-80 sm:w-80
              `}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <PlusOutlined 
                    className={`${count >= maxCount || isDisabled ? 'text-gray-500' : 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,1)]'}`}
                    style={{ fontSize: '140px' }} 
                  />
                  {!isDisabled && count < maxCount && (
                    <div className="absolute inset-0 animate-spin-slow">
                      <div className="absolute top-0 left-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)]" />
                    </div>
                  )}
                </div>
                <span className={`font-['Press_Start_2P'] text-sm tracking-wider ${count >= maxCount || isDisabled ? 'text-gray-500' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]'}`}>
                  TAP ME!
                </span>
              </div>
            </button>
          </div>

          {/* Cooldown Message */}
          {isDisabled && cooldownTime > 0 && (
            <div className="text-center bg-black/50 px-6 py-3 rounded-2xl border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-pulse">
              <p className="font-['Press_Start_2P'] text-base text-yellow-400 leading-relaxed">
                WAIT {cooldownTime}s
              </p>
            </div>
          )}

          {/* Encouraging Message */}
          {!isDisabled && count < maxCount && (
            <p className="font-['Press_Start_2P'] text-xs text-center text-cyan-400 animate-bounce leading-relaxed px-4">
              👆 CLICK TO LEVEL UP! 👆
            </p>
          )}

          {/* Max Reached Message */}
          {count >= maxCount && (
            <div className="text-center bg-gradient-to-r from-yellow-400 to-pink-400 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-bounce">
              <p className="font-['Press_Start_2P'] text-sm text-black leading-relaxed">
                🎉 LEVEL MAX! 🎉
              </p>
            </div>
          )}
        </div>

        {/* Control Buttons - Gaming Style */}
        <div className="flex gap-4 pb-6">
          <button
            onClick={handleDecrement}
            disabled={count <= MIN_COUNT}
            className={`
              flex-1 h-16 rounded-xl font-['Poppins'] font-bold text-base
              border-4 transition-all duration-200
              ${count <= MIN_COUNT 
                ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 border-cyan-400 text-white hover:border-pink-400 active:scale-95 shadow-[0_0_20px_rgba(34,211,238,0.5)]'
              }
            `}
          >
            <MinusOutlined className="mr-2" />
            MINUS
          </button>
          <button
            onClick={showResetModal}
            className="flex-1 h-16 rounded-xl font-['Poppins'] font-bold text-base bg-gradient-to-r from-pink-600 to-red-600 border-4 border-yellow-400 text-white hover:border-cyan-400 active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-all duration-200"
          >
            <ReloadOutlined className="mr-2" />
            RESET
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        title={<span className="font-['Press_Start_2P'] text-sm">RESET COUNTER?</span>}
        open={isResetModalVisible}
        onOk={handleResetConfirm}
        onCancel={handleResetCancel}
        okText="YES, RESET"
        cancelText="CANCEL"
        okButtonProps={{ danger: true, className: "font-['Poppins'] font-bold" }}
        cancelButtonProps={{ className: "font-['Poppins'] font-bold" }}
        centered
      >
        <p className="font-['Poppins'] text-base py-4">
          Are you sure you want to reset the counter to zero?
        </p>
      </Modal>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(-15px); }
        }
        
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(255,255,255,0.5)); }
          50% { filter: drop-shadow(0 0 40px rgba(255,255,255,0.9)); }
        }
        
        @keyframes glow-delayed {
          0%, 100% { filter: drop-shadow(0 0 30px rgba(255,255,255,0.7)); }
          50% { filter: drop-shadow(0 0 50px rgba(255,255,255,1)); }
        }
        
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        
        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.3;
          }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-glow-delayed {
          animation: glow-delayed 2s ease-in-out infinite 0.5s;
        }
        
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        
        .animate-bounce-delayed {
          animation: bounce-delayed 2s ease-in-out infinite 1s;
        }
      `}</style>
    </div>
  );
}
