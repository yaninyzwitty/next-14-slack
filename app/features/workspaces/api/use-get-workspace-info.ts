import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel";

interface useGetWorkspaceInfo {
    id: Id<'workspaces'>

}

export const useGetWorkspaceInfo = ({ id } :useGetWorkspaceInfo) => {
    const data = useQuery(api.workspaces.getInfoById, { id });
    const isLoading = data === undefined;
    return {data, isLoading};
}