"use client";
import VerificationInput from "react-verification-input";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {useWorkspaceId} from "@/hooks/use-workspace-id";
import {useGetWorkspaceInfo} from "@/app/features/workspaces/api/use-get-workspace-info";
import {Loader} from "lucide-react";
import {useJoin} from "@/app/features/workspaces/api/use-join";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {useEffect, useMemo} from "react";

function WorkspaceIdPage() {
  const workspaceId = useWorkspaceId();
  const router = useRouter();
  const {data, isLoading} = useGetWorkspaceInfo({id: workspaceId});
  // 06 24
  const {mutate, isPending} = useJoin();

  const isMember = useMemo(() => data?.isMember, [data?.isMember]);

  useEffect(() => {
    if (isMember) {
      router.push(`/workspace/${workspaceId}`);
    }
  }, [router, isMember, workspaceId]);

  const handleComplete = (value: string) => {
    mutate(
      {workspaceId, joinCode: value},
      {
        onSuccess(id) {
          router.replace(`/workspace/${id}`);
          toast.success("Joined workspace successfully");
        },
        onError(error) {
          toast.error("Failed to join workspace");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center ">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white rounded-lg p-8 shadow-md">
      <Image src={"/logo.svg"} alt="logo" width={60} height={60} />
      <div className="flex items-center flex-col gap-y-4 justify-center max-w-md ">
        <div className="flex flex-col gap-y-2 items-center justify-center">
          <h1 className="text-2xl font-bold">Join {data?.name}</h1>
          <p className="text-sm text-muted-foreground">
            Enter the workspace code to join
          </p>
        </div>
        <VerificationInput
          onComplete={handleComplete}
          autoFocus
          length={6}
          classNames={{
            container: cn(
              "flex gap-x-2",
              isPending && "opacity-50 cursor-not-allowed"
            ),
            character:
              "uppercase h-auto rounded-md border border-gray-300 flex items-center justify-center text-lg font-medium text-gray-500",
            characterInactive: "bg-muted",
            characterSelected: "bg-white text-black",
            characterFilled: "bg-white text-black",
          }}
        />
      </div>
      <div className="flex gap-x-4">
        <Button size={"lg"} variant={"outline"} asChild>
          <Link href={"/"}>Back to home</Link>
        </Button>
      </div>
    </div>
  );
}

export default WorkspaceIdPage;
