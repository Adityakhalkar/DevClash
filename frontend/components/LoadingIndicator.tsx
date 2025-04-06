import React from 'react';

interface LoadingIndicatorProps {
  progress: number;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ progress }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        {/* Center content */}
        <div className="mb-10 relative">
          <h1 className="text-6xl font-bold text-yellow-500">Savium</h1>
          <div className="h-1 bg-blue-200 w-full mt-2 rounded-full overflow-hidden">
            <div 
              className="h-full text-yellow-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Progress number in bottom right */}
        <div className="fixed bottom-10 right-10">
          <div className="relative">
            <span className="text-8xl font-bold text-yellow-500 tracking-tighter">
              {progress}
              <span className="text-4xl absolute -right-6 top-4">%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;