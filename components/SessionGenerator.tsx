import React, { useState } from 'react';
import type { SessionOptions } from '../types';

interface SessionGeneratorProps {
  onGenerate: (options: SessionOptions) => void;
  isLoading: boolean;
}

// FIX: All instances of the `OptionButton` component were missing the required `children` prop, which is used to render the button's text. This change adds the appropriate text as a child to each button, resolving the errors.
const OptionButton = <T extends string | number>({ value, selectedValue, setter, children }: { value: T, selectedValue: string | number, setter: (val: T) => void, children: React.ReactNode}) => {
  return (
    <button
      type="button"
      onClick={() => setter(value)}
      className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
        selectedValue === value
          ? 'bg-blue-500 text-white shadow-md'
          : 'bg-white text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

const SessionGenerator: React.FC<SessionGeneratorProps> = ({ onGenerate, isLoading }) => {
  const [options, setOptions] = useState<SessionOptions>({
    type: 'Meditation',
    focus: 'Stress Relief',
    duration: 5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(options);
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Create Your Session</h2>
      <p className="text-slate-500 mb-6">Customize your wellness experience.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
          <div className="flex flex-wrap gap-2">
            <OptionButton value="Meditation" selectedValue={options.type} setter={(v) => setOptions(o => ({...o, type: v}))}>Meditation</OptionButton>
            <OptionButton value="Stretching" selectedValue={options.type} setter={(v) => setOptions(o => ({...o, type: v}))}>Stretching</OptionButton>
            <OptionButton value="Breathing" selectedValue={options.type} setter={(v) => setOptions(o => ({...o, type: v}))}>Breathing</OptionButton>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Focus</label>
          <div className="flex flex-wrap gap-2">
            <OptionButton value="Stress Relief" selectedValue={options.focus} setter={(v) => setOptions(o => ({...o, focus: v}))}>Stress Relief</OptionButton>
            <OptionButton value="Focus" selectedValue={options.focus} setter={(v) => setOptions(o => ({...o, focus: v}))}>Focus</OptionButton>
            <OptionButton value="Energy Boost" selectedValue={options.focus} setter={(v) => setOptions(o => ({...o, focus: v}))}>Energy Boost</OptionButton>
            <OptionButton value="Sleep" selectedValue={options.focus} setter={(v) => setOptions(o => ({...o, focus: v}))}>Sleep</OptionButton>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (minutes)</label>
          <div className="flex flex-wrap gap-2">
            <OptionButton value={5} selectedValue={options.duration} setter={(v) => setOptions(o => ({...o, duration: v}))}>5</OptionButton>
            <OptionButton value={10} selectedValue={options.duration} setter={(v) => setOptions(o => ({...o, duration: v}))}>10</OptionButton>
            <OptionButton value={15} selectedValue={options.duration} setter={(v) => setOptions(o => ({...o, duration: v}))}>15</OptionButton>
            <OptionButton value={30} selectedValue={options.duration} setter={(v) => setOptions(o => ({...o, duration: v}))}>30</OptionButton>
            <OptionButton value={45} selectedValue={options.duration} setter={(v) => setOptions(o => ({...o, duration: v}))}>45</OptionButton>
            <OptionButton value={60} selectedValue={options.duration} setter={(v) => setOptions(o => ({...o, duration: v}))}>60</OptionButton>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          {isLoading ? 'Generating...' : 'Start My Session'}
        </button>
      </form>
    </div>
  );
};

export default SessionGenerator;