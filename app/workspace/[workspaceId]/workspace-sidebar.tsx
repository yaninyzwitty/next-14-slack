"use client";

import {useGetChannels} from "@/app/features/channels/api/use-get-channels";
import {useCreateChannelModal} from "@/app/features/channels/store/use-create-channel-modal";
import {useCurrentMember} from "@/app/features/members/api/use-current-member";
import {useGetMembers} from "@/app/features/members/api/use-get-members";
import {useGetWorkspace} from "@/app/features/workspaces/api/use-get-workspace";
import {useWorkspaceId} from "@/hooks/use-workspace-id";
import {
  AlertTriangle,
  HashIcon,
  Loader,
  MessageSquareText,
  SendHorizonal,
} from "lucide-react";
import SidebarItem from "./sidebar-item";
import UserItem from "./user-item";
import WorkspaceHeader from "./workspace-header";
import WorkspaceSection from "./workspace-section";
import {useChannelId} from "@/hooks/use-channel-id";
import {useMemberId} from "@/hooks/use-member-id";

function WorkspaceSidebar() {
  const workspaceId = useWorkspaceId();
  const {channels, isLoading} = useGetChannels({workspaceId});
  const channelId = useChannelId();
  const memberId = useMemberId();
  const [_, setOpen] = useCreateChannelModal();
  const {data: members, isLoading: membersLoading} = useGetMembers({
    workspaceId,
  });
  const {data: member, isLoading: memberLoading} = useCurrentMember({
    workspaceId,
  });
  const {data: workspace, isLoading: workspaceIsLoading} = useGetWorkspace({
    id: workspaceId,
  });

  if (workspaceIsLoading || memberLoading) {
    return (
      <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
        <Loader className="size-5 animate-spin text-white" />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className="flex flex-col gap-y-2 bg-[#5E2C5F] h-full items-center justify-center">
        <AlertTriangle className="size-5 text-white" />
        <p className="text-white text-sm">Workspace not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        isAdmin={member.role === "admin"}
        workspace={workspace}
      />
      <div className="flex flex-col px-2 mt-3">
        <SidebarItem label="Threads" icon={MessageSquareText} id="threads" />
        <SidebarItem label="Drafts & Sent" icon={SendHorizonal} id="drafts" />
      </div>

      <WorkspaceSection
        label="Channels"
        hint="new-channel"
        onNew={member.role === "admin" ? () => setOpen(true) : undefined}
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            label={item.name}
            variant={channelId === item._id ? "active" : "default"}
            icon={HashIcon}
            id={item._id}
          />
        ))}
      </WorkspaceSection>

      <WorkspaceSection
        label="Direct messages"
        hint="new-direct-message"
        onNew={() => {}}
      >
        {members?.map((item) => (
          <UserItem
            key={item._id}
            id={item._id}
            label={item.user.name as string}
            image={item.user.image}
            variant={memberId === item._id ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
}

export default WorkspaceSidebar;
