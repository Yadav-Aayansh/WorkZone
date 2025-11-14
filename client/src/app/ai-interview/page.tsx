"use client";

import React, { useState } from "react";
import {Header} from "./components/Header";
import { QuestionPanel } from "./components/QuestionPanel";
import {Sidebar} from "./components/Sidebar";
import { Question, User } from "./types";
import Whiteboard from "./components/Whiteboard";


// Lucide icons (already installed in your package.json)
import {
  Lock,
  Hand,
  MousePointer,
  ScanSearch,
  MicOff,
  Video,
  PhoneOff
} from "lucide-react";

const demoUser: User = { name: "Anshuman Singh", role: "Host" };

const demoQuestion: Question = {
  id: "q1",
  title: "SQL: Retrieve employees",
  description:
    "You are given a database with a table named Employees that contains the following columns: EmployeeID, FirstName, LastName, Department, Salary, HireDate. Retrieve all employees hired after 2020.",
  codeSnippet: `SELECT * FROM Employees WHERE HireDate > '2020-01-01';`,
};

export default function Page() {
  const [dark, setDark] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [showChat, setShowChat] = useState(false);

  return (
    <div className={`${dark ? "dark" : ""}`}>
      <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark font-display">

        {/* HEADER */}
        <Header
          user={demoUser}
          timeLeft="00:59:00"
          onToggleDarkMode={() => setDark((s) => !s)}
          onToggleFullScreen={() => setIsFull((s) => !s)}
          isFullScreen={isFull}
          isDarkMode={dark}
        />

        <main className="flex-1 flex overflow-hidden">

          {/* LEFT QUESTION PANEL */}
          <aside className="w-[380px] flex-shrink-0">
            <div className="h-full p-4">
              <QuestionPanel
                question={demoQuestion}
                onNextQuestion={() => {}}
                onPreviousQuestion={() => {}}
                currentQuestionIndex={0}
                totalQuestions={1}
              />
            </div>
          </aside>

          {/* CENTER SECTION */}
          <section className="flex-1 flex flex-col relative items-center p-6">

            {/* TOP TOOLBAR */}
            <div className="absolute top-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-lg rounded-lg flex items-center p-1 space-x-1">

              <button className="p-2 rounded-md">
                <Lock size={18} />
              </button>

              <button className="p-2 rounded-md">
                <Hand size={18} />
              </button>

              <button className="p-2 rounded-md">
                <MousePointer size={18} />
              </button>

              <button className="p-2 rounded-md bg-brand-blue/10 text-brand-blue">
                <ScanSearch size={18} />
              </button>
            </div>

            {/* Center video */} 
                <div className="flex-1 flex items-center justify-center w-full">
                  <Whiteboard />
                </div>    


            {/* BOTTOM CONTROLS */}
            <div className="absolute bottom-6 flex items-center space-x-3">

              <button className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center">
                <MicOff size={24} />
              </button>

              <button className="w-14 h-14 rounded-full bg-surface-accent-dark text-white flex items-center justify-center">
                <Video size={24} />
              </button>

              <button className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center">
                <PhoneOff size={24} />
              </button>

            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="w-[300px] flex-shrink-0">
            <Sidebar user={demoUser} onToggleChat={() => setShowChat((s) => !s)} />
          </aside>

        </main>
      </div>
    </div>
  );
}
