import { atom, useAtom  } from 'jotai';

const creationWorkspaceModalState = atom(false);

export const useCreateWorkspaceModal = () => {
    return useAtom(creationWorkspaceModalState);
 
};