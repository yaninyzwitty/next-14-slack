import { atom, useAtom  } from 'jotai';

const createChannelModal = atom(false);

export const useCreateChannelModal = () => {
    return useAtom(createChannelModal);
 
};