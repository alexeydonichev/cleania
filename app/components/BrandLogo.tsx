import Image from "next/image";
import { brandHeaderLogo, brandName } from "@/lib/brand";

export default function BrandLogo({ priority = false, decorative = false, className = "" }: { priority?: boolean; decorative?: boolean; className?: string }) {
  return <Image {...brandHeaderLogo} alt={decorative ? "" : brandName} priority={priority} unoptimized className={`brand-logo ${className}`} />;
}
