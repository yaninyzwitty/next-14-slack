import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";

type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
}


type RequestType = { workspaceId: Id<'workspaces'>; memberId: Id<'members'>};
type ResponseType = Id<'conversations'> | null; 



export const useCreateOrGetConversation = () => {

    const [status, setStatus] = useState<"success" | "pending" | "error" | "settled" | null>(null);
    const [data, setData] = useState<ResponseType>(null);
    const [error, setError] = useState<Error | null>(null);

    const isPending = useMemo(() => status === "pending", [status])
    const isError = useMemo(() => status === "error", [status])
    const isSettled = useMemo(() => status === "settled", [status])
    const isSuccess = useMemo(() => status === "success", [status])




    const mutation = useMutation(api.conversations.createOrGet);
    const mutate = useCallback(async (values: RequestType, options?: Options) => {
        try {
            setData(null)
            setError(null)
            setStatus("pending")


            const res = await mutation(values);
            options?.onSuccess?.(res)
            setStatus('success')

            return res;

            
        } catch (error) {
            options?.onError?.(error as Error);
            setError(error as Error);
            setStatus('error')
            if(options?.throwError) throw error;

            
        }
        finally {
            options?.onSettled?.()
            setStatus('settled')

        }

      
    }, [mutation])

    return {
        mutate,
        data,
        error,
        isPending,
        isSuccess,
        isError,
        isSettled
    }
    
}