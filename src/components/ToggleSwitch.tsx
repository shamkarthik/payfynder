import React, { useEffect, useState } from 'react';

interface ToggleSwitchProps {
  onToggle: (checked: boolean) => void; // Callback for toggle changes
  initialState?: boolean; // Initial state for the toggle
  controlledState?: boolean; // Optional external control for the toggle state
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  onToggle,
  initialState,
  controlledState,
}) => {
  // Internal state management for the toggle
  const [isChecked, setIsChecked] = useState<boolean>(initialState ?? false);

  // Effect to update internal state when `controlledState` changes
  useEffect(() => {
    if (controlledState !== undefined) {
      setIsChecked(controlledState);
    }
  }, [controlledState]);

  // Handler to toggle the checkbox state
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsChecked(checked); // Update internal state
    onToggle(checked); // Call `onToggle` callback
  };

  return (
    <label className="inline-flex items-center cursor-pointer">
      {/* Hidden checkbox */}
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleToggle}
        className="sr-only peer"
      />
      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    </label>
  );
};

export default ToggleSwitch;
