
import React, { useEffect, useState } from 'react';

const AudioVisualizer: React.FC<{ active: boolean }> = ({ active }) => {
  const [bars, setBars] = useState<number[]>(new Array(24).fill(10));

  useEffect(() => {
    if (!active) {
      setBars(new Array(24).fill(10));
      return;
    }

    const interval = setInterval(() => {
      setBars(new Array(24).fill(0).map(() => Math.floor(Math.random() * 40) + 10));
    }, 100);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((height, i) => (
        <div 
          key={i}
          className="w-1 bg-blue-600/30 rounded-full transition-all duration-150"
          style={{ height: `${height}%`, opacity: active ? 0.4 + (height/100) : 0.1 }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
