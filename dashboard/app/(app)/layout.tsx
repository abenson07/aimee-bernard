import { verifySession } from "@/lib/dal";
import { ToastProvider } from "./toast";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await verifySession();
  return <ToastProvider>{children}</ToastProvider>;
}
