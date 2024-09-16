import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";


interface UseGetChannelProps {
    channelId: Id<"channels">;
}


export const useGetChannel = ({ channelId }: UseGetChannelProps) => {
    const channel = useQuery(api.channels.getById, { 
        id: channelId
     });
    const isLoading = channel === undefined;

    return {
        channel,
        isLoading
    }
}

// #5: 11