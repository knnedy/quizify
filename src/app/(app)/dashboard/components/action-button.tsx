"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ActionButton({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="block">
      <Button
        variant="outline"
        className="w-full hover:bg-primary/5 transition-colors">
        <Icon className="mr-2 h-5 w-5" />
        {children}
      </Button>
    </Link>
  );
}
