import { redirect } from "next/navigation";

// Matches the previous SPA's catch-all behavior (any unmatched path bounced
// straight to /login, no dedicated 404 screen existed).
export default function NotFound() {
  redirect("/login");
}
