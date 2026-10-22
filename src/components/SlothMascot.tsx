import React from 'react';

interface SlothProps {
  className?: string;
  mood?: 'hanging' | 'resting' | 'thinking' | 'sleeping';
  size?: number;
}

export const SlothMascot: React.FC<SlothProps> = ({
  className = '',
  mood = 'hanging',
  size = 40,
}) => {
  if (mood === 'thinking') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Branch */}
        <path d="M4 44C18 42 42 46 60 40" stroke="#72947B" strokeWidth="6" strokeLinecap="round" />
        <path d="M48 42C52 38 56 36 60 38" stroke="#72947B" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="56" cy="35" rx="5" ry="3" fill="#A4C2A8" transform="rotate(-20 56 35)" />
        {/* Sloth Body */}
        <ellipse cx="32" cy="30" rx="18" ry="16" fill="#C5AA8E" />
        {/* Belly */}
        <ellipse cx="32" cy="34" rx="12" ry="10" fill="#E6DAC8" />
        {/* Face */}
        <ellipse cx="32" cy="22" rx="12" ry="9" fill="#F4EFE6" />
        {/* Eye eye patches */}
        <ellipse cx="26" cy="22" rx="4.5" ry="3.5" fill="#87684E" transform="rotate(-10 26 22)" />
        <ellipse cx="38" cy="22" rx="4.5" ry="3.5" fill="#87684E" transform="rotate(10 38 22)" />
        {/* Eyes (thoughtful look) */}
        <circle cx="27" cy="22" r="1.5" fill="#202821" />
        <circle cx="37" cy="22" r="1.5" fill="#202821" />
        {/* Snout & peaceful smile */}
        <ellipse cx="32" cy="25" rx="2.5" ry="1.5" fill="#4A3B32" />
        <path d="M30 27Q32 29 34 27" stroke="#4A3B32" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Thinking spark / leaf */}
        <path d="M32 6C34 10 38 10 37 13C34 14 31 12 32 6Z" fill="#E5B85C" />
      </svg>
    );
  }

  if (mood === 'resting' || mood === 'sleeping') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Branch */}
        <path d="M2 38C20 38 44 42 62 38" stroke="#72947B" strokeWidth="7" strokeLinecap="round" />
        {/* Leaf */}
        <path d="M12 36C10 30 16 26 20 28C22 34 16 38 12 36Z" fill="#A4C2A8" />
        {/* Sloth Body draped on branch */}
        <ellipse cx="34" cy="34" rx="20" ry="13" fill="#C5AA8E" />
        {/* Head sleeping downward */}
        <ellipse cx="48" cy="40" rx="9" ry="8" fill="#C5AA8E" />
        <ellipse cx="49" cy="41" rx="7" ry="6" fill="#F4EFE6" />
        {/* Closed calm eyes */}
        <path d="M46 41Q48 43 50 41" stroke="#87684E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <circle cx="53" cy="43" r="1.2" fill="#4A3B32" />
        {/* Cute Zzz */}
        <text x="50" y="24" fill="#E5B85C" fontSize="11" fontWeight="bold" fontFamily="sans-serif">z</text>
        <text x="56" y="16" fill="#E5B85C" fontSize="9" fontWeight="bold" fontFamily="sans-serif">z</text>
      </svg>
    );
  }

  // Default 'hanging'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Branch */}
      <path d="M4 18C20 18 44 22 60 18" stroke="#72947B" strokeWidth="6" strokeLinecap="round" />
      {/* Leaves */}
      <path d="M52 18C56 12 62 14 62 18C60 22 54 22 52 18Z" fill="#A4C2A8" />
      {/* Hanging Arms */}
      <path d="M22 18C22 26 24 32 28 36" stroke="#C5AA8E" strokeWidth="6" strokeLinecap="round" />
      <path d="M42 18C42 26 40 32 36 36" stroke="#C5AA8E" strokeWidth="6" strokeLinecap="round" />
      {/* Hanging Claws */}
      <path d="M20 17C21 14 23 14 24 17" stroke="#F4EFE6" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M40 17C41 14 43 14 44 17" stroke="#F4EFE6" strokeWidth="2.5" strokeLinecap="round" />
      {/* Main Body */}
      <ellipse cx="32" cy="40" rx="16" ry="14" fill="#C5AA8E" />
      <ellipse cx="32" cy="43" rx="10" ry="8" fill="#E6DAC8" />
      {/* Head */}
      <ellipse cx="32" cy="30" rx="11" ry="9" fill="#F4EFE6" />
      {/* Eye Patches */}
      <ellipse cx="27" cy="30" rx="4" ry="3" fill="#87684E" transform="rotate(-15 27 30)" />
      <ellipse cx="37" cy="30" rx="4" ry="3" fill="#87684E" transform="rotate(15 37 30)" />
      {/* Happy gentle eyes */}
      <path d="M26 30Q28 28 30 30" stroke="#202821" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M34 30Q36 28 38 30" stroke="#202821" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Snout & Smile */}
      <ellipse cx="32" cy="33" rx="2" ry="1.2" fill="#4A3B32" />
      <path d="M30 35Q32 37 34 35" stroke="#4A3B32" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
};
