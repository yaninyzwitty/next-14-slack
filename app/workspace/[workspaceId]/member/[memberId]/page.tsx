"use client";

import {useCreateOrGetConversation} from "@/app/features/conversations/api/use-create-or-get-conversation";
import {Id} from "@/convex/_generated/dataModel";
import {useMemberId} from "@/hooks/use-member-id";
import {useWorkspaceId} from "@/hooks/use-workspace-id";
import {AlertTriangle, Loader} from "lucide-react";
import {useEffect, useState} from "react";
import {toast} from "sonner";
import Conversation from "./conversation";

function MemberIdPage() {
  const workspaceId = useWorkspaceId();
  const memberId = useMemberId();
  const {mutate, isPending} = useCreateOrGetConversation();
  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);
  useEffect(() => {
    mutate(
      {workspaceId, memberId},
      {
        onSuccess(data) {
          setConversationId(data);
        },
        onError() {
          toast.error("Failed to create or get conversation");
        },
      }
    );
  }, [memberId, mutate, workspaceId]);

  if (isPending) {
    return (
      <div className="flex flex-col  h-full items-center justify-center">
        <Loader className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!conversationId) {
    return (
      <div className="flex flex-col gap-y-2  h-full items-center justify-center">
        <AlertTriangle className="size-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Conversation not found
        </span>
      </div>
    );
  }

  return <Conversation id={conversationId} />;
}

export default MemberIdPage;
