"use client";

import { useRef, useState, ChangeEvent, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Instagram,
  Linkedin,
  Github,
  Youtube,
  Facebook,
  Globe,
  UserCircle,
  Mail,
  Link as LinkIcon,
  Loader2,
  Camera,
  User as UserIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RiTwitterXLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { tryCatch } from "@/lib/try-catch";
import { updateUserProfile } from "@/server/actions/user/update";
import { toast } from "sonner";
import { User } from "@/server/db/schema";

const socialPlatforms = [
  {
    value: "x",
    label: "X (Twitter)",
    icon: RiTwitterXLine,
    placeholder: "https://x.com/username",
  },
  {
    value: "instagram",
    label: "Instagram",
    icon: Instagram,
    placeholder: "https://instagram.com/username",
  },
  {
    value: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    placeholder: "https://linkedin.com/in/username",
  },
  {
    value: "github",
    label: "GitHub",
    icon: Github,
    placeholder: "https://github.com/username",
  },
  {
    value: "youtube",
    label: "YouTube",
    icon: Youtube,
    placeholder: "https://youtube.com/@username",
  },
  {
    value: "tiktok",
    label: "TikTok",
    icon: () => (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
    placeholder: "https://tiktok.com/@username",
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: Facebook,
    placeholder: "https://facebook.com/username",
  },
  {
    value: "website",
    label: "Website",
    icon: Globe,
    placeholder: "https://yourwebsite.com",
  },
];

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
  email: z
    .string()
    .min(1, { message: "This field is required" })
    .email("This is not a valid email"),
  socialLinks: z.array(
    z.object({
      platform: z.string().min(1, "Please select a platform"),
      url: z.string().url("Please enter a valid URL"),
    }),
  ),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileSettingsProps {
  user: User;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [profileImage, setProfileImage] = useState<string>(
    user.image || "/api/placeholder/200/200",
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = (): void => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;

    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>): void => {
        if (e.target && typeof e.target.result === "string") {
          setProfileImage(e.target.result);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: user.email,
      name: user.name,
      socialLinks: user.socialLinks || [], // Initialize with existing social links or empty array
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  // Watch current social links for real-time updates in the profile card
  const currentSocialLinks = form.watch("socialLinks");

  const addSocialLink = () => {
    append({ platform: "", url: "" });
  };

  const removeSocialLink = (index: number) => {
    remove(index);
  };

  const getAvailablePlatforms = (currentIndex: number) => {
    const selectedPlatforms = form
      .getValues("socialLinks")
      .map((link, index) => (index !== currentIndex ? link.platform : null))
      .filter(Boolean);

    return socialPlatforms.filter(
      (platform) => !selectedPlatforms.includes(platform.value),
    );
  };

  const getPlatformIcon = (platformValue: string) => {
    const platform = socialPlatforms.find((p) => p.value === platformValue);
    if (!platform) return LinkIcon;

    const IconComponent = platform.icon;
    return IconComponent;
  };

  const getPlatformPlaceholder = (platformValue: string) => {
    const platform = socialPlatforms.find((p) => p.value === platformValue);
    return platform?.placeholder || "Enter URL";
  };

  // Helper function to get platform data
  const getSocialPlatformData = (platform: string) => {
    return socialPlatforms.find((p) => p.value === platform);
  };

  // Helper function to open social link
  const openSocialLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  function onSubmit(data: ProfileFormValues) {
    startTransition(async () => {
      const { data: updatedUser, error: userError } = await tryCatch(
        updateUserProfile(user.id, data),
      );

      if (userError) {
        toast.error(userError.message);
        return;
      }

      if (updatedUser) {
        form.reset();
        toast.success("Profile updated successfully!");
        router.refresh();
      }
    });
  }
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-4">
          <Card className="w-full max-w-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background shadow">
                    <AvatarImage src={profileImage} alt="Profile picture" />
                    <AvatarFallback className="bg-primary-foreground">
                      <UserIcon className="h-12 w-12 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -right-2 -bottom-2 rounded-full h-8 w-8"
                    variant="secondary"
                    onClick={handleImageClick}>
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                    aria-label="Upload profile picture"
                  />
                </div>

                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                <Badge variant="outline" className="px-3 py-1">
                  Premium Member
                </Badge>

                {/* Dynamic Social Links Display - Show existing links + real-time form updates */}
                {((user.socialLinks && user.socialLinks.length > 0) ||
                  (currentSocialLinks && currentSocialLinks.length > 0)) && (
                  <>
                    <Separator className="w-full" />
                    <div className="w-full space-y-3">
                      <div className="text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                          Social Links
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {/* Show existing links if form is pristine, otherwise show form values */}
                        {(form.formState.isDirty
                          ? currentSocialLinks
                          : (user.socialLinks ?? [])
                        )
                          .filter((link) => link.platform && link.url)
                          .map((link, index) => {
                            const IconComponent = getPlatformIcon(
                              link.platform,
                            );
                            const platformData = getSocialPlatformData(
                              link.platform,
                            );

                            return (
                              <Button
                                key={`${link.platform}-${index}`}
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => openSocialLink(link.url)}
                                title={`Visit ${
                                  platformData?.label || link.platform
                                }`}>
                                <IconComponent className="h-4 w-4 mr-1" />
                                <span className="text-xs">
                                  {platformData?.label || link.platform}
                                </span>
                              </Button>
                            );
                          })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-3">
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your personal information and settings
              </CardDescription>
            </CardHeader>

            <Form {...form}>
              <form
                className="px-6 py-4 space-y-6"
                onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <UserCircle className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-medium">Basic Information</h3>
                  </div>
                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                              <Input
                                placeholder="Your email"
                                className="pl-9"
                                {...field}
                                disabled
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-medium">Social Links</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSocialLink}
                    className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Link
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No social links added yet.</p>
                      <p className="text-sm">
                        Click &quot;Add Link&quot; to get started.
                      </p>
                    </div>
                  ) : (
                    fields.map((field, index) => (
                      <div key={field.id} className="flex gap-2 items-end">
                        <div className="flex-1 grid gap-2 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`socialLinks.${index}.platform`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Platform</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select platform" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {getAvailablePlatforms(index).map(
                                      (platform) => {
                                        const IconComponent = platform.icon;
                                        return (
                                          <SelectItem
                                            key={platform.value}
                                            value={platform.value}>
                                            <div className="flex items-center gap-2">
                                              <IconComponent className="h-4 w-4" />
                                              {platform.label}
                                            </div>
                                          </SelectItem>
                                        );
                                      },
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`socialLinks.${index}.url`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    {form.watch(
                                      `socialLinks.${index}.platform`,
                                    ) && (
                                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        {(() => {
                                          const IconComponent = getPlatformIcon(
                                            form.watch(
                                              `socialLinks.${index}.platform`,
                                            ),
                                          );
                                          return (
                                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                                          );
                                        })()}
                                      </div>
                                    )}
                                    <Input
                                      placeholder={getPlatformPlaceholder(
                                        form.watch(
                                          `socialLinks.${index}.platform`,
                                        ),
                                      )}
                                      className={
                                        form.watch(
                                          `socialLinks.${index}.platform`,
                                        )
                                          ? "pl-9"
                                          : ""
                                      }
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeSocialLink(index)}
                          className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <CardFooter className="border-t px-0 py-4 flex justify-between">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
