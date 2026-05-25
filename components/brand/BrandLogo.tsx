import Image from "next/image";
import { Truck } from "lucide-react";
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
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Truck className="w-4 h-4 text-background" />
        </div>
        <div>
          <p className="text-sm font-black text-foreground leading-none">
            MAROMBA<span className="text-primary">CLUB</span>
          </p>
          <p className="text-[10px] text-muted leading-none mt-0.5">Entregador</p>
        </div>
      </div>
    );
  }

  const sizeClass = variant === "client" ? "h-9" : "h-7";
  const imgWidth = variant === "client" ? 300 : 160;
  const imgHeight = variant === "client" ? 88 : 48;

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
