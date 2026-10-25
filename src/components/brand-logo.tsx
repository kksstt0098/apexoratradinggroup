import logo from "@/assets/vw-logo.png.asset.json";

export function BrandLogo({ className }: { className?: string }) {
  return <img src={logo.url} alt="VW Markets" width={938} height={487} className={`object-contain ${className ?? ""}`} />;
}