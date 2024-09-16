import { useMutation  } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useCallback, useMemo, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
}


type RequestType = { name: string };
type ResponseType = Id<'workspaces'> | null; 



export const useCreateWorkspace = () => {

    const [status, setStatus] = useState<"success" | "pending" | "error" | "settled" | null>(null);
    const [data, setData] = useState<ResponseType>(null);
    const [error, setError] = useState<Error | null>(null);

    const isPending = useMemo(() => status === "pending", [status])
    const isError = useMemo(() => status === "error", [status])
    const isSettled = useMemo(() => status === "settled", [status])
    const isSuccess = useMemo(() => status === "success", [status])




    const mutation = useMutation(api.workspaces.create);
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