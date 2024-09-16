import Message from "@/components/message";
import {Button} from "@/components/ui/button";
import {Id} from "@/convex/_generated/dataModel";
import {useWorkspaceId} from "@/hooks/use-workspace-id";
import {AlertTriangle, Loader, XIcon} from "lucide-react";
import dynamic from "next/dynamic";
import Quill from "quill";
import {useRef, useState} from "react";
import {useCurrentMember} from "../../members/api/use-current-member";
import {useGenerateUploadUrl} from "../../upload/api/use-generate-upload-url";
import {useCreateMessage} from "../api/use-create-message";
import {useGetMessage} from "../api/use-get-message";
import {useChannelId} from "@/hooks/use-channel-id";
import {toast} from "sonner";
import {useGetMessages} from "../api/use-get-messages";
import {differenceInMinutes, format} from "date-fns";
import {formatDateLabel} from "@/lib/utils";
import {EditorValue} from "@/components/editor";

const Editor = dynamic(() => import("@/components/editor"), {ssr: false});

interface Props {
  messageId: Id<"messages">;
  onClose: () => void;
}

const TIME_THRESHOLD = 5;

interface CreateMessageValues {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  body: string;
  parentMessageId?: Id<"messages">;
  image?: Id<"_storage">;
}

function Thread({messageId, onClose}: Props) {
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();

  const [isPending, setIsPending] = useState(false);
  const {mutate: createMessage} = useCreateMessage();
  const {results, status, loadMore} = useGetMessages({
    channelId,
    parentMessageId: messageId,
  });

  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";

  const [editorKey, setEditorKey] = useState(0);
  const {mutate: generateUploadUrl} = useGenerateUploadUrl();

  const editorRef = useRef<Quill | null>(null);

  const {data: currentMember} = useCurrentMember({workspaceId});
  const {data: message, isLoading: isMessageLoading} = useGetMessage({
    id: messageId,
  });

  const handleSubmit = async ({body, image}: EditorValue) => {
    try {
      setIsPending(true);
      editorRef.current!.enable(false);
      const values: CreateMessageValues = {
        channelId,
        workspaceId,
        parentMessageId: messageId,
        body,
        image: undefined,
      };

      if (image) {
        const url = await generateUploadUrl({}, {throwError: true});

        if (!url) {
          throw new Error("Url not found!");
        }

        const res = await fetch(url as string, {
          method: "POST",
          headers: {
            "Content-Type": image.type,
          },
          body: image,
        });

        if (!res.ok) {
          throw new Error("failed to upload image");
        }

        const {storageId} = await res.json();
        values.image = storageId;
      }

      await createMessage(values, {throwError: true});

      setEditorKey((prev) => prev + 1);
    } catch (error) {
      toast.error("failed to send message");
    } finally {
      setIsPending(false);
      editorRef.current?.enable(true);
    }
  };

  const groupedMessages = results?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof results>
  );
  if (isMessageLoading || status === "LoadingFirstPage") {
    return (
      <div className="h-full flex flex-col ">
        <div className="flex justify-between items-center p-4 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button onClick={onClose} size={"iconSm"} variant={"ghost"}>
            <XIcon className="size-5 stroke-[1.5] " />
          </Button>
        </div>
        <div className="flex flex-col gap-y-2 h-full items-center justify-center ">
          <Loader className="size-5 animate-spin  text-muted-foreground " />
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="h-full flex flex-col ">
        <div className="flex justify-between items-center p-4 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button onClick={onClose} size={"iconSm"} variant={"ghost"}>
            <XIcon className="size-5 stroke-[1.5] " />
          </Button>
        </div>
        <div className="flex flex-col gap-y-2 h-full items-center justify-center ">
          <AlertTriangle className="size-5  text-muted-foreground " />
          <p className="text-sm text-muted-foreground">Message not found</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col ">
      <div className="flex justify-between items-center p-4 border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button onClick={onClose} size={"iconSm"} variant={"ghost"}>
          <XIcon className="size-5 stroke-[1.5] " />
        </Button>
      </div>
      <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
        {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
          <div key={dateKey}>
            <div className="text-center my-2 relative">
              <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
              <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                {formatDateLabel(dateKey)}
              </span>
            </div>
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const isCompact =
                prevMessage &&
                prevMessage.user._id === message.user._id &&
                differenceInMinutes(
                  new Date(message._creationTime),
                  new Date(prevMessage._creationTime)
                ) < TIME_THRESHOLD;
              return (
                <Message
                  key={message._id}
                  id={message._id}
                  memberId={message.memberId}
                  authorImage={message.user.image}
                  authorName={message.user.name}
                  isAuthor={message.memberId === currentMember?._id}
                  reactions={message.reactions}
                  body={message.body}
                  image={message.image}
                  updatedAt={message.updatedAt}
                  createdAt={message._creationTime}
                  threadCount={message.threadCount}
                  threadImage={message.threadImage}
                  threadTimestamp={message.threadTimestamp}
                  isEditing={editingId === message._id}
                  setEditing={setEditingId}
                  isCompact={isCompact}
                  hideThreadButton={true}
                />
              );
            })}
          </div>
        ))}
        <div
          className="h-1"
          ref={(el) => {
            if (el) {
              const observer = new IntersectionObserver(
                ([entry]) => {
                  if (entry.isIntersecting && canLoadMore) {
                    loadMore();
                  }
                },
                {threshold: 1.0}
              );
              observer.observe(el);
              return () => observer.disconnect();
            }
          }}
        />

        {isLoadingMore && (
          <div className="text-center my-2 relative">
            <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
              <Loader className="size-4 animate-spin" />
            </span>
          </div>
        )}
        <Message
          hideThreadButton
          memberId={message.memberId}
          authorImage={message.user.image}
          authorName={message.user.name}
          isAuthor={message.memberId === currentMember?._id}
          image={message.image}
          threadName={message.threadName}
          threadCount={message.threadCount}
          threadTimestamp={message.threadTimestamp}
          createdAt={message._creationTime}
          updatedAt={message.updatedAt}
          id={message._id}
          reactions={message.reactions}
          isEditing={editingId === message._id}
          body={message.body}
          setEditing={setEditingId}
        />
      </div>
      <div className="px-4 ">
        <Editor
          onSubmit={handleSubmit}
          innerRef={editorRef}
          disabled={isPending}
          key={editorKey}
          placeholder="Reply"
        />
      </div>
    </div>
  );
}

export default Thread;
