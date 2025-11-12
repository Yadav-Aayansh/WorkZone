import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface AvatarGroupProps {
  users: User[];
  max?: number;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

export function AvatarGroup({
  users,
  max = 4,
  size = "md",
  onClick,
  className,
}: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  return (
    <div
      className={cn(
        "flex items-center -space-x-2",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {displayUsers.map((user, index) => (
        <Avatar
          key={user.id}
          className={cn(
            "border-2 border-background ring-1 ring-border",
            sizeClasses[size]
          )}
          style={{ zIndex: displayUsers.length - index }}
        >
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-2 border-background bg-muted ring-1 ring-border",
            sizeClasses[size]
          )}
          style={{ zIndex: 0 }}
        >
          <span className="text-xs font-medium text-muted-foreground">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
}
