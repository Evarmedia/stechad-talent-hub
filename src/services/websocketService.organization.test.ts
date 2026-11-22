import axios from "axios";
import { waitFor } from "@testing-library/react";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import api from "./apiService";
import websocket from "./websocketService";
type SocketAuth = { token: string; organization_id: string };
type Options = { auth: (callback: (value: SocketAuth) => void) => void };
type Incoming = (event: string, payload: Record<string, unknown>) => void;
type FakeSocket = { options: Options; events: Record<string, (value?: unknown) => void>; incoming: Incoming; onAny: (callback: Incoming) => void; on: (event: string, callback: (value?: unknown) => void) => void; offAny: ReturnType<typeof vi.fn>; removeAllListeners: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>; connect: ReturnType<typeof vi.fn>; emit: ReturnType<typeof vi.fn>; connected: boolean };
const fake = vi.hoisted(() => ({ sockets: [] as FakeSocket[] }));
vi.mock("socket.io-client", () => ({ io: (_origin: string, options: Options) => {
  const socket: FakeSocket = { options, events: {}, incoming: () => {}, onAny(callback) { this.incoming = callback; }, on(event, callback) { this.events[event] = callback; }, offAny: vi.fn(), removeAllListeners: vi.fn(), disconnect: vi.fn(), connect: vi.fn(), emit: vi.fn(), connected: true };
  fake.sockets.push(socket); return socket;
} }));
beforeEach(() => { sessionStorage.clear(); fake.sockets.length = 0; });
afterEach(() => { websocket.disconnect(); api.setOrganization(null); });
it("binds sockets to an organization and ignores cross-organization and disconnected-socket events", () => {
  api.setToken("identity"); api.setOrganization("a"); websocket.connect();
  const old = fake.sockets[0]; let auth: SocketAuth; old.options.auth((value) => { auth = value; });
  expect(auth).toEqual({ token: "identity", organization_id: "a" });
  const receive = vi.fn(); const off = websocket.on("notification", receive);
  old.incoming("notification", { organization_id: "b", title: "B payroll" });
  old.incoming("notification", { title: "unscoped" });
  expect(receive).not.toHaveBeenCalled();
  old.incoming("notification", { organization_id: "a", title: "A payroll" });
  expect(receive).toHaveBeenCalledTimes(1);
  api.setOrganization("b"); websocket.connect();
  expect(old.disconnect).toHaveBeenCalled(); expect(old.removeAllListeners).toHaveBeenCalled();
  old.incoming("notification", { organization_id: "b", title: "old transport" });
  expect(receive).toHaveBeenCalledTimes(1);
  fake.sockets[1].incoming("notification", { organization_id: "b", title: "B payroll" });
  expect(receive).toHaveBeenCalledTimes(2); off();
});

it("reconnects a server-disconnected socket with refreshed identity and its explicit organization", async () => {
  api.setToken("expired-handshake"); api.setOrganization("b"); websocket.connect();
  const socket = fake.sockets[0];
  const unavailable = vi.fn(); window.addEventListener("stechad:organization-unavailable", unavailable);
  api.api.defaults.adapter = async config => {
    expect(config.headers["X-Organization-Id"]).toBe("b");
    return { config, status: 200, statusText: "OK", headers: {}, data: { data: { active_organization_id: "b", organizations: [{organization_id:"a"},{organization_id:"b"}] } } };
  };
  localStorage.setItem("stechad_token", "current-http-access");
  socket.events.disconnect("io server disconnect");
  await waitFor(() => expect(socket.connect).toHaveBeenCalled());
  let auth: SocketAuth; socket.options.auth(value => { auth = value; });
  expect(auth).toEqual({token:"current-http-access",organization_id:"b"});
  expect(api.getOrganization()).toBe("b"); expect(unavailable).not.toHaveBeenCalled();
  window.removeEventListener("stechad:organization-unavailable", unavailable);
});
it("requests organization selection when socket revalidation confirms membership loss", async () => {
  api.setToken("identity"); api.setOrganization("b"); websocket.connect();
  const socket = fake.sockets[0];
  const unavailable = vi.fn(); window.addEventListener("stechad:organization-unavailable", unavailable);
  api.api.defaults.adapter = async config => ({config,status:200,statusText:"OK",headers:{},data:{data:{active_organization_id:null,organizations:[{organization_id:"a"}]}}});
  socket.events.disconnect("io server disconnect");
  await waitFor(() => expect(unavailable).toHaveBeenCalled());
  expect(socket.connect).not.toHaveBeenCalled(); expect(api.getToken()).toBe("identity");
  window.removeEventListener("stechad:organization-unavailable", unavailable);
});

it("does not reconnect or request organization selection after the global session is revoked", async () => {
  window.history.replaceState({}, '', '/platform-admin.html');
  api.setToken("revoked-access"); api.setRefreshToken("revoked-refresh"); api.setOrganization("b"); websocket.connect();
  const socket = fake.sockets[0];
  const unavailable = vi.fn(); window.addEventListener("stechad:organization-unavailable", unavailable);
  const adapter = axios.defaults.adapter;
  api.api.defaults.adapter = async config => { throw {config,response:{status:401,data:{code:'SESSION_INVALID'}}}; };
  axios.defaults.adapter = async config => { throw {config,response:{status:401,data:{code:'SESSION_INVALID'}}}; };
  try {
    socket.events.disconnect("io server disconnect");
    await waitFor(() => expect(api.getToken()).toBeNull());
    expect(socket.connect).not.toHaveBeenCalled(); expect(unavailable).not.toHaveBeenCalled();
  } finally { axios.defaults.adapter = adapter; window.removeEventListener("stechad:organization-unavailable", unavailable); }
});
