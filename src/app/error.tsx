"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  Home,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    reset();
    setIsRetrying(false);
  };

  const goDashboard = () => {
    router.push("/dashboard");
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Main Error Card */}
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">
              Oops! Something went wrong
            </CardTitle>
            <CardDescription className="text-base">
              Don&apos;t worry, this happens sometimes. Let&apos;s get you back
              on track.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Show the actual error */}
            <Alert className="border-destructive/20 bg-destructive/5">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-sm">
                {error.message || "An unexpected error occurred"}
              </AlertDescription>
            </Alert>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full h-12"
                size="lg">
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Trying again...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Try Again
                  </>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={goBack} className="h-10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
                <Button
                  variant="outline"
                  onClick={goDashboard}
                  className="h-10">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>
            </div>

            {/* What can you do section */}
            <Collapsible open={showHelp} onOpenChange={setShowHelp}>
              <CollapsibleTrigger>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto">
                  <div className="flex items-center">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>What can I do?</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      showHelp ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-3 mt-2">
                <div className="rounded-md bg-muted/50 p-4 space-y-3 text-sm">
                  <div>
                    <p className="font-medium mb-1">🔄 Try refreshing</p>
                    <p className="text-muted-foreground">
                      Sometimes a simple refresh fixes the issue
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1">⏰ Wait a moment</p>
                    <p className="text-muted-foreground">
                      The issue might resolve itself in a few minutes
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1">🌐 Check your internet</p>
                    <p className="text-muted-foreground">
                      Make sure you have a stable connection
                    </p>
                  </div>

                  <div>
                    <p className="font-medium mb-1">
                      🔄 Clear your browser cache
                    </p>
                    <p className="text-muted-foreground">
                      Old data might be causing conflicts
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
