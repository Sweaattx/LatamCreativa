import React, { useState } from 'react';
import { X, Copy, Check, Link as LinkIcon } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const socialOptions = [
  { name: 'WhatsApp', color: 'bg-[#25D366]', icon: 'Wa' },
  { name: 'Twitter', color: 'bg-neutral-800', icon: 'X' },
  { name: 'Facebook', color: 'bg-[#1877F2]', icon: 'Fb' },
  { name: 'LinkedIn', color: 'bg-[#0A66C2]', icon: 'in' },
  { name: 'Email', color: 'bg-neutral-700', icon: '@' },
];

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrls: Record<string, string> = {
    WhatsApp: `https://wa.me/?text=${encodeURIComponent(currentUrl)}`,
    Twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}`,
    Facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    Email: `mailto:?body=${encodeURIComponent(currentUrl)}`,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h3 className="font-semibold text-white">Compartir</h3>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Social Grid */}
          <div className="grid grid-cols-5 gap-3">
            {socialOptions.map((option) => (
              <a
                key={option.name}
                href={shareUrls[option.name]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold transition-transform group-hover:scale-105 ${option.color}`}
                >
                  {option.icon}
                </div>
                <span className="text-[10px] text-neutral-500">{option.name}</span>
              </a>
            ))}
          </div>

          {/* Copy Link */}
          <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-2 pl-3">
            <LinkIcon className="w-4 h-4 text-neutral-500 shrink-0" />
            <span className="text-sm text-neutral-400 truncate flex-1">{currentUrl}</span>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-neutral-700 hover:bg-neutral-600 text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
