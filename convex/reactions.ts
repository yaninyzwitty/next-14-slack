import { v } from "convex/values"
import { Id } from "./_generated/dataModel"
import { mutation, QueryCtx } from "./_generated/server"
import { getAuthUserId } from "@convex-dev/auth/server"

const getMember = async (ctx: QueryCtx, workspaceId: Id<'workspaces'>, userId: Id<'users'>) => {
    return ctx.db.query('members').withIndex('by_workspaceId_and_userId', q => q.eq('workspaceId', workspaceId).eq('userId', userId)).unique()

}


export const toggle = mutation({
    args: {
        id: v.id('messages'),
        value: v.string()

    },
    async handler(ctx, args) {
        const userId = await getAuthUserId(ctx);
        if(!userId){
            throw new Error("You must be logged in to create a workspace");
        }

        const message = await ctx.db.get(args.id);
        if(!message){
            throw new Error("Message not found");
        }

        const member = await getMember(ctx, message.workspaceId, userId);
        if(!member){
            throw new Error("You are not a member of this workspace");
        }

        const existingMessageReactionFromUser = await ctx.db.query("reactions").filter((q) =>
            q.and(
                q.eq(q.field("messsageId"), args.id),
                q.eq(q.field("memberId"), member._id),
                q.eq(q.field("value"), args.value),
            )
        ).first();


        if(existingMessageReactionFromUser) {
            await ctx.db.delete(existingMessageReactionFromUser._id)
            return existingMessageReactionFromUser?._id


        } else {
            const newReactionId = await ctx.db.insert("reactions", {
                memberId: member._id,
                value: args.value,
                messsageId: message._id,
                workspaceId: message.workspaceId
            })

            return newReactionId
        }






        

        
           


    

        
    },
})