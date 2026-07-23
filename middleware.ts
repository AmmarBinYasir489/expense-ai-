import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";


export async function middleware(
  request: NextRequest
) {
  let response =
    NextResponse.next();



  const supabase =
    createServerClient(

      process.env.NEXT_PUBLIC_SUPABASE_URL!,

      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

      {

        cookies: {

          getAll() {

            return request.cookies.getAll();

          },


          setAll(cookiesToSet) {

            cookiesToSet.forEach(
              ({ name, value }) => {

                request.cookies.set(
                  name,
                  value
                );

              }
            );


            response =
              NextResponse.next();


            cookiesToSet.forEach(
              ({ name, value, options }) => {

                response.cookies.set(
                  name,
                  value,
                  options
                );

              }
            );

          },

        },

      }

    );



  const {
    data: {
      user,
    },

  } = await supabase.auth.getUser();




  const pathname =
    request.nextUrl.pathname;



  const protectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/settings");

  if (protectedRoute && !user) {

    return NextResponse.redirect(

      new URL(
        "/login",
        request.url
      )

    );

  }



  if (
    pathname.startsWith("/login")
    &&
    user
  ) {

    return NextResponse.redirect(

      new URL(
        "/dashboard",
        request.url
      )

    );

  }



  return response;

}



export const config = {

  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/settings/:path*",
    "/login",
  ],

};
