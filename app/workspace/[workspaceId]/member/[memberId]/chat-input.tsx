import {useCreateMessage} from "@/app/features/messages/api/use-create-message";
import {useGenerateUploadUrl} from "@/app/features/upload/api/use-generate-upload-url";
import {EditorValue} from "@/components/editor";
import {Id} from "@/convex/_generated/dataModel";
import {useWorkspaceId} from "@/hooks/use-workspace-id";
import dynamic from "next/dynamic";
import Quill from "quill";
import {useRef, useState} from "react";
import {toast} from "sonner";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

interface ChatInputProps {
  placeholder: string;
  conversationId: Id<"conversations">;
}

interface CreateMessageValues {
  conversationId: Id<"conversations">;
  workspaceId: Id<"workspaces">;
  body: string;
  image?: Id<"_storage">;
}
function ChatInput({placeholder, conversationId}: ChatInputProps) {
  const {mutate: createMessage} = useCreateMessage();
  const [isPending, setIsPending] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const workspaceId = useWorkspaceId();
  const {mutate: generateUploadUrl} = useGenerateUploadUrl();

  const editorRef = useRef<Quill | null>(null);
  const handleSubmit = async ({body, image}: EditorValue) => {
    try {
      setIsPending(true);
      editorRef.current!.enable(false);
      const values: CreateMessageValues = {
        workspaceId,
        body,
        image: undefined,
        conversationId,
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
  return (
    <div className="px-5 w-full">
      <Editor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disabled={isPending}
        innerRef={editorRef}
      />
    </div>
  );
}

export default ChatInput;
