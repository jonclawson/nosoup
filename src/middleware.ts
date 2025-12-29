import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname
    if (process.env.R2_USE_R2 === 'true' && pathname.startsWith('/files/')) {
      // const url = new URL(`${process.env.UPLOADS_URL}${pathname.replace(/^\/files/, '')}`)
      // url.search = req.nextUrl.search

      const url = req.nextUrl.clone()
      // url.pathname = process.env.UPLOADS_URL as string + pathname.replace(/^\/files/, '')

      url.pathname = pathname.replace(/^\/files/, '/api/files')
      return NextResponse.redirect(url, 307)
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
      authorized: ({ req, token }) => {
        if (req.method === "GET" && (
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
    "/files"
  ]
} 