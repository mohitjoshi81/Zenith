
import React from 'react';

const Loader: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50 text-white">
      <div className="w-16 h-16 border-4 border-t-transparent border-blue-400 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold">{message}</p>
    </div>
  );
};

export default Loader;
