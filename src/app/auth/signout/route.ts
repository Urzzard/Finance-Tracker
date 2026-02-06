import { createClient } from "@/src/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // 1. Verificamos si hay sesión activa
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 2. Si la hay, la destruimos (Esto borra la cookie)
  if (session) {
    await supabase.auth.signOut();
  }

  // 3. Redirigimos al usuario al Login
  revalidatePath("/", "layout");
  return NextResponse.redirect(new URL("/login", req.url), {
    status: 302,
  });
}