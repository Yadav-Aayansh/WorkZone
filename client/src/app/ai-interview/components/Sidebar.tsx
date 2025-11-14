import React from "react";
import { User } from "../types";
import { IconMessage, IconDots } from "@tabler/icons-react";

interface SidebarProps {
  user: User;
  onToggleChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, onToggleChat }) => {
  return (
    <aside className="w-full h-full p-4 flex flex-col space-y-4">
      
      {/* PROFILE */}
      <div className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-5 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
          {user.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <p className="mt-2 text-sm font-medium">{user.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-300">{user.role}</p>
      </div>

      {/* VIDEO FEED */}
      <div className="flex-1 bg-gray-300 dark:bg-gray-700 rounded-lg relative flex items-center justify-center">
        <span className="text-gray-700 dark:text-gray-300">Your Video</span>

        <button className="absolute top-2 right-2 bg-black/40 p-1 rounded-full text-white">
          <IconDots />
        </button>

        <div className="absolute bottom-2 left-2 text-xs px-2 py-1 bg-black/40 text-white rounded">
          You
        </div>
      </div>

      {/* CHAT BUTTON */}
      <button
        onClick={onToggleChat}
        className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 flex items-center justify-center space-x-2"
      >
        <IconMessage className="h-5 w-5" />
        <span className="text-sm font-medium">Chat</span>
      </button>
    </aside>
  );
};
