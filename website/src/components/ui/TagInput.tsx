import { useState, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

export interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
}

export default function TagInput({
  label,
  value,
  onChange,
  placeholder = 'Type and press Enter',
  error,
  helperText,
}: TagInputProps) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      <div
        className={cn(
          'flex flex-wrap gap-2 min-h-[42px] w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
          error && 'border-red-500 focus-within:ring-red-500'
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-primary-600 text-white px-2 py-1 rounded text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-gray-300 focus:outline-none"
              aria-label={`Remove ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-400">{helperText}</p>}
    </div>
  );
}
