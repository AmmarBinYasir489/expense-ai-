import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";


export async function POST(request: Request) {

  try {

    const supabase = await createClient();


    const {
      data: {
        user,
      },
    } = await supabase.auth.getUser();



    if (!user) {

      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );

    }



    const body = await request.json();



    const {
      type,
      amount,
      category,
      description,
      date,
      confidence,
    } = body;



    const { data, error } =
      await supabase
        .from("transactions")
        .insert({

          user_id: user.id,

          type,

          amount,

          category,

          description,

          date,

          confidence,

        })
        .select()
        .single();



    if (error) {

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 400,
        }
      );

    }



    return NextResponse.json(data);


  } catch (error) {

    console.error(error);


    return NextResponse.json(
      {
        error: "Server error",
      },
      {
        status: 500,
      }
    );

  }

}