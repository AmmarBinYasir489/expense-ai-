import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";


export async function middleware(
  request: NextRequest
) {

  const response = NextResponse.next();


  const supabase = createServerClient(

    process.env.NEXT_PUBLIC_SUPABASE_URL!,

    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

    {
      cookies: {

        getAll() {

          return request.cookies.getAll();

        },

        setAll(cookies) {

          cookies.forEach(({ name, value }) => {

            response.cookies.set(
              name,
              value
            );

          });

        },

      },

    }

  );



  const {
    data: {
      user
    }
  } = await supabase.auth.getUser();



  const pathname =
    request.nextUrl.pathname;



  // Protect dashboard

  if (
    pathname.startsWith("/dashboard")
    &&
    !user
  ) {

    return NextResponse.redirect(
      new URL(
        "/login",
        request.url
      )
    );

  }



  // Prevent logged user opening login

  if (
    pathname === "/login"
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

    "/login"

  ],

};