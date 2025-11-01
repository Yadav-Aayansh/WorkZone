"use client";

import Link from "next/link";
import { Menu, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTenant } from "@/providers/tenant-provider";
import { useTenantAuth } from "@/providers/tenant-auth-provider";
import Image from "next/image";

const menuItems = [
  { name: "Home", href: "/tenant" },
  { name: "Careers", href: "/tenant/careers" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

export const TenantHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { tenant } = useTenant();
  const { isAuthenticated } = useTenantAuth();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-50 w-full px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-7xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/80 max-w-5xl rounded-2xl border backdrop-blur-xl shadow-lg lg:px-6"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            {/* Logo Section */}
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/tenant"
                aria-label="home"
                className="flex items-center space-x-3"
              >
                {tenant?.logo ? (
                  <Image
                    src={tenant.logo}
                    alt={tenant.brandName}
                    width={40}
                    height={40}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-primary" />
                )}
                <div className="flex flex-col">
                  <span className="text-xl font-bold">
                    {tenant?.brandName || "Company"}
                  </span>
                  <span className="text-[10px] text-muted-foreground hidden sm:block">
                    {tenant?.subdomain}.workzone.tech
                  </span>
                </div>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="data-[state=active]:rotate-180 data-[state=active]:scale-0 data-[state=active]:opacity-0 m-auto size-6 transition-all duration-200" />
                <X className="data-[state=active]:rotate-0 data-[state=active]:scale-100 data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 transition-all duration-200" />
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm font-medium">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground block transition-colors duration-150"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions Section */}
            <div
              data-state={menuState ? "active" : "inactive"}
              className="bg-background data-[state=active]:block lg:data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-3 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent"
            >
              {/* Mobile Navigation */}
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground block transition-colors duration-150"
                        onClick={() => setMenuState(false)}
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t pt-6">
                  <ThemeToggle />
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit md:items-center">
                <div className="hidden lg:block">
                  <ThemeToggle />
                </div>

                {!isAuthenticated ? (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/tenant/login">Sign In</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/tenant/signup">Get Started</Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild size="sm">
                    <Link href="/tenant/employee-portal">Dashboard</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
