import { motion } from "motion/react";

const ease = [0.19, 1, 0.22, 1] as const;

interface QuickRepliesProps {
  replies: { label: string; value: string }[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function QuickReplies({
  replies,
  onSelect,
  disabled,
}: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2 pl-2">
      {replies.map((reply, i) => (
        <motion.button
          key={reply.value}
          type="button"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease, delay: 0.1 + i * 0.06 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(reply.value)}
          disabled={disabled}
          className="cursor-pointer rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-600 transition-colors duration-150 hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-50"
        >
          {reply.label}
        </motion.button>
      ))}
    </div>
  );
}
