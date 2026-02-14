import React, { useState } from 'react';

interface UseDraggableListReturn<T> {
    items: T[];
    draggedItemIndex: number | null;
    dragOverItemIndex: number | null;
    handleDragStart: (e: React.DragEvent, index: number) => void;
    handleDragEnter: (index: number) => void;
    handleDragEnd: () => void;
    handleDragOver: (e: React.DragEvent) => void;
    handleDrop: (index: number) => void;
}

export const useDraggableList = <T>(
    items: T[],
    onReorder: (items: T[]) => void
): UseDraggableListReturn<T> => {
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItemIndex(index);
        // Attempt to capture the parent card as the drag image
        if (e.currentTarget.parentElement) {
            e.dataTransfer.setDragImage(e.currentTarget.parentElement, 0, 0);
            e.dataTransfer.effectAllowed = "move";
        }
    };

    const handleDragEnter = (index: number) => {
        setDragOverItemIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
        setDragOverItemIndex(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (index: number) => {
        if (draggedItemIndex === null) return;

        const newItems = [...items];
        const draggedItem = newItems[draggedItemIndex];

        // Remove from old position
        newItems.splice(draggedItemIndex, 1);
        // Insert at new position
        newItems.splice(index, 0, draggedItem);

        onReorder(newItems);
        setDraggedItemIndex(null);
        setDragOverItemIndex(null);
    };

    return {
        items,
        draggedItemIndex,
        dragOverItemIndex,
        handleDragStart,
        handleDragEnter,
        handleDragEnd,
        handleDragOver,
        handleDrop
    };
};
