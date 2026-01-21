'use client';

import { useState, useCallback, useRef } from 'react';
import { CardState, SwipeAction } from '@/types';

const SWIPE_THRESHOLD = 100; // Minimum distance for a swipe
const ROTATION_FACTOR = 0.1; // How much the card rotates based on x offset

interface UseSwipeOptions {
    onSwipe: (action: SwipeAction) => void;
    onSwipeStart?: () => void;
    onSwipeEnd?: () => void;
}

export function useSwipe({ onSwipe, onSwipeStart, onSwipeEnd }: UseSwipeOptions) {
    const [cardState, setCardState] = useState<CardState>({
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
    });
    const [isDragging, setIsDragging] = useState(false);

    const startPos = useRef({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    const handleStart = useCallback((clientX: number, clientY: number) => {
        startPos.current = { x: clientX, y: clientY };
        setIsDragging(true);
        onSwipeStart?.();
    }, [onSwipeStart]);

    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (!isDragging) return;

        const deltaX = clientX - startPos.current.x;
        const deltaY = clientY - startPos.current.y;
        const rotation = deltaX * ROTATION_FACTOR;

        setCardState({
            x: deltaX,
            y: deltaY,
            rotation,
            scale: 1,
        });
    }, [isDragging]);

    const handleEnd = useCallback(() => {
        if (!isDragging) return;

        const { x, y } = cardState;
        let action: SwipeAction | null = null;

        // Determine swipe action based on position
        if (x > SWIPE_THRESHOLD) {
            // Swipe right - Like
            action = 'like';
        } else if (x < -SWIPE_THRESHOLD) {
            // Swipe left - Nope
            action = 'nope';
        } else if (y < -SWIPE_THRESHOLD) {
            // Swipe up - Super Like
            action = 'superlike';
        }

        // Reset card position first
        setCardState({ x: 0, y: 0, rotation: 0, scale: 1 });
        setIsDragging(false);
        onSwipeEnd?.();

        // Trigger the swipe callback after a small delay to let the animation complete
        if (action) {
            setTimeout(() => {
                onSwipe(action);
            }, 100);
        }
    }, [isDragging, cardState, onSwipe, onSwipeEnd]);

    // Mouse event handlers
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
    }, [handleStart]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        handleMove(e.clientX, e.clientY);
    }, [handleMove]);

    const handleMouseUp = useCallback(() => {
        handleEnd();
    }, [handleEnd]);

    const handleMouseLeave = useCallback(() => {
        if (isDragging) {
            handleEnd();
        }
    }, [isDragging, handleEnd]);

    // Touch event handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    }, [handleStart]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    }, [handleMove]);

    const handleTouchEnd = useCallback(() => {
        handleEnd();
    }, [handleEnd]);

    // Programmatic swipe (for buttons)
    const triggerSwipe = useCallback((action: SwipeAction) => {
        const direction = action === 'like' ? 1 : action === 'nope' ? -1 : 0;
        const y = action === 'superlike' ? -1 : 0;

        setCardState({
            x: direction * (SWIPE_THRESHOLD + 200),
            y: y * (SWIPE_THRESHOLD + 200),
            rotation: direction * 30,
            scale: 1,
        });

        // Trigger swipe after animation
        setTimeout(() => {
            onSwipe(action);
            setCardState({ x: 0, y: 0, rotation: 0, scale: 1 });
        }, 200);
    }, [onSwipe]);

    // Get swipe indicator (for visual feedback)
    const getSwipeIndicator = useCallback((): SwipeAction | null => {
        const { x, y } = cardState;
        if (x > SWIPE_THRESHOLD / 2) return 'like';
        if (x < -SWIPE_THRESHOLD / 2) return 'nope';
        if (y < -SWIPE_THRESHOLD / 2) return 'superlike';
        return null;
    }, [cardState]);

    return {
        cardState,
        isDragging,
        cardRef,
        handlers: {
            onMouseDown: handleMouseDown,
            onMouseMove: handleMouseMove,
            onMouseUp: handleMouseUp,
            onMouseLeave: handleMouseLeave,
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
        triggerSwipe,
        swipeIndicator: getSwipeIndicator(),
    };
}
