import { createContext, useContext } from "react";
export const ChatSoundContext = createContext({
  soundEnabled: true,
  toggleSound: () => {},
});
export const useChatSound = () => useContext(ChatSoundContext);
