import Image from "next/image";

export function Logo({ size = 28 }: { size?: number }) {
  return <Image src="/icon-192.png" alt="Z Note" width={size} height={size} className="rounded-md dark:invert" />;
}
