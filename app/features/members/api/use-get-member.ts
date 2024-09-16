import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";


interface useGetMembersProps {
    memberId: Id<"members">;
}


export const useGetMember = ({ memberId }: useGetMembersProps) => {
    const data = useQuery(api.members.getById, { id: memberId });
    const isLoading = data === undefined;

    return {
        data,
        isLoading
    }
}

// #5: 11