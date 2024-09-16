"use client";
import {useRemoveWorkspace} from "@/app/features/workspaces/api/use-remove-workspace";
import {useUpdateWorkspace} from "@/app/features/workspaces/api/use-update-workspace";
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
import useConfirm from "@/hooks/use-confirm";
import {useWorkspaceId} from "@/hooks/use-workspace-id";
import {Trash} from "lucide-react";
import {useRouter} from "next/navigation";
import React, {useState} from "react";
import {toast} from "sonner";

interface Props {
  open: boolean;
  initialValue: string;
  setOpen: (open: boolean) => void;
}
function PreferencesModal({initialValue, open, setOpen}: Props) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const [editOpen, setEditOpen] = useState(false);
  const [ConfirmDIalog, confirm] = useConfirm(
    "Are you sure?",
    "This actions is irreversible"
  );
  const {mutate: updateWorkspace, isPending: isUpdatingWorkspace} =
    useUpdateWorkspace();
  const {mutate: removeWorkspace, isPending: isRemovingWorkspace} =
    useRemoveWorkspace();

  const handleRemove = async () => {
    const ok = await confirm();
    if (!ok) return;
    removeWorkspace(
      {id: workspaceId},
      {
        onSuccess: () => {
          setEditOpen(false);
          router.replace("/");
          toast.success("Workspace removed");
        },
        onError: () => {
          toast.error("Failed to remove workspace");
        },
      }
    );
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateWorkspace(
      {name: value, id: workspaceId},
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("Workspace updated");
        },
        onError: () => {
          toast.error("Failed to update workspace");
        },
      }
    );
  };
  return (
    <>
      <ConfirmDIalog />
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>{value}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Workspace name</p>
                    <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                      Edit
                    </p>
                  </div>
                  <p className="text-sm">{value}</p>
                </div>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename this workspace</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleEdit}>
                  <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={isUpdatingWorkspace}
                    required
                    autoFocus
                    minLength={3}
                    maxLength={80}
                    placeholder="Enter workspace name"
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant={"outline"}
                        disabled={isUpdatingWorkspace}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button variant={"outline"} disabled={isUpdatingWorkspace}>
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <button
              disabled={isRemovingWorkspace}
              onClick={handleRemove}
              className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600"
            >
              <Trash className="size-4 " />
              <p className="text-sm font-semibold">Delete workspace</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PreferencesModal;
