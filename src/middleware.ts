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
    "/api/:path*",
  ]
} 