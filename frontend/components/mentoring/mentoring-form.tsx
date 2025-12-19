"use client";

import { useState } from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createMentoring, updateMentoring } from "@/lib/api";
import { toast } from "sonner";

// 스케줄 스키마
const scheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

// 멘토링 폼 스키마
const mentoringSchema = z.object({
  title: z.string().min(1, "멘토링 제목을 입력해주세요"),
  name: z.string().min(1, "이름을 입력해주세요"),
  jobRole: z.string().min(1, "직무를 입력해주세요"),
  experience: z.string().min(1, "경력을 입력해주세요"),
  company: z.string().optional(),
  description: z.string().optional(),
  skills: z.array(z.string()).min(1, "최소 1개 이상의 기술을 입력해주세요"),
  pricePerSession: z.number().min(0, "가격은 0 이상이어야 합니다"),
  maxParticipants: z.number().min(1, "최소 1명 이상이어야 합니다"),
  sessionDuration: z.number().min(30, "최소 30분 이상이어야 합니다"),
  schedules: z
    .array(scheduleSchema)
    .min(1, "최소 1개 이상의 스케줄이 필요합니다"),
});

type MentoringFormValues = z.infer<typeof mentoringSchema>;

interface MentoringFormProps {
  onSuccess: () => void;
  initialData?: any;
  isEdit?: boolean;
}

export function MentoringForm({
  onSuccess,
  initialData,
  isEdit = false,
}: MentoringFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  // 기본값 설정
  const defaultValues: MentoringFormValues = initialData
    ? {
        title: initialData.title || "",
        name: initialData.name || "",
        jobRole: initialData.jobRole || "",
        experience: initialData.experience || "",
        company: initialData.company || "",
        description: initialData.description || "",
        skills: initialData.skills || [],
        pricePerSession: initialData.pricePerSession || 0,
        maxParticipants: initialData.maxParticipants || 1,
        sessionDuration: initialData.sessionDuration || 60,
        schedules: initialData.schedules || [
          { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" },
        ],
      }
    : {
        title: "",
        name: "",
        jobRole: "",
        experience: "",
        company: "",
        description: "",
        skills: [],
        pricePerSession: 0,
        maxParticipants: 1,
        sessionDuration: 60,
        schedules: [{ dayOfWeek: 1, startTime: "09:00", endTime: "10:00" }],
      };

  const form = useForm<MentoringFormValues>({
    resolver: zodResolver(mentoringSchema),
    defaultValues,
  });

  const onSubmit = async (data: MentoringFormValues) => {
    setIsSubmitting(true);

    try {
      // schedules를 JSON 문자열 배열로 변환
      const schedulesFormatted = data.schedules.map((schedule) =>
        JSON.stringify(schedule)
      );

      const payload = {
        title: data.title,
        name: data.name,
        jobRole: data.jobRole,
        experience: data.experience,
        company: data.company,
        description: data.description,
        skills: data.skills,
        pricePerSession: Number(data.pricePerSession),
        maxParticipants: Number(data.maxParticipants),
        sessionDuration: Number(data.sessionDuration),
        schedules: schedulesFormatted,
      };

      console.log("📤 전송 데이터:", payload);

      let result;
      if (isEdit && initialData?.id) {
        // 수정
        result = await updateMentoring(initialData.id, payload as any);
      } else {
        // 생성
        result = await createMentoring(payload as any);
      }

      console.log("📥 응답:", result);

      if (result.error) {
        const error = result.error as any;
        const errorMessage =
          typeof error === "string"
            ? error
            : error?.message ||
              `멘토링 ${isEdit ? "수정" : "생성"}에 실패했습니다.`;
        toast.error(errorMessage);
      } else {
        toast.success(`멘토링이 ${isEdit ? "수정" : "생성"}되었습니다!`);
        onSuccess();
      }
    } catch (error: any) {
      console.error("❌ 에러:", error);
      toast.error(
        error.message || `멘토링 ${isEdit ? "수정" : "생성"}에 실패했습니다.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 스케줄 추가
  const addSchedule = () => {
    const currentSchedules = form.getValues("schedules");
    form.setValue("schedules", [
      ...currentSchedules,
      { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" },
    ]);
  };

  // 스케줄 삭제
  const removeSchedule = (index: number) => {
    const currentSchedules = form.getValues("schedules");
    if (currentSchedules.length > 1) {
      form.setValue(
        "schedules",
        currentSchedules.filter((_, i) => i !== index)
      );
    }
  };

  // 기술 추가
  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = form.getValues("skills");
      if (!currentSkills.includes(skillInput.trim())) {
        form.setValue("skills", [...currentSkills, skillInput.trim()]);
        setSkillInput("");
      }
    }
  };

  // 기술 삭제
  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills");
    form.setValue(
      "skills",
      currentSkills.filter((s) => s !== skillToRemove)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 멘토링 제목 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>멘토링 제목 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="밀바닥부터 올라온 데이터 분석/사이언스 직군 8년차"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름 *</FormLabel>
                <FormControl>
                  <Input placeholder="홍길동" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="jobRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>직무 *</FormLabel>
                <FormControl>
                  <Input placeholder="백엔드 개발자" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>경력 *</FormLabel>
                <FormControl>
                  <Input placeholder="5년" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>회사</FormLabel>
                <FormControl>
                  <Input placeholder="카카오" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 멘토링 정보 */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="pricePerSession"
            render={({ field }) => (
              <FormItem>
                <FormLabel>1회 가격 (원) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="50000"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>최대 인원 (명) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="5"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sessionDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>1회 시간 (분) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="60"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 멘토링 소개 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>멘토링 소개</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="멘토링에 대한 간단한 소개를 작성해주세요"
                  className="h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 기술스택 */}
        <div>
          <FormLabel>기술스택 *</FormLabel>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="기술을 입력하고 Enter를 누르세요"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addSkill}>
              추가
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.watch("skills").map((skill, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <span># {skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 hover:text-blue-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {form.formState.errors.skills && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.skills.message}
            </p>
          )}
        </div>

        {/* 스케줄 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <FormLabel>멘토링 스케줄 *</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSchedule}
            >
              + 스케줄 추가
            </Button>
          </div>

          <div className="space-y-2">
            {form.watch("schedules").map((schedule, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  className="border rounded px-3 py-2"
                  value={schedule.dayOfWeek}
                  onChange={(e) => {
                    const schedules = form.getValues("schedules");
                    schedules[index].dayOfWeek = Number(e.target.value);
                    form.setValue("schedules", schedules);
                  }}
                >
                  <option value={0}>일요일</option>
                  <option value={1}>월요일</option>
                  <option value={2}>화요일</option>
                  <option value={3}>수요일</option>
                  <option value={4}>목요일</option>
                  <option value={5}>금요일</option>
                  <option value={6}>토요일</option>
                </select>

                <Input
                  type="time"
                  value={schedule.startTime}
                  onChange={(e) => {
                    const schedules = form.getValues("schedules");
                    schedules[index].startTime = e.target.value;
                    form.setValue("schedules", schedules);
                  }}
                  className="w-32"
                />

                <span>~</span>

                <Input
                  type="time"
                  value={schedule.endTime}
                  onChange={(e) => {
                    const schedules = form.getValues("schedules");
                    schedules[index].endTime = e.target.value;
                    form.setValue("schedules", schedules);
                  }}
                  className="w-32"
                />

                {form.watch("schedules").length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSchedule(index)}
                  >
                    삭제
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : isEdit ? "수정하기" : "생성하기"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
