import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {useWorkspaceId} from "@/hooks/use-workspace-id";
import {useRouter} from "next/navigation";
import React, {useState} from "react";
import {toast} from "sonner";
import {useCreateChannel} from "../api/use-create-channel";
import {useCreateChannelModal} from "../store/use-create-channel-modal";

function CreateChannelModal() {
  const [open, setOpen] = useCreateChannelModal();
  const [name, setName] = useState("");
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const {mutate, isPending} = useCreateChannel();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setName(value);
  };

  const handleClose = () => {
    setName("");
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(
      {name, workspaceId},
      {
        onSuccess(id) {
          toast.success("Channel created");
          router.push(`/workspace/${workspaceId}/channel/${id}`);
          handleClose();
        },
        onError(error) {
          toast.error("Failed to create channel");
        },
      }
    );
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a channel</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            value={name}
            disabled={false}
            onChange={handleChange}
            required
            autoFocus
            minLength={3}
            maxLength={80}
            placeholder="e.g plan-budget"
          />
          <div className="flex justify-end">
            <Button disabled={isPending}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateChannelModal;
