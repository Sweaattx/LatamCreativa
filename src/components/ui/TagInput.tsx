import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
    tags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
    suggestions: string[];
    placeholder?: string;
    label?: string;
    icon?: React.ReactNode;
}

export const TagInput: React.FC<TagInputProps> = ({
    tags,
    onAddTag,
    onRemoveTag,
    suggestions,
    placeholder = "Añadir etiqueta...",
    label,
    icon
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredSuggestions = suggestions.filter(
        s => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                onAddTag(inputValue.trim());
                setInputValue('');
                setShowSuggestions(false);
            }
        }
    };

    const handleSelectSuggestion = (suggestion: string) => {
        onAddTag(suggestion);
        setInputValue('');
        setShowSuggestions(false);
    };

    return (
        <div className="space-y-3" ref={wrapperRef}>
            {label && (
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    {icon} {label}
                </label>
            )}

            <div className="relative">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-amber-500 transition-all text-sm text-slate-900 dark:text-white"
                        placeholder={placeholder}
                    />
                    <button
                        onClick={() => {
                            if (inputValue.trim()) {
                                onAddTag(inputValue.trim());
                                setInputValue('');
                            }
                        }}
                        className="px-4 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-white transition-colors flex items-center"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                        {filteredSuggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between group"
                            >
                                {suggestion}
                                <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 text-amber-500" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-white/10 flex items-center gap-2 animate-fade-in">
                        {tag}
                        <button
                            onClick={() => onRemoveTag(tag)}
                            className="hover:text-red-500 hover:bg-red-500/10 rounded p-0.5 transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};
