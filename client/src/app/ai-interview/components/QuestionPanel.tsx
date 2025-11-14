import React from "react";
import { Question } from "../types";
import {
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconMessage,
  IconCircleCheck,
} from "@tabler/icons-react";

interface QuestionPanelProps {
  question: Question;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  onNextQuestion,
  onPreviousQuestion,
  currentQuestionIndex,
  totalQuestions,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      
      {/* TOP NAV */}
      <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-700 pb-3">
        <div className="flex space-x-2">
          <button className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 flex items-center rounded">
            <IconCircleCheck className="h-4 w-4 mr-1" /> Question
          </button>

          <button className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex items-center">
            <IconMessage className="h-4 w-4 mr-1" /> Status
          </button>
        </div>

        <button className="text-gray-500 dark:text-gray-300">
          <IconX className="h-5 w-5" />
        </button>
      </div>

      {/* QUESTION TEXT */}
      <div className="mt-4 text-sm text-gray-800 dark:text-gray-300">
        {question.description}
      </div>

      {/* CODE SNIPPET */}
      {question.codeSnippet && (
        <pre className="mt-4 p-4 bg-gray-900 text-gray-200 rounded text-sm overflow-auto">
          {question.codeSnippet}
        </pre>
      )}

      {/* ANSWER BOX */}
      <div className="mt-6">
        <h3 className="text-sm font-medium">Your Answer</h3>
        <textarea
          className="mt-2 w-full h-48 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded p-3 text-sm font-mono"
          placeholder="Write your answer here..."
        ></textarea>
      </div>

      {/* NAVIGATION */}
      <div className="mt-auto pt-4 flex justify-between">
        <button
          disabled={currentQuestionIndex === 0}
          onClick={onPreviousQuestion}
          className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-sm disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-xs text-gray-500 dark:text-gray-400">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </span>

        <button
          disabled={currentQuestionIndex === totalQuestions - 1}
          onClick={onNextQuestion}
          className="px-3 py-2 rounded bg-blue-600 text-white text-sm disabled:bg-gray-400"
        >
          {currentQuestionIndex === totalQuestions - 1 ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
};
