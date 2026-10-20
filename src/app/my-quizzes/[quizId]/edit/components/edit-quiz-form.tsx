"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PlusCircle,
  Trash2,
  CheckCircle,
  Settings2,
  PencilLine,
  Clock,
  GripVertical,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { quizFormSchema, QuizFormValues } from "@/lib/quiz-form-schema";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateQuiz } from "@/server/actions/quiz/update";
import { useRouter } from "next/navigation";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Session } from "@/lib/auth";
import { OwnerQuizDetail } from "@/server/database/schema";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  categories,
  flattenCategories,
  getCategoryNameFromPath,
} from "@/lib/quiz-categories";
import { tryCatch } from "@/lib/try-catch";

type Props = {
  quizId: string;
  quiz: OwnerQuizDetail;
  session: Session;
};

export default function EditQuizForm({ quizId, quiz, session }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: quiz.title,
      category: quiz.category,
      difficulty: quiz.difficulty,
      description: quiz.description,
      isTimeLimited: quiz.isTimeLimited,
      timeLimit: quiz.isTimeLimited
        ? Math.round((quiz.timeLimit ?? 0) / 60)
        : null,
      questions: quiz.questions,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const flattenedCategories = flattenCategories(categories);

  const addQuestion = () => {
    append({
      title: "",
      choices: ["", ""],
      correctAnswer: -1,
    });
  };

  const addChoice = (questionIndex: number) => {
    const currentValues = form.getValues(`questions.${questionIndex}`);
    update(questionIndex, {
      ...currentValues,
      choices: [...currentValues.choices, ""],
    });
  };

  const removeChoice = (questionIndex: number, choiceIndex: number) => {
    const currentValues = form.getValues(`questions.${questionIndex}`);
    const newChoices = currentValues.choices.filter(
      (_, index) => index !== choiceIndex,
    );
    update(questionIndex, {
      ...currentValues,
      choices: newChoices,
      correctAnswer:
        currentValues.correctAnswer === choiceIndex
          ? -1
          : currentValues.correctAnswer,
    });
  };

  const setCorrectAnswer = (questionIndex: number, choiceIndex: number) => {
    const currentValues = form.getValues(`questions.${questionIndex}`);
    update(questionIndex, {
      ...currentValues,
      correctAnswer: choiceIndex,
    });
  };

  function onSubmit(data: QuizFormValues) {
    startTransition(async () => {
      const { data: updatedQuizId, error: quizError } = await tryCatch(
        updateQuiz(
          {
            ...data,
            timeLimit: data.isTimeLimited ? (data.timeLimit ?? 0) * 60 : 0,
          },
          parseInt(quizId),
          session.user.id,
        ),
      );

      if (quizError) {
        toast.error(quizError.message);
        return;
      }

      if (updatedQuizId) {
        form.reset();
        toast.success("Quiz updated successfully!");
        router.replace("/my-quizzes");
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        <div className="text-center max-w-xl mx-auto py-4">
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="absolute -inset-1 bg-primary/10 rounded-2xl blur-sm"></div>
            <div className="relative w-12 h-12 bg-white/80 rounded-xl flex items-center justify-center">
              <PencilLine className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-3">
            Edit {quiz.title} Quiz
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="shadow-lg bg-primary-foreground backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Settings2 className="w-6 h-6 text-primary" />
                  <CardTitle>Quiz Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Quiz Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter a title for your quiz"
                          className="h-12 text-lg border-primary/20 focus:border-primary/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1.5">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Category</FormLabel>
                          <Popover>
                            <PopoverTrigger>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground",
                                  )}>
                                  {field.value
                                    ? field.value
                                    : "Select category"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search category..." />
                                <CommandList>
                                  <CommandEmpty>
                                    No category found.
                                  </CommandEmpty>
                                  <CommandGroup className="max-h-64 overflow-y-auto">
                                    {flattenedCategories.map((category) => (
                                      <CommandItem
                                        value={category.value}
                                        key={category.value}
                                        onSelect={() => {
                                          const categoryName = category.label;
                                          form.setValue(
                                            "category",
                                            categoryName,
                                          );
                                        }}>
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            category.label === field.value
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                        {getCategoryNameFromPath(
                                          category.value,
                                          categories,
                                        )}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Difficulty</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="BEGINNER">Beginner</SelectItem>
                              <SelectItem value="INTERMEDIATE">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="ADVANCED">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Provide a brief description of your quiz"
                          className="min-h-[100px] text-base border-primary/20 focus:border-primary/40"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t border-border/30 pt-6">
                  <Label className="text-base font-medium mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Time Settings
                  </Label>
                  <div className="flex items-center gap-6">
                    <FormField
                      control={form.control}
                      name="isTimeLimited"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-3">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Timed Quiz</FormLabel>
                        </FormItem>
                      )}
                    />
                    {form.watch("isTimeLimited") && (
                      <FormField
                        control={form.control}
                        name="timeLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  {...field}
                                  className="w-24 h-10"
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                  value={field.value || ""}
                                />
                                <span className="text-sm text-muted-foreground">
                                  minutes
                                </span>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Accordion type="multiple" className="space-y-4">
                {fields.map((question, qIndex) => (
                  <AccordionItem
                    key={question.id}
                    value={`question-${qIndex}`}
                    className="border bg-primary-foreground backdrop-blur-xl rounded-xl shadow-sm overflow-hidden group">
                    <AccordionTrigger className="px-6 hover:no-underline">
                      <div className="w-full flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <GripVertical className="w-5 h-5 text-muted-foreground/40 group-hover:text-muted-foreground/60" />
                          <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-medium">
                            {qIndex + 1}
                          </div>
                          <span className="text-base font-medium">
                            {question.title || `Question ${qIndex + 1}`}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(qIndex)}
                          className="text-destructive hover:text-destructive/90 hover:bg-red-50 text-sm">
                          <Trash2 className="w-4 h-4 mr-1" />
                        </Button>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="border-t">
                      <div className="p-6 space-y-6">
                        <FormField
                          control={form.control}
                          name={`questions.${qIndex}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">
                                Question
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Type your question here..."
                                  className="min-h-[100px] text-lg border-primary/20 focus:border-primary/40"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-3">
                          <Label className="text-base font-medium">
                            Options
                          </Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.choices.map((choice, cIndex) => (
                              <div
                                key={cIndex}
                                className={`relative p-4 rounded-xl border transition-all ${
                                  question.correctAnswer === cIndex
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-border/40 hover:border-primary/30"
                                }`}>
                                <FormField
                                  control={form.control}
                                  name={`questions.${qIndex}.choices.${cIndex}`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          placeholder={`Option ${cIndex + 1}`}
                                          className="border-0 p-0 h-9 text-base shadow-none focus-visible:ring-0 bg-transparent"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="absolute top-3 right-3 flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeChoice(qIndex, cIndex)}
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      setCorrectAnswer(qIndex, cIndex)
                                    }
                                    className={`h-7 w-7 ${
                                      question.correctAnswer === cIndex
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                    }`}>
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addChoice(qIndex)}
                            className="w-full mt-2">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Option
                          </Button>
                          {form.formState.isSubmitted &&
                            form.formState.errors.questions &&
                            Array.isArray(form.formState.errors.questions) &&
                            form.formState.errors.questions.map(
                              (questionError, index) =>
                                questionError?.correctAnswer &&
                                fields[index].correctAnswer === -1 && (
                                  <div
                                    key={index}
                                    className="text-sm font-medium text-destructive">
                                    Please select a correct answer for Question{" "}
                                    {index + 1}
                                  </div>
                                ),
                            )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="sticky bottom-6 pt-6">
              <Card className="shadow-xl bg-primary-foreground/50 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    {form.formState.isSubmitted && fields.length === 0 ? (
                      <div className="text-sm font-medium text-destructive">
                        At least one question is required
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {fields.length} questions created
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={addQuestion}
                        variant="outline"
                        className="h-11">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Question
                      </Button>
                      <Button
                        type="submit"
                        className="h-11 px-6 bg-primary hover:bg-primary/90"
                        disabled={isPending}>
                        {isPending ? (
                          <>
                            <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Quiz"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
