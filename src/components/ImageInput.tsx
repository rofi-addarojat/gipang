import React, { useState } from 'react';

interface ImageInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  error?: string;
  placeholder?: string;
}

export default function ImageInput({ label, name, value, onChange, error, placeholder }: ImageInputProps) {
  const [mode, setMode] = useState<'url' | 'upload'>(value?.startsWith('data:image') ? 'upload' : 'url');

  const handleModeChange = (newMode: 'url' | 'upload') => {
    setMode(newMode);
    if (newMode === 'url') {
      onChange({ target: { name, value: '' } });
    } else {
      onChange({ target: { name, value: 'data:image/jpeg;base64,' } });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_WIDTH) {
            height = Math.round((height *= MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
  
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          onChange({ target: { name, value: canvas.toDataURL("image/jpeg", 0.7) } });
        };
      };
    }
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-1">
        <label className="block text-sm font-semibold">{label}</label>
        <div className="flex gap-3 text-xs font-medium">
          <label className="flex items-center gap-1 cursor-pointer">
            <input 
              type="radio" 
              name={`mode-${name}`}
              checked={mode === 'url'} 
              onChange={() => handleModeChange('url')}
            />
            URL
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input 
              type="radio" 
              name={`mode-${name}`}
              checked={mode === 'upload'} 
              onChange={() => handleModeChange('upload')}
            />
            Upload
          </label>
        </div>
      </div>
      
      {mode === 'url' ? (
        <input
          className={`w-full border p-2 rounded focus:ring-2 focus:ring-accent outline-none ${error ? "border-red-500" : ""}`}
          name={name}
          value={value}
          onChange={(e) => onChange({ target: { name, value: e.target.value }})}
          placeholder={placeholder || "https://..."}
        />
      ) : (
        <input
          type="file"
          accept="image/*"
          className="w-full border p-1.5 rounded bg-white"
          onChange={handleFileUpload}
        />
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {value && value !== 'data:image/jpeg;base64,' && (
        <img 
          src={value || undefined} 
          alt="Preview" 
          className="mt-2 h-20 w-20 object-cover rounded border bg-gray-50"
          onError={(e) => (e.currentTarget.style.display = 'none')}
          onLoad={(e) => (e.currentTarget.style.display = 'block')}
        />
      )}
    </div>
  );
}
