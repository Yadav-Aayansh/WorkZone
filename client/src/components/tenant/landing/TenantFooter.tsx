"use client";

import React from "react";
import Link from "next/link";
import { useTenant } from "@/providers/tenant-provider";
import {
  Building2,
  Mail,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

const footerLinks = {
  company: [
    { name: "About Us", href: "#about" },
    { name: "Careers", href: "/tenant/careers" },
    { name: "Contact", href: "#contact" },
    { name: "Blog", href: "#" },
  ],
  resources: [
    { name: "Employee Portal", href: "/tenant/login" },
    { name: "Help Center", href: "#" },
    { name: "FAQs", href: "#" },
    { name: "Documentation", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
    { name: "Compliance", href: "#" },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Globe, href: "#", label: "Website" },
];

export const TenantFooter = () => {
  const { tenant } = useTenant();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        {/* Main Footer Content */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/tenant" className="flex items-center space-x-3">
              {tenant?.logo ? (
                <Image
                  src={tenant.logo}
                  alt={tenant.brandName}
                  width={40}
                  height={40}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <Building2 className="h-10 w-10 text-primary" />
              )}
              <div className="flex flex-col">
                <span className="text-xl font-bold">
                  {tenant?.brandName || "Company"}
                </span>
                <span className="text-xs text-muted-foreground">
                  Powered by WorkZone
                </span>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground max-w-sm">
              Empowering teams and transforming workplaces with innovative HR
              solutions. Join us in building the future of work.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground text-center md:text-left">
            © {currentYear} {tenant?.brandName || "Company"}. All rights
            reserved.
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a
              href={`mailto:support@${tenant?.subdomain}.workzone.tech`}
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Contact Support</span>
            </a>
            <span className="text-border">|</span>
            <span className="text-xs">{tenant?.subdomain}.workzone.tech</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
