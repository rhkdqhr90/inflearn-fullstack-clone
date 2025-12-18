"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MentoringForm } from "@/components/mentorings/mentoring-form";
import { ApplicationsDialog } from "@/components/mentorings/applications-dialog";
import { toggleMentoring, deleteMentoring } from "@/lib/api";
import { toast } from "sonner";
import {
  formatDayOfWeek,
  formatPrice,
  formatDuration,
  formatTimeRange,
} from "@/lib/mentoring-utils";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";

interface InstructorMentoringUIProps {
  initialMentoring: any;
  initialApplications: any[];
}

export function InstructorMentoringUI({
  initialMentoring,
  initialApplications,
}: InstructorMentoringUIProps) {
  const router = useRouter();
  const [mentoring, setMentoring] = useState(initialMentoring);
  const [applications, setApplications] = useState(initialApplications);
  const [isToggling, setIsToggling] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [applicationsDialogOpen, setApplicationsDialogOpen] = useState(false);

  const handleToggle = async () => {
    if (!mentoring) return;

    setIsToggling(true);
    const result = await toggleMentoring((mentoring as any).id);
    if (result.error) {
      const error = result.error as any;
      const errorMessage =
        typeof result.error === "string"
          ? error
          : error.message || "멘토링 상태 변경에 실패했습니다.";
      toast.error(errorMessage);
    } else {
      // 타입 단언으로 해결
      const updatedMentoring = result.data as any;
      toast.success(
        updatedMentoring?.isActive
          ? "멘토링이 활성화되었습니다."
          : "멘토링이 비활성화되었습니다."
      );
      setMentoring(result.data);
      router.refresh();
    }
    setIsToggling(false);
  };

  const handleDelete = async () => {
    if (!mentoring) return;

    const result = await deleteMentoring((mentoring as any).id);
    if (result.error) {
      const error = result.error as any;

      const errorMessage =
        typeof result.error === "string"
          ? error
          : error.message || "멘토링 삭제에 실패했습니다.";
      toast.error(errorMessage);
    } else {
      toast.success("멘토링이 삭제되었습니다.");
      setMentoring(null);
      setApplications([]);
      router.refresh();
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    router.refresh();
  };

  const pendingCount = applications.filter(
    (a) => a.status === "PENDING"
  ).length;

  // 타입 안전성을 위한 헬퍼
  const m = mentoring as any;

  if (!mentoring) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>멘토링 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                아직 멘토링을 생성하지 않았습니다.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>멘토링 생성하기</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>멘토링 생성</DialogTitle>
                  </DialogHeader>
                  <MentoringForm onSuccess={handleFormSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">멘토링 관리</h1>
        <div className="flex items-center gap-4">
          {/* 신청 현황 버튼 */}
          <Button
            variant="outline"
            className="relative"
            onClick={() => setApplicationsDialogOpen(true)}
          >
            <Bell className="h-4 w-4 mr-2" />
            신청 관리
            {pendingCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {pendingCount}
              </Badge>
            )}
          </Button>

          {/* 멘토링 ON/OFF */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">멘토링 설정</span>
            <Switch
              checked={m.isActive}
              onCheckedChange={handleToggle}
              disabled={isToggling}
            />
            <Badge variant={m.isActive ? "default" : "secondary"}>
              {m.isActive ? "ON" : "OFF"}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{m.name}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{m.jobRole}</Badge>
                <Badge variant="outline">{m.experience}</Badge>
                {m.company && <Badge variant="outline">{m.company}</Badge>}
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">수정</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>멘토링 수정</DialogTitle>
                  </DialogHeader>
                  <MentoringForm
                    initialData={mentoring}
                    onSuccess={handleFormSuccess}
                  />
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">삭제</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      멘토링을 삭제하시겠습니까?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 모든 신청 내역도 함께
                      삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 멘토링 정보 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">1회 가격</div>
              <div className="text-lg font-semibold">
                {formatPrice(m.pricePerSession)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">1회 최대 인원</div>
              <div className="text-lg font-semibold">{m.maxParticipants}명</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">1회 시간</div>
              <div className="text-lg font-semibold">
                {formatDuration(m.sessionDuration)}
              </div>
            </div>
          </div>

          {/* 스케줄 */}
          <div>
            <h3 className="font-semibold mb-3">멘토링 스케줄</h3>
            <div className="grid grid-cols-2 gap-2">
              {m.schedules
                ?.sort((a: any, b: any) => a.dayOfWeek - b.dayOfWeek)
                .map((schedule: any) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="font-medium">
                      {formatDayOfWeek(schedule.dayOfWeek)}요일
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatTimeRange(schedule.startTime, schedule.endTime)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* 신청 현황 요약 */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">신청 현황</h3>
              <Button variant="ghost" size="sm">
                전체 보기 →
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{applications.length}</div>
                <div className="text-sm text-muted-foreground">전체</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {pendingCount}
                </div>
                <div className="text-sm text-muted-foreground">미승인</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {applications.filter((a) => a.status === "ACCEPTED").length}
                </div>
                <div className="text-sm text-muted-foreground">수락</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {applications.filter((a) => a.status === "REJECTED").length}
                </div>
                <div className="text-sm text-muted-foreground">거절</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 신청 관리 Dialog */}
      <ApplicationsDialog
        open={applicationsDialogOpen}
        onOpenChange={setApplicationsDialogOpen}
        applications={applications}
        onUpdate={() => router.refresh()}
      />
    </div>
  );
}
