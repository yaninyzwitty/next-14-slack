import { defineSchema, defineTable   } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
    ...authTables,
    workspaces: defineTable({
      name: v.string(),
      userId: v.id('users'), //id who created the workspace
      joinCode: v.string(),
    }),
    members: defineTable({
      userId: v.id('users'),
      workspaceId: v.id('workspaces'),
      role: v.union(v.literal('admin'), v.literal('member'))
    })
    .index('by_user_id', ['userId']) //query faster by user id
    .index('by_workspace_id', ['workspaceId']) //by the workspace
    .index('by_workspaceId_and_userId', ['workspaceId', 'userId']), //query by workspace and user id

    channels: defineTable({
      name: v.string(),
      workspaceId: v.id('workspaces'),

    }).index('by_workspace_id', ['workspaceId']),
    conversations: defineTable({
      workspaceId: v.id('workspaces'),
      memberOneId: v.id('members'),
      memberTwoId: v.id('members')
    

    }).index('by_workspace_id', ['workspaceId']),

    messages: defineTable({
      body: v.string(),
      image: v.optional(v.id('_storage')),
      memberId: v.id('members'), //who sent the message
      workspaceId: v.id('workspaces'),
      channelId: v.optional(v.id('channels')),
      parentMessageId: v.optional(v.id('messages')),
      updatedAt: v.optional(v.number()),
      conversationId: v.optional(v.id('conversations'))
    }).index('by_workspace_id', ['workspaceId'])
    .index('by_member_id', ['memberId'])
    .index('by_channel_id', ['channelId'])
    .index('by_conversation_id', ['conversationId'])
    .index('by_parent_message_id', ['parentMessageId'])
    .index('by_channel_id_parent_message_id_conversation_id', ['channelId', 'parentMessageId', 'conversationId']),
    reactions: defineTable({
      workspaceId: v.id('workspaces'),
      messsageId: v.id('messages'),
      memberId: v.id('members'),
      value: v.string()
    }).index('by_workspace_id', ['workspaceId'])
    .index('by_message_id', ['messsageId'])
    .index('by_member_id', ['memberId']),

  })


   


  export default schema;