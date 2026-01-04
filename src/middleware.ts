import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname

    // files api
    if (process.env.R2_USE_R2 === 'true' && pathname.startsWith('/files/')) {
      const url = req.nextUrl.clone()
      url.pathname = pathname.replace(/^\/files/, '/api/files')
      return NextResponse.rewrite(new URL(url.pathname, req.url))
    }

    // NextResponse.rewrite /articleSlug to /articles/articleId
    // if pathname regex matches /somethiing or /something/
    if (/^\/[^\/]+\/?$/.test(pathname) 
    && !pathname.startsWith('/api') 
    && !pathname.startsWith('/files')
    && !pathname.startsWith('/users')
    && !pathname.startsWith('/articles')
    && !pathname.startsWith('/auth')
    && !pathname.startsWith('/_next')
    && !pathname.includes('.')) {
    const slug = pathname.slice(1)
    const res = await fetch(`${req.nextUrl.origin}/api/articles/slug/${encodeURIComponent(slug)}`);
    console.log('Middleware fetch for slug:', slug, 'Response status:', res.status);
    if (res.ok) {
      const data = await res.json();
      if (data?.id) {
        // rewrite/redirect using the id
        console.log('Rewriting to article ID:',`/articles/${data.id}`);
        return NextResponse.rewrite(new URL(`/articles/${data.id}`, req.url));
      }
      }
    }

    // Add CSRF protection headers
    const response = NextResponse.next()
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "origin-when-cross-origin")
    
    return response
  },
  {
    callbacks: {
      // Auth
      authorized: ({ req, token }) => {
        if (req.method === "GET" && (
          req.nextUrl.pathname.startsWith('/articles') || // because of /:path* matcher
          req.nextUrl.pathname.startsWith('/auth') || // because of /:path* matcher
          req.nextUrl.pathname.startsWith("/api/settings") ||
          req.nextUrl.pathname.startsWith("/api/articles") ||
          req.nextUrl.pathname.startsWith("/api/menu") ||
          req.nextUrl.pathname.startsWith("/api/files") ||
          req.nextUrl.pathname.startsWith("/files")
        )) {
          return true
        }
        if (!!token && token.role !== "admin" && (
             req.nextUrl.pathname.startsWith("/api/users")
          || req.nextUrl.pathname.startsWith("/users")
        ) && ( 
              !req.nextUrl.pathname.startsWith(`/users/${token.id}`)
          && !req.nextUrl.pathname.startsWith(`/api/users/${token.id}`) )) {
            console.log("Unauthorized access", token)
            console.log("Path:", req.nextUrl.pathname)
          // get, post or put on own user only
          return false
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/users",
    "/users/:path*",
    "/articles/:path*/edit/:path*",
    "/articles/new",
    "/api/:path*",
    "/files/:path*", // ensure middleware runs for /files paths
    "/files",
    "/:path" // for article slug rewriting
  ]
} 