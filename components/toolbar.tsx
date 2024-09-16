import {MessageSquareText, Pencil, SmileIcon, Trash} from "lucide-react";
import {Button} from "./ui/button";
import Hint from "./hint";
import EmojiPopover from "./emoji-popover";

interface Props {
  isAuthor: boolean;
  isPending: boolean;
  hideThreadButton: boolean;
  handleEdit: () => void;
  handleThread: () => void;
  handleDelete: () => void;
  handleReaction: (value: string) => void;
}
function Toolbar({
  handleDelete,
  handleEdit,
  handleReaction,
  handleThread,
  hideThreadButton,
  isAuthor,
  isPending,
}: Props) {
  return (
    <div className="absolute top-0 right-5">
      <div className="group-hover:opacity-100 opacity-0 transition-opacity border bg-white rounded-md shadow-sm">
        <EmojiPopover
          hint="Add reaction"
          onEmojiSelect={(emoji) => handleReaction(emoji)}
        >
          <Button variant={"ghost"} size={"iconSm"} disabled={isPending}>
            <SmileIcon className="size-4" />
          </Button>
        </EmojiPopover>
        {!hideThreadButton && (
          <Hint label="Reply a thread">
            <Button
              variant={"ghost"}
              size={"iconSm"}
              onClick={handleThread}
              disabled={isPending}
            >
              <MessageSquareText className="size-4" />
            </Button>
          </Hint>
        )}

        {isAuthor && (
          <>
            <Hint label="Edit message">
              <Button
                variant={"ghost"}
                size={"iconSm"}
                onClick={handleEdit}
                disabled={isPending}
              >
                <Pencil className="size-4" />
              </Button>
            </Hint>
            <Hint label="Delete Message">
              <Button
                variant={"ghost"}
                size={"iconSm"}
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash className="size-4" />
              </Button>
            </Hint>
          </>
        )}
      </div>
    </div>
  );
}

export default Toolbar;
