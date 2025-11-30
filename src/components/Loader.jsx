import React from 'react';
import { Loader } from 'lucide-react';

const FullScreenLoader = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
      <p className="text-indigo-800 font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default FullScreenLoader;
