"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  progress,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  progress?: number;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value || "-"}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {progress !== undefined && (
          <Progress value={progress || 0} className="h-2 mt-2" />
        )}
      </CardContent>
    </Card>
  );
}
