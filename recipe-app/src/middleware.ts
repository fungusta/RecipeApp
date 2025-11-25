import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
// const isPublicRoute = createRouteMatcher([
//   '/',
// ])

export default clerkMiddleware(async (auth, request) => {
  // const { isAuthenticated, redirectToSignIn } = await auth()

  // if (!isAuthenticated && !isPublicRoute(request)) {
  //   return redirectToSignIn({
  //     returnBackUrl: request.url,
  //   });
  // }
})