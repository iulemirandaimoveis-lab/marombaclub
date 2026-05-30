import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoVariant = "client" | "admin" | "driver" | "compact";

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
}

export function BrandLogo({ variant = "client", className }: BrandLogoProps) {
  if (variant === "compact") {
    return (
      <Image
        src="/logo-mb.png"
        alt="MB"
        width={32}
        height={32}
        className={cn("w-7 h-7 object-contain", className)}
      />
    );
  }

  if (variant === "driver") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Image
          src="/logo.png"
          alt="Maromba Club"
          width={600}
          height={404}
          className="h-8 w-auto object-contain"
          priority
        />
        <span className="text-[10px] text-muted font-medium leading-none">Entregador</span>
      </div>
    );
  }

  const sizeClass = variant === "client" ? "h-[60px]" : "h-8";
  const imgWidth = 600;
  const imgHeight = 404;

  return (
    <Image
      src="/logo.png"
      alt="Maromba Club"
      width={imgWidth}
      height={imgHeight}
      className={cn(`${sizeClass} w-auto object-contain`, className)}
      priority
    />
  );
}
