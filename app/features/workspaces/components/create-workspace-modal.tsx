"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

import {useCreateWorkspaceModal} from "../store/use-create-workspace-modal";
import {useCreateWorkspace} from "../api/use-create-workspace";
import {useState} from "react";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

function CreateWorkspaceModal() {
  const [open, setOpen] = useCreateWorkspaceModal();
  const {mutate, isPending, isError} = useCreateWorkspace();
  const router = useRouter();
  const [name, setName] = useState("");
  const handleClose = () => {
    setOpen(false);
    setName("");
    // todo clear form
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      {name},
      {
        onSuccess(data) {
          toast.success("Workspace created");
          router.push(`/workspace/${data}`);
          handleClose();
        },
      }
    );
  };
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a workspace</DialogTitle>
        </DialogHeader>
        <form className="space-y-4 " onSubmit={handleSubmit}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            required
            autoFocus
            minLength={3}
            placeholder="Workspace name e.g 'work', 'personal', 'home'"
          />
          <div className="flex justify-end">
            <Button disabled={isPending}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateWorkspaceModal;
