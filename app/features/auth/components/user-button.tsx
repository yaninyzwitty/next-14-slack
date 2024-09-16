"use client";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useCurrentUser} from "../api/use-current-user";
import {Loader, LogOut} from "lucide-react";
import {useAuthActions} from "@convex-dev/auth/react";

function UserButton() {
  const {data, isLoading} = useCurrentUser();
  const {signOut} = useAuthActions();
  if (isLoading) {
    return <Loader className="size-4 animate-spin text-muted-foreground " />;
  }

  if (!data) {
    return null;
  }

  const {image, name} = data;
  const avatarFallback = name && name.charAt(0).toUpperCase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
        <Avatar className="rounded-md size-10 hover:opacity-75 transition">
          <AvatarImage alt={name} src={image} />
          <AvatarFallback className="rounded-md bg-sky-500 text-white">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="center" className="w-60">
        <DropdownMenuItem onClick={signOut} className="h-10">
          <LogOut className="size-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default UserButton;
