import { PublicNavbar } from "../_components/Layout/PublicNavbar";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main>{children}</main>
    </div>
  );    
}