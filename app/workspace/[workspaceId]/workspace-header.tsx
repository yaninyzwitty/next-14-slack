import Hint from "@/components/hint";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Doc} from "@/convex/_generated/dataModel";
import {ChevronDown, ListFilter, SquarePenIcon} from "lucide-react";
import PreferencesModal from "./preferences-modal";
import {useState} from "react";
import InviteModal from "./invite-modal";

interface Props {
  workspace: Doc<"workspaces">;
  isAdmin: boolean;
}

function WorkspaceHeader({workspace, isAdmin}: Props) {
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  return (
    <>
      <InviteModal
        open={inviteModalOpen}
        setOpen={setInviteModalOpen}
        name={workspace.name}
        joinCode={workspace.joinCode}
      />
      <PreferencesModal
        open={preferencesModalOpen}
        setOpen={setPreferencesModalOpen}
        initialValue={workspace.name}
      />
      <div className="flex items-center justify-between px-4 h-[49px] gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"transparent"}
              className="font-semibold text-lg w-auto p-1.5 overflow-hidden "
              size={"sm"}
            >
              <span className="truncate">{workspace.name}</span>
              <ChevronDown className="size-4 ml-1 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="w-64">
            <DropdownMenuItem className="cursor-pointer capitalize">
              <div
                className="size-9 relative overflow-hidden bg-[#616061] text-white font-semibold text-xl rounded-md items-center flex justify-center mr-2
"
              >
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col items-start ">
                <p className="font-bold">{workspace.name}</p>
                <p className="text-xs text-muted-foreground">
                  {"Active workspace"}
                </p>
              </div>
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer py-2"
                  onClick={() => setInviteModalOpen(true)}
                >
                  Invite people to {workspace.name}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer py-2"
                  onClick={() => setPreferencesModalOpen(true)}
                >
                  Preferences
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex items-center gap-0.5">
          <Hint label="Filter conversations" side="bottom">
            <Button variant={"transparent"} size={"sm"}>
              <ListFilter className="size-4" />
            </Button>
          </Hint>
          <Hint label="new-message" side="bottom">
            <Button variant={"transparent"} size={"sm"}>
              <SquarePenIcon className="size-4" />
            </Button>
          </Hint>
        </div>
      </div>
    </>
  );
}

export default WorkspaceHeader;
