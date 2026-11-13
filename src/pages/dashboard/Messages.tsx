import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useChatContext } from "@/hooks/contexts/ChatContext";
import ChatInterface from "@/components/ChatInterface";

export default function MessagesPage() {
  const [params] = useSearchParams();
  const { openConversation } = useChatContext();
  const [error, setError] = useState("");
  const id = params.get("chat");
  useEffect(() => {
    let cancelled = false;
    setError("");
    if (id)
      void openConversation(id).catch((error) => {
        if (!cancelled) setError(error.message || "Conversation unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [id, openConversation]);
  return (
    <div className="h-[calc(100dvh-56px)] min-h-0 bg-slate-50/60 p-3 sm:p-5 lg:p-6">
      {error && (
        <p role="alert" className="mb-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <ChatInterface />
    </div>
  );
}
