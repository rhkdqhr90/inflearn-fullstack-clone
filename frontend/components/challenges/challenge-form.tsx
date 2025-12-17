"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

const CKEditor = dynamic(() => import("@/components/ckeditor"), {
  ssr: false,
});

const DEFAULT_DESCRIPTION = `
<h2>논길을 끄는 간결한 제목을 작성해보세요</h2>

<p>챌린지를 통해 무엇을 배울 수 있는지, 어떤 목표를 달성할 수 있는지 설명해주세요.</p>

<ul>
  <li>구체적인 학습 계획과 일정</li>
  <li>참가자들이 얻을 수 있는 실질적인 혜택</li>
  <li>함께 공부하며 얻을 수 있는 동기부여와 성취감</li>
</ul>

<h2>이런 내용을 배워요</h2>

<h3>챌린지 진행 방식</h3>

<p>챌린지 기간 동안 어떻게 학습이 진행되는지 자세히 설명해주세요.</p>

<h3>참가 전 참고 사항</h3>

<h4>권장 학습 시간</h4>
<ul>
  <li>하루 권장 학습 시간</li>
  <li>주차별 학습 분량</li>
</ul>

<h4>준비물</h4>
<ul>
  <li>필요한 사전 지식이나 준비물</li>
  <li>학습 환경 및 도구</li>
</ul>
`;

const challengeFormSchema = z
  .object({
    maxParticipants: z
      .number()
      .min(1, "최소 1명 이상이어야 합니다")
      .max(10000, "최대 10000명까지 가능합니다"),
    recruitStartAt: z.string().min(1, "모집 시작일을 선택해주세요"),
    recruitEndAt: z.string().min(1, "모집 종료일을 선택해주세요"),
    challengeStartAt: z.string().min(1, "챌린지 시작일을 선택해주세요"),
    challengeEndAt: z.string().min(1, "챌린지 종료일을 선택해주세요"),
    description: z.string().optional(),
  })
  .refine(
    (data) => new Date(data.recruitEndAt) > new Date(data.recruitStartAt),
    {
      message: "모집 종료일은 모집 시작일 이후여야 합니다",
      path: ["recruitEndAt"],
    }
  )
  .refine(
    (data) => new Date(data.challengeStartAt) > new Date(data.recruitEndAt),
    {
      message: "챌린지 시작일은 모집 종료일 이후여야 합니다",
      path: ["challengeStartAt"],
    }
  )
  .refine(
    (data) => new Date(data.challengeEndAt) > new Date(data.challengeStartAt),
    {
      message: "챌린지 종료일은 챌린지 시작일 이후여야 합니다",
      path: ["challengeEndAt"],
    }
  );

type ChallengeFormValues = z.infer<typeof challengeFormSchema>;

interface ChallengeFormProps {
  defaultValues?: Partial<ChallengeFormValues>;
  onSubmit: (values: ChallengeFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  showDeleteButton?: boolean;
}

export function ChallengeForm({
  defaultValues,
  onSubmit,
  onDelete,
  isSubmitting = false,
  submitLabel = "저장하기",
  showDeleteButton = false,
}: ChallengeFormProps) {
  const [description, setDescription] = useState(
    defaultValues?.description || DEFAULT_DESCRIPTION
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: {
      maxParticipants: defaultValues?.maxParticipants || 100,
      recruitStartAt: defaultValues?.recruitStartAt || "",
      recruitEndAt: defaultValues?.recruitEndAt || "",
      challengeStartAt: defaultValues?.challengeStartAt || "",
      challengeEndAt: defaultValues?.challengeEndAt || "",
      description: description,
    },
  });

  const handleSubmit = async (values: ChallengeFormValues) => {
    try {
      await onSubmit({ ...values, description });
    } catch (error) {
      console.error("챌린지 저장 에러:", error);
      toast.error("챌린지 저장에 실패했습니다");
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("챌린지 삭제 에러:", error);
      toast.error("챌린지 삭제에 실패했습니다");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>최대 참가자 수</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="예: 100"
                    {...field}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recruitStartAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>모집 시작일</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recruitEndAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>모집 종료일</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="challengeStartAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>챌린지 시작일</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="challengeEndAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>챌린지 종료일</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>상세 소개</FormLabel>
            <FormDescription>
              챌린지에 대한 자세한 설명을 작성해주세요.
            </FormDescription>
            <FormControl>
              <div className="min-h-[400px]">
                <CKEditor value={description} onChange={setDescription} />
              </div>
            </FormControl>
          </FormItem>

          <div className="flex gap-3 justify-center">
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-1/4"
            >
              {isSubmitting ? "저장 중..." : submitLabel}
            </Button>

            {showDeleteButton && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="lg"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isSubmitting}
                className="w-1/4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                삭제
              </Button>
            )}
          </div>
        </form>
      </Form>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>챌린지 삭제</DialogTitle>
            <DialogDescription>
              정말로 이 챌린지를 삭제하시겠습니까?
              <br />
              삭제된 챌린지는 복구할 수 없으며, 참가자 정보도 모두 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
