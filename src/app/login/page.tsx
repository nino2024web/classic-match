import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import LoginView from "./LoginView";
import {
  SESSION_COOKIE_NAME,
  validateSessionCookie,
} from "@/lib/session";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const validation = validateSessionCookie(rawSession);

  if (validation.status === "valid") {
    redirect("/member");
  }

  return <LoginView />;
}
