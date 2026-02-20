"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, LogOut, LayoutDashboard } from "lucide-react";
import { authClient } from "@/server/better-auth/client"; // adjust path
import Image from "next/image";
import Logo from "../../../../public/logo.svg";

type Props = {
  user:
  | {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
    phone: string;
    countryCode: string;
  }
  | undefined;
};

export function AppNavbar({ user }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left */}
        <div
          onClick={() => router.push("/dashboard")}
          className="cursor-pointer text-xl font-semibold"
        >
          <Image src={Logo} alt="Logo" className="h-12 w-auto" width={100} height={100} />
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/protected/dashboard")}>
            Calendar
            <Calendar className="h-5 w-5" />
          </Button>

          <Button variant="ghost" onClick={() => router.push("/protected/scheduledClasses")}>
            Scheduled Classes
            <LayoutDashboard className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <p className="text-sm font-medium">{user?.name ?? "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut className="mr-2 h-4 w-4 hover:text-white" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
