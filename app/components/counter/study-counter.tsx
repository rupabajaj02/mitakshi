'use client';

import { useState, useCallback } from 'react';
import { Button, Modal } from 'antd';
import { PlusOutlined, MinusOutlined, ReloadOutlined } from '@ant-design/icons';
import { MAX_COUNT, MIN_COUNT, APP_TITLE } from '@/app/constants/counter';
import type { CounterProps } from '@/app/types/counter';

export default function StudyCounter({ maxCount = MAX_COUNT }: CounterProps) {
  const [count, setCount] = useState<number>(0);
  const [isResetModalVisible, setIsResetModalVisible] = useState<boolean>(false);

  const playSound = useCallback((frequency: number, duration: number) => {
    if (typeof window !== 'undefined') {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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

  const handleIncrement = (): void => {
    if (count < maxCount) {
      playSound(800, 0.1);
      setCount((prev) => prev + 1);
    }
  };

  const handleDecrement = (): void => {
    if (count > MIN_COUNT) {
      playSound(400, 0.1);
      setCount((prev) => prev - 1);
    }
  };

  const showResetModal = (): void => {
    playSound(600, 0.1);
    setIsResetModalVisible(true);
  };

  const handleResetConfirm = (): void => {
    playSound(500, 0.15);
    setCount(0);
    setIsResetModalVisible(false);
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

        {/* Main Counter Button - Central Circle */}
        <div className="flex justify-center py-8">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<PlusOutlined style={{ fontSize: '48px' }} />}
            onClick={handleIncrement}
            disabled={count >= maxCount}
            className="h-32 w-32 shadow-lg hover:scale-105 active:scale-95 transition-transform sm:h-36 sm:w-36"
            style={{
              backgroundColor: count >= maxCount ? '#d9d9d9' : '#722ed1',
              borderColor: count >= maxCount ? '#d9d9d9' : '#722ed1',
            }}
          />
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
