import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Multi-tenant middleware for subdomain routing
 * 
 * Platform (main domain):
 *   - workzone.tech → app/(platform)/*
 *   - www.workzone.tech → app/(platform)/*
 * 
 * Tenant (subdomain):
 *   - company.workzone.tech → app/(tenant)/*
 *   - company.localhost:3000 → app/(tenant)/* (development)
 */
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // Extract subdomain
  const subdomain = getSubdomain(hostname);

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🌐 Middleware:', {
      hostname,
      subdomain,
      pathname: url.pathname,
    });
  }

  // Platform routes (main domain or www subdomain)
  if (!subdomain || subdomain === 'www') {
    // Accessing main domain - route to platform
    if (url.pathname.startsWith('/tenant')) {
      // Prevent direct access to /tenant routes on platform domain
      // Redirect to platform home
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Allow all other platform routes
    return NextResponse.next();
  }

  // Tenant routes (subdomain detected)
  // Rewrite /path to /tenant/path internally
  const rewriteUrl = new URL(url);
  
  // Don't rewrite if already has /tenant prefix
  if (!url.pathname.startsWith('/tenant')) {
    rewriteUrl.pathname = `/tenant${url.pathname}`;
  }
  
  rewriteUrl.search = url.search;

  // Create response with rewrite
  const response = NextResponse.rewrite(rewriteUrl);
  
  // Pass subdomain to app via header (accessible in components)
  response.headers.set('x-tenant-subdomain', subdomain);
  response.headers.set('x-tenant-hostname', hostname);

  return response;
}

/**
 * Extract subdomain from hostname
 * 
 * Examples:
 *   - localhost:3000 → null
 *   - company.localhost:3000 → "company"
 *   - workzone.tech → null
 *   - www.workzone.tech → "www"
 *   - company.workzone.tech → "company"
 */
function getSubdomain(hostname: string): string | null {
  // Remove port if present
  const host = hostname.split(':')[0];
  
  // Split by dots
  const parts = host.split('.');
  
  // For localhost testing: localhost or company.localhost
  if (host.includes('localhost')) {
    if (parts.length >= 2) {
      return parts[0]; // Return 'company' from 'company.localhost'
    }
    return null; // Just 'localhost'
  }
  
  // For production: workzone.tech or company.workzone.tech
  // Need at least 3 parts for subdomain: [subdomain, domain, tld]
  if (parts.length >= 3) {
    return parts[0]; // Return 'company' from 'company.workzone.tech'
  }
  
  // Just domain.tld (no subdomain)
  return null;
}

/**
 * Matcher configuration
 * Exclude static files and Next.js internals from middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
