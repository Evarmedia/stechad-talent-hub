import ChatInterface from "@/components/ChatInterface";

export default function MessagesPage() {
  return (
    <div className="h-[calc(100dvh-56px)] min-h-0 bg-slate-50/60 p-3 sm:p-5 lg:p-6">
      <ChatInterface />
    </div>
  );
}
