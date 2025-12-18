"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createMentoring, updateMentoring } from "@/lib/api";
import { toast } from "sonner";
import { DAY_NAMES_FULL_KR } from "@/lib/mentoring-utils";

const scheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
});

const mentoringSchema = z.object({
  name: z.string().min(1, "멘토링명을 입력해주세요").max(100),
  jobRole: z.string().min(1, "직군/직무를 입력해주세요"),
  experience: z.string().min(1, "경력을 선택해주세요"),
  company: z.string().optional(),
  pricePerSession: z.number().min(0, "가격은 0원 이상이어야 합니다"),
  maxParticipants: z.number().min(1, "최소 1명 이상이어야 합니다"),
  sessionDuration: z.number().min(1, "최소 1분 이상이어야 합니다"),
  schedules: z
    .array(scheduleSchema)
    .min(1, "최소 1개 이상의 스케줄을 선택해주세요"),
});

type MentoringFormData = z.infer<typeof mentoringSchema>;

interface MentoringFormProps {
  initialData?: Partial<MentoringFormData> & { id?: string };
  onSuccess?: () => void;
}

const EXPERIENCE_OPTIONS = [
  { value: "신입 (1년 미만)", label: "신입 (1년 미만)" },
  { value: "주니어 (1~3년)", label: "주니어 (1~3년)" },
  { value: "미들 (4~8년)", label: "미들 (4~8년)" },
  { value: "시니어 (9년 이상)", label: "시니어 (9년 이상)" },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return `${hour}:00`;
});

export function MentoringForm({ initialData, onSuccess }: MentoringFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<number>>(
    new Set(initialData?.schedules?.map((s) => s.dayOfWeek) || [])
  );

  const form = useForm<MentoringFormData>({
    resolver: zodResolver(mentoringSchema),
    defaultValues: {
      name: initialData?.name || "",
      jobRole: initialData?.jobRole || "",
      experience: initialData?.experience || "",
      company: initialData?.company || "",
      pricePerSession: initialData?.pricePerSession || 10000,
      maxParticipants: initialData?.maxParticipants || 1,
      sessionDuration: initialData?.sessionDuration || 60,
      schedules: initialData?.schedules || [],
    },
  });

  const toggleDay = (dayOfWeek: number) => {
    const newSelectedDays = new Set(selectedDays);
    if (newSelectedDays.has(dayOfWeek)) {
      newSelectedDays.delete(dayOfWeek);
      // 스케줄에서도 제거
      const currentSchedules = form.getValues("schedules");
      form.setValue(
        "schedules",
        currentSchedules.filter((s) => s.dayOfWeek !== dayOfWeek)
      );
    } else {
      newSelectedDays.add(dayOfWeek);
      // 기본 스케줄 추가
      const currentSchedules = form.getValues("schedules");
      form.setValue("schedules", [
        ...currentSchedules,
        { dayOfWeek, startTime: "21:00", endTime: "22:00" },
      ]);
    }
    setSelectedDays(newSelectedDays);
  };

  const updateScheduleTime = (
    dayOfWeek: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const currentSchedules = form.getValues("schedules");
    const updatedSchedules = currentSchedules.map((s) =>
      s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
    );
    form.setValue("schedules", updatedSchedules);
  };

  const onSubmit = async (data: MentoringFormData) => {
    setIsSubmitting(true);
    try {
      let result;

      // DTO 형식으로 변환
      const dto = {
        name: data.name,
        jobRole: data.jobRole,
        experience: data.experience,
        company: data.company,
        pricePerSession: data.pricePerSession,
        maxParticipants: data.maxParticipants,
        sessionDuration: data.sessionDuration,
        schedules: data.schedules,
      } as any; // OpenAPI 타입과 불일치 해결

      if (initialData?.id) {
        result = await updateMentoring(initialData.id, dto);
      } else {
        result = await createMentoring(dto);
      }

      if (result.error) {
        const error = result.error as any;
        const errorMessage =
          typeof result.error === "string"
            ? error
            : error.message || "멘토링 저장에 실패했습니다.";
        toast.error(errorMessage);
      } else {
        toast.success(
          initialData?.id
            ? "멘토링이 수정되었습니다."
            : "멘토링이 생성되었습니다."
        );
        onSuccess?.();
      }
    } catch (error) {
      toast.error("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 멘토링명 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>멘토링명 *</FormLabel>
              <FormControl>
                <Input placeholder="예: 콘텐츠 에디터 고민 상담소" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 직군/직무 */}
        <FormField
          control={form.control}
          name="jobRole"
          render={({ field }) => (
            <FormItem>
              <FormLabel>직군/직무 *</FormLabel>
              <FormControl>
                <Input placeholder="예: 마케팅" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 경력 */}
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>경력 *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="경력을 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 소속 회사 */}
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>소속 회사</FormLabel>
              <FormControl>
                <Input placeholder="예: 인프랩(인프런)" {...field} />
              </FormControl>
              <FormDescription>선택사항입니다.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 1회 가격 */}
        <FormField
          control={form.control}
          name="pricePerSession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>1회 가격 (원) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 1회 최대 인원 */}
        <FormField
          control={form.control}
          name="maxParticipants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>1회 최대 인원 *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 1회 시간 */}
        <FormField
          control={form.control}
          name="sessionDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>1회 시간 (분) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>예: 60분 = 1시간</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 스케줄 설정 */}
        <FormField
          control={form.control}
          name="schedules"
          render={() => (
            <FormItem>
              <FormLabel>스케줄 설정 *</FormLabel>
              <FormDescription>
                멘토링 가능한 요일과 시간을 선택하세요
              </FormDescription>

              {/* 요일 선택 */}
              <div className="space-y-4">
                {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
                  <div key={dayOfWeek} className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedDays.has(dayOfWeek)}
                      onCheckedChange={() => toggleDay(dayOfWeek)}
                    />
                    <div className="flex-1">
                      <div className="font-medium mb-2">
                        {DAY_NAMES_FULL_KR[dayOfWeek]}
                      </div>
                      {selectedDays.has(dayOfWeek) && (
                        <div className="flex gap-2 items-center">
                          <Select
                            value={
                              form
                                .getValues("schedules")
                                .find((s) => s.dayOfWeek === dayOfWeek)
                                ?.startTime || "21:00"
                            }
                            onValueChange={(value) =>
                              updateScheduleTime(dayOfWeek, "startTime", value)
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_OPTIONS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span>~</span>
                          <Select
                            value={
                              form
                                .getValues("schedules")
                                .find((s) => s.dayOfWeek === dayOfWeek)
                                ?.endTime || "22:00"
                            }
                            onValueChange={(value) =>
                              updateScheduleTime(dayOfWeek, "endTime", value)
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_OPTIONS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "저장 중..."
              : initialData?.id
              ? "수정하기"
              : "생성하기"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
