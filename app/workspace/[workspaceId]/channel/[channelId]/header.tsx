import {useRemoveChannel} from "@/app/features/channels/api/use-remove-channel";
import {useUpdateChannel} from "@/app/features/channels/api/use-update-channel";
import {useCurrentMember} from "@/app/features/members/api/use-current-member";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {useChannelId} from "@/hooks/use-channel-id";
import useConfirm from "@/hooks/use-confirm";
import {useWorkspaceId} from "@/hooks/use-workspace-id";
import {Trash} from "lucide-react";
import {useRouter} from "next/navigation";
import React, {useState} from "react";
import {FaChevronDown} from "react-icons/fa";
import {toast} from "sonner";

type Props = {
  title: string;
};
function Header({title}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [value, setValue] = useState(title);
  const channelId = useChannelId();
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const {data: member} = useCurrentMember({workspaceId});
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete this channel",
    "You are about to delete this channel, This action is irreversible"
  );
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setValue(value);
  };

  const handleEditOpen = (value: boolean) => {
    if (member?.role !== "admin") return;
    setEditOpen(value);
  };
  const {mutate: updateChannel, isPending: updatingChannel} =
    useUpdateChannel();
  const {mutate: removeChannel, isPending: isRemovingChannel} =
    useRemoveChannel();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateChannel(
      {id: channelId, name: value},
      {
        onSuccess() {
          toast.success("Channel updated!");
          setEditOpen(updatingChannel);
        },
        onError() {
          toast.error("Failed to update channel");
        },
      }
    );
  };

  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) return;
    removeChannel(
      {id: channelId},
      {
        onSuccess() {
          toast.success("Channel deleted!");
          router.push(`/workspace/${workspaceId}`);
        },
        onError() {
          toast.error("Failed to delete button");
        },
      }
    );
  };

  return (
    <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden ">
      <ConfirmDialog />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={"ghost"}
            className="text-lg font-semibold px-2 overflow-hidden w-auto"
            size={"sm"}
          >
            <span className="truncate"># {title}</span>
            <FaChevronDown className="ml-2 size-2.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle># {title}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog open={editOpen} onOpenChange={handleEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">button name</p>
                    {member?.role === "admin" && (
                      <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                        Edit
                      </p>
                    )}
                  </div>
                  <p className="text-sm"># {title}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename this button</DialogTitle>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <Input
                      value={value}
                      disabled={updatingChannel}
                      onChange={handleChange}
                      required
                      autoFocus
                      minLength={3}
                      maxLength={80}
                      placeholder="e.g plan-budget"
                    />

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant={"outline"} disabled={updatingChannel}>
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button disabled={updatingChannel}>Save</Button>
                    </DialogFooter>
                  </form>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            {member?.role === "admin" && (
              <button
                className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg cursor-pointer border hover:bg-gray-50 text-rose-600"
                onClick={handleDelete}
                disabled={isRemovingChannel}
              >
                <Trash className="size-4 " />
                <p className="text-sm font-semibold">Delete channel</p>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Header;

// 7:03
