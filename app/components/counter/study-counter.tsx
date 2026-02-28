'use client';

import { useState } from 'react';
import { Button, Modal } from 'antd';
import { PlusOutlined, MinusOutlined, ReloadOutlined } from '@ant-design/icons';
import { MAX_COUNT, MIN_COUNT, APP_TITLE } from '@/app/constants/counter';
import type { CounterProps } from '@/app/types/counter';

export default function StudyCounter({ maxCount = MAX_COUNT }: CounterProps) {
  const [count, setCount] = useState<number>(0);
  const [isResetModalVisible, setIsResetModalVisible] = useState<boolean>(false);

  const handleIncrement = (): void => {
    if (count < maxCount) {
      setCount((prev) => prev + 1);
    }
  };

  const handleDecrement = (): void => {
    if (count > MIN_COUNT) {
      setCount((prev) => prev - 1);
    }
  };

  const showResetModal = (): void => {
    setIsResetModalVisible(true);
  };

  const handleResetConfirm = (): void => {
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
            icon={<PlusOutlined />}
            onClick={handleIncrement}
            disabled={count >= maxCount}
            className="h-24 w-24 text-2xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
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
