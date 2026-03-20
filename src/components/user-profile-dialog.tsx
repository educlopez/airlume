import { UserProfile } from "@clerk/nextjs";
import { XIcon } from "lucide-react";

export function UserProfileDialog({
  open,
  onOpenChange,
  title = "Account",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-background/90 backdrop-blur-xs transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Dialog content */}
      <div className="relative z-50 flex w-auto flex-col items-center rounded-lg">
        {/* Close button */}
        <button
          aria-label="Close"
          className="absolute top-4 right-4 z-60 cursor-pointer rounded-full bg-background p-2 text-foreground opacity-90 shadow-custom hover:opacity-100 focus:outline-none"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          <XIcon size={20} />
        </button>
        {/* Optional title for accessibility */}
        <h2 className="sr-only">{title}</h2>
        <div className="flex w-full flex-col items-center p-6">
          <UserProfile />
        </div>
      </div>
    </div>
  );
}
