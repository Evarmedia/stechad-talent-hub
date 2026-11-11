import { createContext, useContext } from "react";
export const ChatSoundContext = createContext({
  soundEnabled: true,
  toggleSound: () => {},
  popupEnabled: true,
  togglePopup: () => {},
});
export const useChatSound = () => useContext(ChatSoundContext);
