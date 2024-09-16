import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createOrGet = mutation({
    args: {
        workspaceId: v.id('workspaces'),
        memberId: v.id('members'),
    },
    async handler(ctx, args) {
        const userId = await getAuthUserId(ctx);
        if(!userId){
            throw new Error("Unauthorized");
        }
        
        const currentMember = await ctx.db.query('members')
        .withIndex('by_workspaceId_and_userId', q => q.eq('workspaceId', args.workspaceId)
        .eq('userId', userId)).unique()
        const otherMember = await ctx.db.get(args.memberId);
        if(!currentMember || !otherMember){
            throw new Error("Invalid member");
        }

        const existingConversation = await ctx.db.query('conversations')
        .filter(
            q => q.eq(q.field('workspaceId'), args.workspaceId)

    ).filter(
        q => q.or(
            q.and(
                q.eq(q.field('memberOneId'), currentMember._id),
                q.eq(q.field('memberTwoId'), otherMember._id)
            ),
            q.and(
                q.eq(q.field('memberOneId'), otherMember._id),
                q.eq(q.field('memberTwoId'), currentMember._id)
            ),
        )
    ).unique();

    if(existingConversation) {
        return existingConversation._id;
    }

    // create new conversation
    const conversationId = await ctx.db.insert('conversations', {
        workspaceId: args.workspaceId,
        memberOneId: currentMember._id,
        memberTwoId: otherMember._id
    });

    return conversationId;


    },
})