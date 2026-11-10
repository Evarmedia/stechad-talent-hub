import { useEffect, useState } from "react";
import { Check, ChevronRight, Loader2, Search, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { chatService } from "@/services/chatService";
import { useChatContext } from "@/hooks/contexts/ChatContext";
import { roleName, userName, type ChatUser } from "@/types/chat";
import { cn } from "@/lib/utils";

export default function NewConversationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { createChat, onlineUsers } = useChatContext();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [group, setGroup] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<ChatUser[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setUsers([]);
      setError("");
      setGroup(false);
      setName("");
      setSelected([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const result = await chatService.users(search);
        if (!cancelled) {
          setUsers(result.users);
          setTotal(result.pagination.totalItems);
          setError("");
        }
      } catch (error) {
        if (!cancelled)
          setError(error.message || "Could not load team members");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, open]);

  const start = async (ids: string[], type = "direct") => {
    setCreating(true);
    setError("");
    try {
      await createChat(ids, type, type === "group" ? name.trim() : undefined);
      onOpenChange(false);
    } catch (error) {
      setError(error.message || "Could not start the conversation");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={creating ? undefined : onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] gap-5 overflow-y-auto rounded-2xl p-5 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl">Start a conversation</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Find someone on your team and keep work moving.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2" aria-label="Conversation type">
          <Button
            variant={group ? "outline" : "default"}
            size="sm"
            onClick={() => {
              setGroup(false);
              setSelected([]);
            }}
            disabled={creating}
            aria-pressed={!group}
          >
            Direct message
          </Button>
          <Button
            variant={group ? "default" : "outline"}
            size="sm"
            onClick={() => setGroup(true)}
            disabled={creating}
            aria-pressed={group}
          >
            <Users className="h-4 w-4" />
            Group
          </Button>
        </div>
        {group && (
          <div className="space-y-2">
            <label htmlFor="group-name" className="text-sm font-medium">
              Group name
            </label>
            <Input
              id="group-name"
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Project delivery team"
              disabled={creating}
            />
            {selected.length > 0 && (
              <p className="text-xs text-slate-500">
                {selected.map(userName).join(", ")}
              </p>
            )}
          </div>
        )}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            aria-label="Search team members"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name…"
            className="h-10 pl-9"
            disabled={creating}
            autoComplete="off"
          />
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        <div className="max-h-72 space-y-1 overflow-y-auto" aria-busy={loading}>
          {loading ? (
            <div
              role="status"
              className="flex justify-center gap-2 py-10 text-sm text-slate-500"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Finding team members…
            </div>
          ) : users.length ? (
            users.map((person) => {
              const isSelected = selected.some(
                (item) => item.user_id === person.user_id,
              );
              return (
                <button
                  key={person.user_id}
                  type="button"
                  disabled={creating}
                  aria-pressed={group ? isSelected : undefined}
                  onClick={() =>
                    group
                      ? setSelected((previous) =>
                          isSelected
                            ? previous.filter(
                                (item) => item.user_id !== person.user_id,
                              )
                            : [...previous, person],
                        )
                      : void start([person.user_id])
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border-transparent p-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50",
                    isSelected && "bg-primary-light",
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={person.avatar_url} alt="" />
                      <AvatarFallback className="bg-slate-100 text-sm font-medium text-slate-600">
                        {userName(person)
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {onlineUsers.some(
                      (item) => item.user_id === person.user_id,
                    ) && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {userName(person)}
                    </p>
                    <p className="text-xs capitalize text-slate-500">
                      {roleName(person)}
                    </p>
                  </div>
                  {isSelected ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </button>
              );
            })
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">
              {search
                ? "No team members match that name."
                : "No other team members are available yet."}
            </p>
          )}
        </div>
        {!loading && total > users.length && (
          <p className="text-xs text-slate-500">
            Showing {users.length} of {total} people. Search by name to narrow
            the list.
          </p>
        )}
        {group && (
          <Button
            onClick={() =>
              void start(
                selected.map((person) => person.user_id),
                "group",
              )
            }
            disabled={creating || !name.trim() || !selected.length}
          >
            {creating && <Loader2 className="h-4 w-4 animate-spin" />}Create
            group{selected.length ? ` · ${selected.length + 1} people` : ""}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
