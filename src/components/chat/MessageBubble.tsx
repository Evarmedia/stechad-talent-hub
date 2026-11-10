import {
  Check,
  CheckCheck,
  Clock3,
  FileText,
  MoreHorizontal,
  Pencil,
  Reply,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { userName, type ChatMessage } from "@/types/chat";

export default function MessageBubble({
  message,
  own,
  group,
  onReply,
  onEdit,
  onDelete,
  onRetry,
}: {
  message: ChatMessage;
  own: boolean;
  group: boolean;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRetry: () => void;
}) {
  const read = Object.keys(message.read_by || {}).some(
    (id) => id !== message.sender_id,
  );
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div
      className={cn(
        "group flex items-end gap-1.5",
        own ? "justify-end" : "justify-start",
      )}
      data-message-id={message.messages_id}
    >
      <div
        className={cn(
          "min-w-0 max-w-[86%] sm:max-w-[76%] lg:max-w-[68%]",
          own && "order-2",
        )}
      >
        {group && !own && (
          <p className="mb-1 ml-1 text-xs font-semibold text-slate-500">
            {userName(message.sender)}
          </p>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            own
              ? "rounded-br-md bg-primary text-white"
              : "rounded-bl-md border border-slate-200/80 bg-white text-slate-800",
            message.delivery === "failed" && "ring-2 ring-red-300",
            message.is_deleted && "italic opacity-65",
          )}
        >
          {message.replyToMessage && (
            <div
              className={cn(
                "mb-2 border-l-2 py-1 pl-2.5 text-xs",
                own
                  ? "border-white/60 text-white/80"
                  : "border-primary/50 text-slate-500",
              )}
            >
              <p className="mb-0.5 font-semibold">
                {userName(message.replyToMessage.sender)}
              </p>
              <p className="line-clamp-2 whitespace-pre-wrap [overflow-wrap:anywhere]">
                {message.replyToMessage.is_deleted
                  ? "This message was deleted"
                  : message.replyToMessage.content}
              </p>
            </div>
          )}
          <p className="whitespace-pre-wrap text-sm leading-relaxed [overflow-wrap:anywhere]">
            {message.content}
          </p>
          {!message.is_deleted &&
            message.attachments?.map((attachment, index) =>
              attachment.url && /^https?:\/\//i.test(attachment.url) ? (
                <a
                  key={index}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2 break-all text-xs underline underline-offset-2"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  {attachment.name || "Open attachment"}
                </a>
              ) : null,
            )}
          <div
            className={cn(
              "mt-1.5 flex items-center justify-end gap-1.5 text-[10px]",
              own ? "text-white/75" : "text-slate-500",
            )}
          >
            {message.is_edited && !message.is_deleted && <span>edited</span>}
            <time
              dateTime={message.timestamp}
              title={new Date(message.timestamp).toLocaleString()}
            >
              {time}
            </time>
            {own && !message.is_deleted && (
              <span
                title={
                  message.delivery === "sending"
                    ? "Sending"
                    : message.delivery === "failed"
                      ? "Not sent"
                      : read
                        ? "Read"
                        : "Sent"
                }
                aria-label={
                  message.delivery === "sending"
                    ? "Sending"
                    : message.delivery === "failed"
                      ? "Not sent"
                      : read
                        ? "Read"
                        : "Sent"
                }
              >
                {message.delivery === "sending" ? (
                  <Clock3 className="h-3 w-3" />
                ) : read ? (
                  <CheckCheck className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </span>
            )}
          </div>
        </div>
        {message.delivery === "failed" && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-1 flex min-h-8 items-center gap-1.5 border-0 bg-transparent px-1 text-xs font-medium text-red-700 hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            Not sent. Retry
          </button>
        )}
      </div>
      {!message.is_deleted && !message.delivery && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Message actions"
              className={cn(
                "mb-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-slate-500 transition-colors hover:bg-slate-200/70 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 data-[state=open]:opacity-100",
                own && "order-1",
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={own ? "end" : "start"}>
            <DropdownMenuItem onSelect={onReply}>
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </DropdownMenuItem>
            {own && (
              <>
                <DropdownMenuItem onSelect={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit message
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={onDelete}
                  className="text-red-700 focus:text-red-800"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete message
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
