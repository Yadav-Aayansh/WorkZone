// Basic user information shown in header + sidebar
export interface User {
  name: string;
  role: string; // e.g., "Host", "Candidate"
}

// Structure of each interview question
export interface Question {
  id: string;
  title: string;
  description: string;
  codeSnippet?: string; // optional SQL / JS / code
}

// Props for QuestionPanel component
export interface QuestionPanelProps {
  question: Question;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
}

// Props for Header
export interface HeaderProps {
  user: User;
  timeLeft: string;
  onToggleDarkMode: () => void;
  onToggleFullScreen: () => void;
  isDarkMode: boolean;
  isFullScreen: boolean;
}

// Props for Sidebar
export interface SidebarProps {
  user: User;
  onToggleChat: () => void;
}
