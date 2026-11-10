import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Camera,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { chatService } from "@/services/chatService";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useChatContext } from "@/hooks/contexts/ChatContext";
import {
  conversationName,
  roleName,
  userName,
  type ChatUser,
  type Conversation,
} from "@/types/chat";

const PersonAvatar = ({
  person,
  src,
  group = false,
}: {
  person?: ChatUser;
  src?: string;
  group?: boolean;
}) => (
  <Avatar className="h-12 w-12 shrink-0">
    <AvatarImage src={src || person?.avatar_url} alt="" />
    <AvatarFallback className="bg-primary/10 font-semibold text-primary">
      {group ? (
        <Users className="h-5 w-5" />
      ) : (
        userName(person)
          .split(" ")
          .slice(0, 2)
          .map((word) => word[0])
          .join("")
      )}
    </AvatarFallback>
  </Avatar>
);

export default function ChatDetailsSheet({
  chat,
  open,
  onOpenChange,
}: {
  chat: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const chatRef = useRef(chat);
  chatRef.current = chat;
  const chatId = chat?.chats_id;
  const { user } = useAuthContext();
  const { refreshChats } = useChatContext();
  const [detail, setDetail] = useState(chat);
  const [tab, setTab] = useState("members");
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ChatUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [posting, setPosting] = useState("all_members");
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<ChatUser[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [finding, setFinding] = useState(false);
  const [removing, setRemoving] = useState<ChatUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const group = detail?.chat_type !== "direct";
  useEffect(() => {
    if (chat) setDetail(chat);
  }, [chat]);
  useEffect(() => {
    const initial = chatRef.current;
    if (!open || !initial) return;
    setTab("members");
    setProfileId(
      initial.chat_type === "direct"
        ? initial.participants.find((id) => id !== user?.user_id)
        : null,
    );
    setName(initial.chat_name || "");
    setDescription(initial.description || "");
    setPosting(initial.posting_policy || "all_members");
    setAdding(false);
    setSelected([]);
    setSearch("");
    setRemoving(null);
    setError("");
    setProfile(null);
  }, [open, chatId, user?.user_id]);
  useEffect(() => {
    if (!open || !profileId || !chatId) return;
    let cancelled = false;
    setProfileLoading(true);
    setProfile(null);
    setError("");
    chatService
      .profile(chatId, profileId)
      .then((result) => {
        if (!cancelled) setProfile(result);
      })
      .catch((error) => {
        if (!cancelled) setError(error.message || "Could not load profile");
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, profileId, chatId]);
  useEffect(() => {
    if (profileId && !chat?.participants.includes(profileId)) {
      setProfileId(null);
      setProfile(null);
    }
  }, [chat?.participants, profileId]);
  useEffect(() => {
    if (!open || !adding || !detail?.can_manage) return;
    let cancelled = false;
    setFinding(true);
    const timer = window.setTimeout(() => {
      chatService
        .users(search, "group", detail.chats_id)
        .then((result) => {
          if (!cancelled)
            setCandidates(
              result.users.filter(
                (person) => !detail.participants.includes(person.user_id),
              ),
            );
        })
        .catch((error) => {
          if (!cancelled) setError(error.message || "Could not find members");
        })
        .finally(() => {
          if (!cancelled) setFinding(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    open,
    adding,
    search,
    detail?.chats_id,
    detail?.participants,
    detail?.can_manage,
  ]);
  const run = async (
    operation: () => Promise<Conversation>,
    success?: () => void,
  ) => {
    setSaving(true);
    setError("");
    try {
      const result = await operation();
      setDetail(result);
      success?.();
      await refreshChats();
    } catch (error) {
      setError(error.message || "Could not update the group");
    } finally {
      setSaving(false);
    }
  };
  const image = (file?: File) => {
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError("Choose a JPEG, PNG, or WebP image up to 2 MB.");
      return;
    }
    void run(() => chatService.image(detail.chats_id, file));
  };
  if (!detail) return null;
  return (
    <Sheet open={open} onOpenChange={saving ? undefined : onOpenChange}>
      <SheetContent className="flex h-[100dvh] w-full max-w-full flex-col gap-0 overflow-hidden p-0 sm:w-[420px] sm:max-w-[420px]">
        <SheetHeader className="shrink-0 border-b border-slate-200 px-5 pb-5 pt-7 text-left">
          <SheetTitle className="pr-8 text-lg">
            {profileId ? "Contact profile" : "Group details"}
          </SheetTitle>
          <SheetDescription>
            {profileId
              ? "Get to know your teammate."
              : "The people and preferences for this conversation."}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-5">
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}
          {profileId ? (
            <>
              {group && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-5 -ml-2"
                  onClick={() => {
                    setProfileId(null);
                    setError("");
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to members
                </Button>
              )}
              {profileLoading ? (
                <p
                  role="status"
                  className="flex items-center gap-2 py-10 text-sm text-slate-500"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading profile…
                </p>
              ) : (
                profile && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <PersonAvatar person={profile} />
                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-semibold text-slate-900">
                          {userName(profile)}
                        </h3>
                        <p className="mt-1 text-sm capitalize text-primary">
                          {roleName(profile)}
                        </p>
                      </div>
                    </div>
                    {profile.job_title && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                          Job title
                        </p>
                        <p className="mt-1 break-words text-sm text-slate-800">
                          {profile.job_title}
                        </p>
                      </div>
                    )}
                    {(profile.department || profile.company) && (
                      <div className="flex gap-3 rounded-xl bg-slate-50 p-4">
                        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <div className="min-w-0 text-sm">
                          <p className="break-words font-medium text-slate-800">
                            {profile.department || profile.company}
                          </p>
                          {profile.department && profile.company && (
                            <p className="mt-1 break-words text-slate-500">
                              {profile.company}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {(profile.city || profile.country) && (
                      <div className="flex items-start gap-3 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                        <p className="break-words">
                          {[profile.city, profile.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}
            </>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-3">
                <PersonAvatar src={detail.avatar_url} group />
                <div className="min-w-0">
                  <h3 className="break-words font-semibold text-slate-900">
                    {conversationName(detail, user?.user_id)}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {detail.participants.length} of 100 members
                  </p>
                </div>
              </div>
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-5 grid w-full grid-cols-2">
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="members" className="space-y-4">
                  {detail.description && (
                    <p className="whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                      {detail.description}
                    </p>
                  )}
                  {detail.can_manage && (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={saving || detail.participants.length >= 100}
                      onClick={() => {
                        setAdding(!adding);
                        setError("");
                      }}
                    >
                      <UserPlus className="h-4 w-4" />
                      {adding ? "Close member picker" : "Add members"}
                    </Button>
                  )}
                  {adding && detail.can_manage && (
                    <div className="space-y-3 rounded-xl border border-slate-200 p-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          aria-label="Find members to add"
                          placeholder="Search eligible people…"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="max-h-52 space-y-1 overflow-y-auto">
                        {finding ? (
                          <p
                            role="status"
                            className="py-4 text-center text-xs text-slate-500"
                          >
                            Finding people…
                          </p>
                        ) : candidates.length ? (
                          candidates.map((person) => (
                            <label
                              key={person.user_id}
                              className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-slate-50"
                            >
                              <input
                                type="checkbox"
                                checked={selected.includes(person.user_id)}
                                disabled={
                                  saving ||
                                  (!selected.includes(person.user_id) &&
                                    detail.participants.length +
                                      selected.length >=
                                      100)
                                }
                                onChange={() =>
                                  setSelected((previous) =>
                                    previous.includes(person.user_id)
                                      ? previous.filter(
                                          (id) => id !== person.user_id,
                                        )
                                      : [...previous, person.user_id],
                                  )
                                }
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium">
                                  {userName(person)}
                                </span>
                                <span className="text-xs capitalize text-slate-500">
                                  {roleName(person)}
                                </span>
                              </span>
                            </label>
                          ))
                        ) : (
                          <p className="py-4 text-center text-xs text-slate-500">
                            No eligible people found. Try another name.
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Search by name to find more people. Added members can
                        read this group’s existing history.
                      </p>
                      <Button
                        className="w-full"
                        size="sm"
                        disabled={saving || !selected.length}
                        onClick={() =>
                          void run(
                            () =>
                              chatService.addMembers(detail.chats_id, selected),
                            () => {
                              setAdding(false);
                              setSelected([]);
                            },
                          )
                        }
                      >
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Add {selected.length || ""} member
                        {selected.length === 1 ? "" : "s"}
                      </Button>
                    </div>
                  )}
                  <ul className="space-y-1">
                    {detail.participant_details.map((person) => (
                      <li
                        key={person.user_id}
                        className="flex items-center gap-1 rounded-xl hover:bg-slate-50"
                      >
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          onClick={() => setProfileId(person.user_id)}
                        >
                          <PersonAvatar person={person} />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-800">
                              {userName(person)}
                              {person.user_id === user?.user_id ? " (you)" : ""}
                            </span>
                            <span className="mt-0.5 block text-xs capitalize text-slate-500">
                              {roleName(person)}
                              {person.user_id === detail.created_by
                                ? " · Creator"
                                : ""}
                            </span>
                          </span>
                        </button>
                        {detail.can_manage &&
                          person.user_id !== detail.created_by && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove ${userName(person)}`}
                              title="Remove member"
                              disabled={saving}
                              onClick={() => setRemoving(person)}
                              className="h-9 w-9 shrink-0 text-slate-400 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="settings" className="space-y-5">
                  {!detail.can_manage ? (
                    <div className="space-y-4">
                      <p className="flex items-start gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                        Only the creator, while an admin or PM, can change this
                        group.
                      </p>
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">Who can post: </span>
                        {detail.posting_policy === "creator_only"
                          ? "Creator only"
                          : "Everyone"}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Group image</p>
                        <div className="flex flex-wrap gap-2">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium focus-within:ring-2 focus-within:ring-primary">
                            <Camera className="h-4 w-4" />
                            Upload image
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              className="sr-only"
                              disabled={saving}
                              onChange={(event) => {
                                image(event.target.files?.[0]);
                                event.target.value = "";
                              }}
                            />
                          </label>
                          {detail.avatar_url && (
                            <Button
                              variant="ghost"
                              disabled={saving}
                              onClick={() =>
                                void run(() =>
                                  chatService.removeImage(detail.chats_id),
                                )
                              }
                            >
                              Remove image
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          JPEG, PNG, or WebP · Up to 2 MB
                        </p>
                      </div>
                      <form
                        className="space-y-5"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void run(() =>
                            chatService.settings(detail.chats_id, {
                              chat_name: name,
                              description,
                              posting_policy: posting,
                            }),
                          );
                        }}
                      >
                        <div className="space-y-2">
                          <label
                            htmlFor="group-settings-name"
                            className="text-sm font-medium"
                          >
                            Group name
                          </label>
                          <Input
                            id="group-settings-name"
                            value={name}
                            maxLength={100}
                            required
                            disabled={saving}
                            onChange={(event) => setName(event.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="group-description"
                            className="text-sm font-medium"
                          >
                            Description
                          </label>
                          <Textarea
                            id="group-description"
                            value={description}
                            maxLength={1000}
                            disabled={saving}
                            onChange={(event) =>
                              setDescription(event.target.value)
                            }
                            className="min-h-28"
                            placeholder="What is this group for?"
                          />
                          <p className="text-right text-xs text-slate-400">
                            {description.length}/1,000
                          </p>
                        </div>
                        <fieldset className="space-y-3">
                          <legend className="mb-3 text-sm font-medium">
                            Who can post?
                          </legend>
                          {[
                            [
                              "all_members",
                              "Everyone",
                              "All current members can send messages.",
                            ],
                            [
                              "creator_only",
                              "Creator only",
                              "Keep this group for announcements.",
                            ],
                          ].map(([value, title, hint]) => (
                            <label
                              key={value}
                              className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3"
                            >
                              <input
                                type="radio"
                                name="posting-policy"
                                value={value}
                                checked={posting === value}
                                disabled={saving}
                                onChange={() => setPosting(value)}
                                className="mt-1"
                              />
                              <span>
                                <span className="block text-sm font-medium">
                                  {title}
                                </span>
                                <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                                  {hint}
                                </span>
                              </span>
                            </label>
                          ))}
                        </fieldset>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={saving || !name.trim()}
                        >
                          {saving && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          Save group settings
                        </Button>
                      </form>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
        <AlertDialog
          open={!!removing}
          onOpenChange={(open) => {
            if (!open && !saving) setRemoving(null);
          }}
        >
          <AlertDialogContent className="w-[calc(100%-2rem)] rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove {userName(removing)}?</AlertDialogTitle>
              <AlertDialogDescription>
                They will immediately lose access to this group and stop
                receiving its messages. You can add them again later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={saving}
                onClick={() =>
                  void run(
                    () =>
                      chatService.removeMember(
                        detail.chats_id,
                        removing.user_id,
                      ),
                    () => setRemoving(null),
                  )
                }
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}Remove
                member
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}
