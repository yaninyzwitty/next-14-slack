"use client";

import {useGetChannels} from "@/app/features/channels/api/use-get-channels";
import {useCreateChannelModal} from "@/app/features/channels/store/use-create-channel-modal";
import {useCurrentMember} from "@/app/features/members/api/use-current-member";
import {useGetWorkspace} from "@/app/features/workspaces/api/use-get-workspace";
import {Id} from "@/convex/_generated/dataModel";
import {useWorkspaceId} from "@/hooks/use-workspace-id";
import {Loader, TriangleAlert} from "lucide-react";
import {useRouter} from "next/navigation";
import {useEffect, useMemo} from "react";

type Props = {
  params: {
    workspaceId: string;
  };
};
function workspaceIdPage({params}: Props) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const workspaceId = useWorkspaceId();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [open, setOpen] = useCreateChannelModal();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {data: member, isLoading: isLoadingMember} = useCurrentMember({
    workspaceId,
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isAdmin = useMemo(() => member?.role === "admin", [member?.role]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {data: workspace, isLoading: isLoadingWorkspace} = useGetWorkspace({
    id: workspaceId,
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {channels, isLoading: isLoadingChannels} = useGetChannels({
    workspaceId: params.workspaceId as Id<"workspaces">,
  });
  console.log("channels", channels);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const channelId = useMemo(() => channels?.[0]?._id, [channels]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (
      isLoadingWorkspace ||
      isLoadingChannels ||
      isLoadingMember ||
      !member ||
      !workspace
    )
      return;
    if (channelId) {
      router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    } else if (!open && isAdmin) {
      setOpen(true);
    }
  }, [
    channelId,
    isLoadingChannels,
    isLoadingMember,
    isLoadingWorkspace,
    isAdmin,
    router,
    workspace,
    workspaceId,
    open,
    setOpen,
    member,
  ]);

  if (isLoadingWorkspace || isLoadingChannels || isLoadingMember) {
    return (
      <div className="flex-1 flex items-center flex-col h-full justify-center gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="flex-1 flex items-center flex-col h-full justify-center gap-2">
        <TriangleAlert className="size-6  text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Workspace not found
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center flex-col h-full justify-center gap-2">
      <TriangleAlert className="size-6  text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        No channel found in this workspace
      </span>
    </div>
  );
}

export default workspaceIdPage;
