import { beforeEach, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ChatAlerts from "./ChatAlerts";
const mocks = vi.hoisted(() => ({ user: { user_id: "user", notification_sound_enabled: false }, updateUser: vi.fn(), handlers: new Map<string, (payload: unknown) => Promise<void>>(), claim: vi.fn(), toast: vi.fn(), oscillator: vi.fn(), markAsRead: vi.fn() }));
vi.mock("@/hooks/useAuthContext", () => ({ useAuthContext: () => ({ user: mocks.user, updateUser: mocks.updateUser }) }));
vi.mock("@/hooks/contexts/ChatContext", () => ({ useChatContext: () => ({ activeChatId: null, markAsRead: mocks.markAsRead }) }));
vi.mock("@/services/websocketService", () => ({ default: { on: (event: string, handler: (payload: unknown) => Promise<void>) => { mocks.handlers.set(event, handler); return () => mocks.handlers.delete(event); } } }));
vi.mock("@/services/chatActivity", () => ({ claimMessageAlert: mocks.claim, hasFocusedChat: () => false, isChatFocused: () => false, publishChatView: () => {} }));
vi.mock("sonner", () => ({ toast: Object.assign(mocks.toast, { dismiss: vi.fn(), error: vi.fn() }) }));
beforeEach(() => {
  vi.clearAllMocks(); mocks.handlers.clear(); mocks.user = { user_id: "user", notification_sound_enabled: false }; mocks.claim.mockResolvedValue(true);
  const parameter = { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
  class FakeAudioContext { state = "running"; currentTime = 0; destination = {}; createOscillator() { mocks.oscillator(); return { frequency: parameter, connect() {}, start() {}, stop() {}, type: "sine" }; } createGain() { return { gain: parameter, connect() {} }; } resume() { return Promise.resolve(); } close() { return Promise.resolve(); } }
  vi.stubGlobal("AudioContext", FakeAudioContext);
});
const show = () => render(<MemoryRouter><ChatAlerts><div>Dashboard</div></ChatAlerts></MemoryRouter>);
const notify = () => mocks.handlers.get("notification_created")!({ notification: { notifications_id: "notification", user_id: "user", title: "Company update", message: "An announcement", metadata: {}, is_read: false } });
it("shows system notifications without requiring chat metadata and honors mute", async () => {
  show(); fireEvent.pointerDown(window); await act(async () => { await notify(); });
  expect(mocks.toast).toHaveBeenCalledWith("Company update", expect.objectContaining({ description: "An announcement" })); expect(mocks.oscillator).not.toHaveBeenCalled();
});
it("plays the enabled sound once and ignores replayed notification IDs", async () => {
  mocks.user.notification_sound_enabled = true; mocks.claim.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
  show(); fireEvent.pointerDown(window); await act(async () => { await notify(); await notify(); });
  expect(mocks.toast).toHaveBeenCalledOnce(); expect(mocks.oscillator).toHaveBeenCalledOnce();
});
