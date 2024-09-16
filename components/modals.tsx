"use client";
import CreateChannelModal from "@/app/features/channels/components/create-channel-modal";
import CreateWorkspaceModal from "@/app/features/workspaces/components/create-workspace-modal";
import {useEffect, useState} from "react";
function Modals() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return;
  return (
    <>
      <CreateWorkspaceModal />
      <CreateChannelModal />
    </>
  );
}

export default Modals;
