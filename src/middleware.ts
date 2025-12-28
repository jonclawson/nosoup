import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
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
        if (req.method === "GET" && req.nextUrl.pathname.startsWith("/api/articles")) {
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
  ]
} 