import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "../../../../public/logo.svg";
import Image from "next/image";

export function PublicNavbar() {
  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}

        <Link href="/" className="text-lg font-semibold tracking-tight">
          <Image src={Logo} alt="Logo" className="h-12 w-auto" width={100} height={100} />
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/">Sign In</Link>
          </Button>

          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}