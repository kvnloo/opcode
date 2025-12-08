import { useState, useCallback } from 'react';
import { PanInfo } from 'framer-motion';

interface UseSwipeNavigationOptions<T extends string> {
  items: T[];
  initialItem?: T;
  threshold?: number;
  velocityThreshold?: number;
}

interface UseSwipeNavigationReturn<T extends string> {
  currentItem: T;
  currentIndex: number;
  direction: 'left' | 'right';
  goTo: (item: T) => void;
  goNext: () => void;
  goPrevious: () => void;
  handleDragEnd: (event: any, info: PanInfo) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function useSwipeNavigation<T extends string>({
  items,
  initialItem,
  threshold = 50,
  velocityThreshold = 500,
}: UseSwipeNavigationOptions<T>): UseSwipeNavigationReturn<T> {
  const [currentItem, setCurrentItem] = useState<T>(initialItem || items[0]);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const currentIndex = items.indexOf(currentItem);
  const canGoNext = currentIndex < items.length - 1;
  const canGoPrevious = currentIndex > 0;

  const goTo = useCallback((item: T) => {
    const newIndex = items.indexOf(item);
    setDirection(newIndex > currentIndex ? 'right' : 'left');
    setCurrentItem(item);
  }, [items, currentIndex]);

  const goNext = useCallback(() => {
    if (canGoNext) {
      setDirection('right');
      setCurrentItem(items[currentIndex + 1]);
    }
  }, [canGoNext, items, currentIndex]);

  const goPrevious = useCallback(() => {
    if (canGoPrevious) {
      setDirection('left');
      setCurrentItem(items[currentIndex - 1]);
    }
  }, [canGoPrevious, items, currentIndex]);

  const handleDragEnd = useCallback((_event: any, info: PanInfo) => {
    const { offset, velocity } = info;

    if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > velocityThreshold) {
      if (offset.x > 0 && canGoPrevious) {
        goPrevious();
      } else if (offset.x < 0 && canGoNext) {
        goNext();
      }
    }
  }, [threshold, velocityThreshold, canGoNext, canGoPrevious, goNext, goPrevious]);

  return {
    currentItem,
    currentIndex,
    direction,
    goTo,
    goNext,
    goPrevious,
    handleDragEnd,
    canGoNext,
    canGoPrevious,
  };
}
