import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
    args: {
        name: v.string(),

    },
    handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if(!userId){
        throw new Error("You must be logged in to create a workspace");
    }

    const joinCode = generateCode()

    const workspaceId = await ctx.db.insert('workspaces', {
        name: args.name,
        joinCode,
        userId,
    });

    await ctx.db.insert('members', {
        userId,
        workspaceId,
        role: 'admin',
    })


    await ctx.db.insert('channels', {
        name: 'general',
        workspaceId
    })

    return workspaceId;


    }
})

export const get = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if(!userId){
            return []
        };
        const members = await ctx.db.query('members').withIndex('by_user_id', (q) => q.eq("userId", userId)).collect(); //find all members of workspace you are in 
        const workspaceIds = members.map((member) => member.workspaceId); //get the workspace ids
        const workspaces: any[] | PromiseLike<any[]> = [];
        for (const workspaceId of workspaceIds) {
            const workspace = await ctx.db.get(workspaceId);
            if(workspace) {

                workspaces.push(workspace);
            }
        }

        return workspaces;




    }
})



export const getById = query({
    args: {id: v.id('workspaces')},
    handler: async (ctx, args) => {


        const userId = await getAuthUserId(ctx);
        if(!userId){
            return null;
        }
   
        const member = await ctx.db.query('members').withIndex('by_workspaceId_and_userId', q => q.eq('workspaceId', args.id).eq('userId', userId)).unique()

        if(!member) return null; 

        return await ctx.db.get(args.id);
    }
})




const generateCode = () => {
    const code = Array.from({ length: 6 }, () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]).join('');
    return code;

}


export const update = mutation({
    args: {
        id: v.id('workspaces'),
        name: v.string()
    },
    async handler(ctx, args) {
        const userId = await getAuthUserId(ctx);

        if(!userId){
            throw new Error('Unauthorized');
        }
   
        const member = await ctx.db.query('members')
        .withIndex('by_workspaceId_and_userId', q => q.eq('workspaceId', args.id)
        .eq('userId', userId)).unique()

        if(!member || member.role !== 'admin') {
            throw new Error('Unauthorized');
        }; 

        await ctx.db.patch(args.id, {name: args.name});
        return args.id; //return the id of the updated workspace
    
        
    },
})
export const remove = mutation({
    args: {
        id: v.id('workspaces'),
    },
    async handler(ctx, args) {
        const userId = await getAuthUserId(ctx);

        if(!userId){
            throw new Error('Unauthorized');
        }
   
        const member = await ctx.db.query('members')
        .withIndex('by_workspaceId_and_userId', q => q.eq('workspaceId', args.id)
        .eq('userId', userId)).unique()

        if(!member || member.role !== 'admin') {
            throw new Error('Unauthorized');
        }; 

        const [members, channels, conversations, messages, reactions] = await Promise.all([
            ctx.db.query('members').withIndex('by_workspace_id', q => q.eq('workspaceId', args.id)).collect(),
            ctx.db.query('channels').withIndex('by_workspace_id', q => q.eq('workspaceId', args.id)).collect(),
            ctx.db.query('conversations').withIndex('by_workspace_id', q => q.eq('workspaceId', args.id)).collect(),
            ctx.db.query('messages').withIndex('by_workspace_id', q => q.eq('workspaceId', args.id)).collect(),
            ctx.db.query('reactions').withIndex('by_workspace_id', q => q.eq('workspaceId', args.id)).collect()           
        ]);
     
        for (const member of members) {
            await ctx.db.delete(member._id);
        }
        for (const channel of channels) {
            await ctx.db.delete(channel._id);
        }
        for (const conversation of conversations) {
            await ctx.db.delete(conversation._id);
        }
        for (const message of messages) {
            await ctx.db.delete(message._id);
        }
        for (const reaction of reactions) {
            await ctx.db.delete(reaction._id);
        }

        await ctx.db.delete(args.id)
        return args.id; 
    
        
    },
})



export const newJoinCode = mutation({
    args: {
        workspaceId: v.id('workspaces')
    },
    async handler(ctx, args) {
        const userId = await getAuthUserId(ctx);

        if(!userId){
            throw new Error('Unauthorized');
        }
   
        const member = await ctx.db.query('members')
        .withIndex('by_workspaceId_and_userId', q => q.eq('workspaceId', args.workspaceId)
        .eq('userId', userId)).unique()

        if(!member || member.role !== 'admin') {
            throw new Error('Unauthorized');
        }; 

        const joinCode = generateCode();
        await ctx.db.patch(args.workspaceId, {joinCode});
        return args.workspaceId;


        
    },
})


export const join = mutation({
    args: {
        joinCode: v.string(),
        workspaceId: v.id('workspaces')
    
    },
    async handler(ctx, args) {
        const userId = await getAuthUserId(ctx);

        if(!userId){
            throw new Error('Unauthorized');
        }
   
       const workspace = await ctx.db.get(args.workspaceId);
       if(!workspace){
        throw new Error('Workspace not found');
       }

       if(workspace.joinCode !== args.joinCode.toLowerCase()) {
        throw new Error('Invalid join code');
       
       }

       const existingMember = await ctx.db.query('members')
       .withIndex('by_workspaceId_and_userId', q => q.eq('workspaceId', args.workspaceId)
       .eq('userId', userId)).unique()
 
       if(existingMember) {
        throw new Error('You are already a member of this workspace');
       }

       await ctx.db.insert('members', {
        userId,
        workspaceId: args.workspaceId,
        role: 'member',
       });


       return workspace._id;

        
    },
})



export const getInfoById = query({
    args: {
        id: v.id('workspaces')
    },
    async handler(ctx, args) {
        const userId = await getAuthUserId(ctx);
        if(!userId){
            return null;
        };

        const member = await ctx.db.query('members')
        .withIndex('by_workspaceId_and_userId', q => q.eq('workspaceId', args.id)
        .eq('userId', userId)).unique()

        const workspace = await ctx.db.get(args.id);
        return {
            name: workspace?.name,
            isMember: !!member
        }
 


        
    },
})