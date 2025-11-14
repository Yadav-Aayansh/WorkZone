import React from "react";
import { User } from "../types";
import { IconSun, IconMoon, IconMaximize, IconMinimize } from "@tabler/icons-react";

interface HeaderProps {
  user: User;
  timeLeft: string;
  onToggleDarkMode: () => void;
  onToggleFullScreen: () => void;
  isFullScreen: boolean;
  isDarkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  timeLeft,
  onToggleDarkMode,
  onToggleFullScreen,
  isFullScreen,
  isDarkMode,
}) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
      
      {/* LEFT USER INFO */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
        </div>
      </div>

      {/* RIGHT BUTTONS */}
      <div className="flex items-center space-x-4">

        {/* TIMER */}
        <div className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center">
          <span className="w-2 h-2 rounded-full bg-red-600 mr-2"></span>
          <span className="text-sm text-red-700 dark:text-red-300">{timeLeft}</span>
        </div>

        {/* DARK MODE */}
        <button onClick={onToggleDarkMode} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          {isDarkMode ? <IconSun /> : <IconMoon />}
        </button>

        {/* FULLSCREEN */}
        <button onClick={onToggleFullScreen} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          {isFullScreen ? <IconMinimize /> : <IconMaximize />}
        </button>
      </div>
    </header>
  );
};
