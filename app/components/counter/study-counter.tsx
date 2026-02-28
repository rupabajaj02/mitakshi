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
    <div className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md flex-1 flex flex-col">
        {/* Header */}
        <header className="py-6 text-center">
          <h1 className="text-2xl font-bold text-purple-700 sm:text-3xl">
            {APP_TITLE}
          </h1>
        </header>

        {/* Counter Display - Large Area */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex h-64 w-64 items-center justify-center rounded-full bg-white shadow-2xl sm:h-80 sm:w-80">
            <span className="text-8xl font-bold text-purple-600 sm:text-9xl">
              {count}
            </span>
          </div>
        </div>

        {/* Main Counter Button - Large Thumb-Sized Circle */}
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<PlusOutlined style={{ fontSize: '64px' }} />}
            onClick={handleIncrement}
            disabled={count >= maxCount || isDisabled}
            className="h-48 w-48 shadow-2xl hover:scale-105 active:scale-95 transition-transform sm:h-52 sm:w-52"
            style={{
              backgroundColor: (count >= maxCount || isDisabled) ? '#d9d9d9' : '#722ed1',
              borderColor: (count >= maxCount || isDisabled) ? '#d9d9d9' : '#722ed1',
            }}
          />
          {isDisabled && cooldownTime > 0 && (
            <p className="text-sm font-medium text-purple-600">
              Wait {cooldownTime}s before next click
            </p>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 pb-8">
          <Button
            type="default"
            icon={<MinusOutlined />}
            onClick={handleDecrement}
            disabled={count <= MIN_COUNT}
            className="flex-1 h-12 text-base font-medium"
            size="large"
          >
            Minus
          </Button>
          <Button
            danger
            icon={<ReloadOutlined />}
            onClick={showResetModal}
            className="flex-1 h-12 text-base font-medium"
            size="large"
          >
            Reset to Zero
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="pb-4 text-center">
          <p className="text-sm text-gray-600">
            {count} / {maxCount}
          </p>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        title="Reset Counter"
        open={isResetModalVisible}
        onOk={handleResetConfirm}
        onCancel={handleResetCancel}
        okText="Yes, Reset"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        centered
      >
        <p className="text-base">
          Are you sure you want to reset the counter to zero?
        </p>
      </Modal>
    </div>
  );
}
