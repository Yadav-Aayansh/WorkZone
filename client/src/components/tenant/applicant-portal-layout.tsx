"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  Sun,
  Moon,
  Search,
  X,
  Menu,
  FileUp,
  Calendar,
  FileCheck,
  FileSearch,
  ChevronLeft,
  ChevronRight,
  Bot,
} from "lucide-react";

const Chatbot = dynamic(() => import("@/components/chatbot"), { ssr: false });
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navigation = [
  {
    name: "Dashboard",
    href: "/tenant/applicant-portal/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Job Search",
    href: "/tenant/applicant-portal/job-search",
    icon: Briefcase,
  },
  {
    name: "My Applications",
    href: "/tenant/applicant-portal/applications",
    icon: FileText,
  },
  {
    name: "Interviews",
    href: "/tenant/applicant-portal/interviews",
    icon: Calendar,
  },
  {
    name: "Assessments",
    href: "/tenant/applicant-portal/assessments",
    icon: FileCheck,
  },
  {
    name: "Resume",
    href: "/tenant/applicant-portal/resume",
    icon: FileSearch,
  },
];

// Mock applicant data
const applicantData = {
  name: "Aarav Patel",
  email: "aarav.patel@example.com",
  applications: 3,
  interviews: 2,
  avatar: "/avatars/aarav.jpg",
};

export function ApplicantPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // State for notifications/messages
  const [showChatbot, setShowChatbot] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(3);
  
  // State for notification messages
  const [messages, setMessages] = useState<Array<{
    id: number;
    sender: string;
    text: string;
    time: string;
    read: boolean;
  }>>([
    { id: 1, sender: 'Recruiter', text: 'Hi there! We are reviewing your application', time: '10:30 AM', read: false },
    { id: 2, sender: 'HR Team', text: 'Your interview is scheduled for tomorrow', time: 'Yesterday', read: false },
    { id: 3, sender: 'Support', text: 'Your application status has been updated', time: 'Nov 5', read: true },
  ]);

  // State for chat messages
  const [chatMessages, setChatMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'bot';
    text: string;
  }>>([
    { id: 1, sender: 'bot', text: 'Hello! How can I help you today?' },
  ]);
  
  // State for new message input
  const [newChatMessage, setNewChatMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const markAsRead = (id: number) => {
    const updatedMessages = messages.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    );
    setMessages(updatedMessages);
    setUnreadMessages(updatedMessages.filter(msg => !msg.read).length);
  };

  const handleChatMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;
    
    // Add user message
    const userMessage = { 
      id: chatMessages.length + 1, 
      sender: 'user' as const, 
      text: newChatMessage 
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setNewChatMessage('');
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = { 
        id: chatMessages.length + 2, 
        sender: 'bot' as const, 
        text: 'Thank you for your message! Our team will get back to you soon.' 
      };
      setChatMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // In a real app, this would send the message to a server
    console.log('New message:', newMessage);
    setNewMessage('');
  };

  // Fix for hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Chatbot Dialog */}
      <Dialog open={chatbotOpen} onOpenChange={setChatbotOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-primary">WorkZone Assistant</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleMessageSubmit} className="flex gap-2 pt-2 border-t">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm">
              Send
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-card/80 backdrop-blur-md ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md flex-shrink-0">
                WZ
              </div>
              {!isCollapsed && <span className="font-bold text-foreground">WorkZone</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors flex-shrink-0",
                    isActive 
                      ? "bg-primary/10 text-primary dark:bg-primary/30"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className={cn(
                        isActive ? "font-semibold" : "font-medium",
                        "whitespace-nowrap"
                      )}>
                        {item.name}
                      </span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-2 mt-auto">
            <div className="space-y-1">
              <Link
                href="/tenant/applicant-portal/settings"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/tenant/applicant-portal/settings"
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  pathname === "/tenant/applicant-portal/settings"
                    ? "bg-primary/10 text-primary dark:bg-primary/30 dark:text-white"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary dark:bg-muted/50"
                )}>
                  <Settings className="h-5 w-5" />
                </div>
                {!isCollapsed && <span>Settings</span>}
              </Link>
              <button
                onClick={() => {}}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-foreground dark:group-hover:bg-primary/20"
                )}>
                  <LogOut className="h-5 w-5" />
                </div>
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 bg-gradient-to-br from-background via-background to-muted/10 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {showChatbot && <Chatbot onClose={() => setShowChatbot(false)} />}
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-card/80 backdrop-blur-sm px-4 py-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
              WZ
            </div>
            <span className="font-bold text-foreground">WorkZone</span>
          </div>
          <div className="flex items-center gap-1">
            <Popover onOpenChange={(open) => setShowMessages(open)}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`relative ${showMessages ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Messages"
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Messages</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`p-3 hover:bg-muted/50 cursor-pointer ${!message.read ? 'bg-muted/30' : ''}`}
                      onClick={() => markAsRead(message.id)}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{message.sender}</span>
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{message.text}</p>
                      {!message.read && <div className="w-2 h-2 rounded-full bg-primary mt-2" />}
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t text-center">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All Messages
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChatbot(!showChatbot)}
              className={`relative ${showChatbot ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              title="Chatbot"
            >
              <Bot className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                3
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
              title={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              ) : (
                <div className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between bg-card/80 backdrop-blur-sm px-6 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              {navigation.find((item) => pathname.startsWith(item.href))?.name ||
                "Dashboard"}
            </h1>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm text-muted-foreground">Applicant Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs, applications..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
              onClick={() => setChatbotOpen(true)}
              title="Chatbot"
            >
              <Bot className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                3
              </span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">
                2
              </span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
              title={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
            >
              {mounted ? (
                theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              ) : (
                <div className="h-5 w-5" />
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 hover:bg-muted/50 group">
                  <Avatar className="h-8 w-8 border border-muted group-hover:border-primary/50 transition-colors">
                    <AvatarImage src={applicantData.avatar} alt={applicantData.name} />
                    <AvatarFallback className="bg-primary-gradient text-primary-foreground font-semibold dark:text-white">
                      {applicantData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {applicantData.name.split(" ")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {applicantData.email.split("@")[0]}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{applicantData.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {applicantData.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/tenant/applicant-portal/profile" className="w-full cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tenant/applicant-portal/settings" className="w-full cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8 bg-transparent">{children}</main>
      </div>
    </div>
  );
}
