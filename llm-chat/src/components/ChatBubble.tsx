import { motion } from "motion/react";

const ease = [0.19, 1, 0.22, 1] as const;

interface ChatBubbleProps {
  role: "user" | "ai";
  children: React.ReactNode;
}

export default function ChatBubble({ role, children }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease }}
      style={{
        transformOrigin: isUser ? "bottom right" : "bottom left",
      }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
          isUser
            ? "rounded-br-md bg-brand-600 text-white"
            : "rounded-bl-md bg-white text-slate-700 shadow-sm border border-slate-100"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}
