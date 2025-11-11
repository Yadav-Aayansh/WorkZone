"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  useSidebar,
} from "@/components/ui/sidebar";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export interface CollapsibleSidebarProps {
  navItems: NavItem[];
  user: {
    name: string;
    role: string;
    avatar?: string;
    id: string;
  };
  brandName?: string;
  onLogout?: () => void;
}

function SidebarContentWrapper({
  navItems,
  user,
  brandName = "WorkZone",
  onLogout,
}: CollapsibleSidebarProps) {
  const pathname = usePathname();
  const { setOpen } = useSidebar();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseEnter = () => {
      setOpen(true);
    };

    const handleMouseLeave = () => {
      setOpen(false);
    };

    const sidebarElement = sidebarRef.current?.closest(
      '[data-sidebar="sidebar"]'
    );
    if (sidebarElement) {
      sidebarElement.addEventListener("mouseenter", handleMouseEnter);
      sidebarElement.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        sidebarElement.removeEventListener("mouseenter", handleMouseEnter);
        sidebarElement.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [setOpen]);

  return (
    <div ref={sidebarRef} className="flex h-full flex-col py-4">
      {/* Header with Brand - Left Aligned */}
      <SidebarHeader className="px-3 -ml-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground shadow-sm">
                <span className="text-xl font-bold text-background">
                  {brandName[0]}
                </span>
              </div>
              <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold truncate">
                  {brandName}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user.role}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Spacer */}
      <div className="h-6" />

      {/* Navigation Items - Left Aligned, Consistent Spacing */}
      <SidebarContent className="px-3 -ml-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-11 justify-start px-3 rounded-xl group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 w-full"
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Spacer */}

      {/* Footer with Settings and Profile - Left Aligned */}
      <SidebarFooter className="px-3 mt-auto">
        <SidebarMenu className="space-y-1">
          {/* Settings */}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              className="h-11 justify-start px-3 rounded-xl group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <Settings className="h-5 w-5 shrink-0" />
              <span className="truncate group-data-[collapsible=icon]:hidden">
                Settings
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Profile */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-11 justify-start px-3 rounded-xl group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 data-[state=open]:bg-sidebar-accent">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left overflow-hidden group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-medium truncate w-full">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      ID: {user.id.substring(0, 8)}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="right"
                className="w-56"
                sideOffset={12}
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </div>
  );
}

export function CollapsibleSidebar(props: CollapsibleSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="border-none bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-neutral-950 dark:via-neutral-900/50 dark:to-neutral-800/30 backdrop-blur-sm"
    >
      <SidebarContentWrapper {...props} />
    </Sidebar>
  );
}
