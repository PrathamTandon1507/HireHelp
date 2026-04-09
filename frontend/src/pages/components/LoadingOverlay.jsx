import React from 'react';

const LoadingOverlay = ({ message = "Processing...", subtext = "Please wait while we handle the magic" }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center">
      {/* Glassmorphism Backdrop */}
      <div className="absolute inset-0 bg-[#020617]/60 backdrop-blur-md animate-in fade-in duration-500" />
      
      {/* Content Container */}
      <div className="relative flex flex-col items-center space-y-8 animate-in zoom-in-95 duration-300">
        {/* The Spinner */}
        <div className="relative w-24 h-24">
          {/* External Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-[#1e293b] opacity-20" />
          
          {/* Animated Gradient Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent border-l-transparent border-b-[#22d3ee] animate-spin shadow-[0_0_20px_#22d3ee50]" 
               style={{ animationDuration: '1.5s', borderTopColor: '#2563eb' }} />
          
          {/* Inner Glowing Core */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#2563eb]/20 to-[#22d3ee]/20 blur-sm animate-pulse" />
          
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#22d3ee] shadow-[0_0_10px_#22d3ee]" />
          </div>
        </div>

        {/* Text Information */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#f8fafc] to-[#94a3b8] bg-clip-text text-transparent tracking-tight">
            {message}
          </h2>
          <p className="text-sm text-[#94a3b8] font-medium tracking-wide opacity-80 max-w-[200px] leading-relaxed">
            {subtext}
          </p>
        </div>
        
        {/* Loading Bar Miniature */}
        <div className="w-48 h-1 bg-[#1e293b] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#2563eb] to-[#22d3ee] animate-progress w-[40%]" 
               style={{ animation: 'progress 2s infinite ease-in-out' }} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}} />
    </div>
  );
};

export default LoadingOverlay;
