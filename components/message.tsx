import {Doc, Id} from "@/convex/_generated/dataModel";
import dynamic from "next/dynamic";
import {format, isToday, isYesterday} from "date-fns";
import Hint from "./hint";
import {Avatar, AvatarFallback, AvatarImage} from "./ui/avatar";
import Thumbnail from "./thumbnail";
import Toolbar from "./toolbar";
import {useUpdateMessage} from "@/app/features/messages/api/use-update-message";
import {toast} from "sonner";
import {cn} from "@/lib/utils";
import {EditorValue} from "./editor";
import {useRemoveMessage} from "@/app/features/messages/api/use-remove-message";
import useConfirm from "@/hooks/use-confirm";
import {useToggleReaction} from "@/app/features/reactions/api/use-toggle-reaction";
import Reactions from "./reactions";
import {usePanel} from "@/hooks/use-panel";
import ThreadBar from "./thread-bar";

const Renderer = dynamic(() => import("./renderer"), {
  ssr: false,
});
const Editor = dynamic(() => import("./editor"), {
  ssr: false,
});

interface Props {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;

  body: Doc<"messages">["body"];
  image: string | null | undefined;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updatedAt"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditing: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
  threadTimestamp?: number;
}
function Message({
  body,
  createdAt,
  id,
  image,
  isAuthor,
  isEditing,
  memberId,
  reactions,
  setEditing,
  updatedAt,
  authorImage,
  authorName = "Member",
  hideThreadButton,
  isCompact,
  threadCount,
  threadImage,
  threadName,
  threadTimestamp,
}: Props) {
  const {
    onOpenMessage,
    onClose: onCloseMessage,
    parentMessageId,
    onOpenProfile,
  } = usePanel();
  const [ConfirmDialog, confirm] = useConfirm(
    "Delete message",
    "Are you sure you want to delete this message?"
  );

  const {mutate: updateMessage, isPending: isUpdatingMessage} =
    useUpdateMessage();
  const {mutate: toggleReaction, isPending: isTogglingReaction} =
    useToggleReaction();

  const {mutate: deleteMessage, isPending: isRemovingMessage} =
    useRemoveMessage();
  const isPending = isUpdatingMessage || isTogglingReaction;
  const handleRemove = async () => {
    const ok = await confirm();
    if (!ok) return;
    deleteMessage(
      {id},
      {
        onSuccess() {
          toast.success("Message deleted successfully");
          if (parentMessageId === id) onCloseMessage(); //close the thread
        },
        onError() {
          toast.error("Failed to delete message");
        },
      }
    );
  };

  const handleReaction = (value: string) => {
    toggleReaction(
      {id, value},
      {
        onError() {
          toast.error("Failed to toggle reaction");
        },
      }
    );
  };
  const handleUpdate = ({body}: EditorValue) => {
    updateMessage(
      {id, body},
      {
        onSuccess: () => {
          toast.success("Message updated");
          setEditing(null);
        },
        onError() {
          toast.error("Failed to update message");
        },
      }
    );
  };
  const formatFullTime = (date: Date) => {
    return `${isToday(date) ? "Today " : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm: ss a")}`;
  };

  const fallback = authorName.charAt(0).toUpperCase();

  if (isCompact) {
    return (
      <>
        <ConfirmDialog />

        <div
          className={cn(
            "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
            isEditing && "bg-[#F2C74433] hover:bg-[#F2C74433]",
            isRemovingMessage &&
              "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
          )}
        >
          <div className="flex items-start gap-2">
            <Hint label={formatFullTime(new Date(createdAt))}>
              <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                {format(new Date(createdAt), "hh:mm")}
              </button>
            </Hint>

            {isEditing ? (
              <div className="w-full h-full">
                <Editor
                  onSubmit={handleUpdate}
                  disabled={isUpdatingMessage}
                  defaultValue={JSON.parse(body)}
                  onCancel={() => setEditing(null)}
                  variant="update"
                />
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <Renderer value={body} />
                <Thumbnail url={image} />

                {updatedAt ? (
                  <span className="text-xs text-muted-foreground">
                    (edited)
                  </span>
                ) : null}
                <Reactions data={reactions} onChange={handleReaction} />
                <ThreadBar
                  count={threadCount}
                  image={threadImage as string}
                  timestamp={threadTimestamp as number}
                  onClick={() => {
                    onOpenMessage(id);
                  }}
                  threadName={threadName as string}
                />
              </div>
            )}
          </div>
          {!isEditing && (
            <Toolbar
              isAuthor={isAuthor}
              isPending={isPending}
              handleReaction={handleReaction}
              handleEdit={() => setEditing(id)}
              handleThread={() => onOpenMessage(id)}
              handleDelete={handleRemove}
              hideThreadButton={hideThreadButton!}
            />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <ConfirmDialog />

      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#F2C74433] hover:bg-[#F2C74433]",
          isRemovingMessage &&
            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200"
        )}
      >
        <div className="flex items-start gap-2">
          <button onClick={() => onOpenProfile(memberId)}>
            <Avatar className=" rounded-md ">
              <AvatarImage className="rounded-md " src={authorImage} />
              <AvatarFallback className="rounded-md bg-sky-500 text-white">
                {fallback}
              </AvatarFallback>
            </Avatar>
          </button>

          {isEditing ? (
            <div className="w-full h-full">
              <Editor
                onSubmit={handleUpdate}
                disabled={isUpdatingMessage}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditing(null)}
                variant="update"
              />
            </div>
          ) : (
            <div className="flex flex-col w-full overflow-hidden">
              <div className="text-sm">
                <button
                  className="font-bold text-primary hover:underline"
                  onClick={() => onOpenProfile(memberId)}
                >
                  {authorName}
                </button>
                <span>&nbsp;&nbsp;</span>
                <Hint label={formatFullTime(new Date(createdAt))}>
                  <button className="text-xs text-muted-foreground hover:underline">
                    {format(new Date(createdAt), "h:mm a")}
                  </button>
                </Hint>
              </div>
              <Renderer value={body} />
              <Thumbnail url={image} />
              {updatedAt ? (
                <span className="text-xs text-muted-foreground">(edited)</span>
              ) : null}
              <Reactions data={reactions} onChange={handleReaction} />
              <ThreadBar
                count={threadCount}
                onClick={() => {
                  onOpenMessage(id);
                }}
                threadName={threadName as string}
                image={threadImage as string}
                timestamp={threadTimestamp as number}
              />
            </div>
          )}
        </div>
        {!isEditing && (
          <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleReaction={handleReaction}
            handleEdit={() => setEditing(id)}
            handleThread={() => onOpenMessage(id)}
            handleDelete={handleRemove}
            hideThreadButton={hideThreadButton!}
          />
        )}
      </div>
    </>
  );
}

export default Message;
