"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ToolTabs() {
  const pathname = usePathname();

  return (
    <Tabs value={pathname}>
      <TabsList className="h-9 p-1">
        <TabsTrigger
          value="/image-analysis"
          nativeButton={false}
          className="px-3"
          render={<Link href="/image-analysis" />}
        >
          Image analysis
        </TabsTrigger>
        <TabsTrigger
          value="/ingredient-recognition"
          nativeButton={false}
          className="px-3"
          render={<Link href="/ingredient-recognition" />}
        >
          Ingredient recognition
        </TabsTrigger>
        <TabsTrigger
          value="/image-creator"
          nativeButton={false}
          className="px-3"
          render={<Link href="/image-creator" />}
        >
          Image creator
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
