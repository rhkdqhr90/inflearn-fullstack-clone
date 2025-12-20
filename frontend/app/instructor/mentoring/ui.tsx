"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MentoringForm } from "@/components/mentoring/mentoring-form";
import { ApplicationsTable } from "@/components/mentoring/applications-table";
import { ApplicationDetailModal } from "../_components/application-detail-modal";
import { deleteMentoring } from "@/lib/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSettingDialog, setShowSettingDialog] = useState(false);

  // 신청 상세보기 모달 state
  const [selectedApplication, setSelectedApplication] = useState<any | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const m = mentoring as any;

  // 헤더에서 발생하는 이벤트 리스닝
  useEffect(() => {
    const handleCreateToggle = (e: any) => {
      setShowCreateForm(e.detail);
    };

    const handleAction = (e: any) => {
      if (e.detail === "setting") {
        setShowSettingDialog(true);
      } else if (e.detail === "delete") {
        setShowDeleteDialog(true);
      }
    };
    // ✅ 리페치 이벤트 - mentoring 상태 업데이트
    const handleRefetch = async (e: any) => {
      router.refresh();
    };
    window.addEventListener("mentoring-create-toggle", handleCreateToggle);
    window.addEventListener("mentoring-action", handleAction);
    window.addEventListener("mentoring-refetch-ui", handleRefetch);

    return () => {
      window.removeEventListener("mentoring-create-toggle", handleCreateToggle);
      window.removeEventListener("mentoring-action", handleAction);
      window.removeEventListener("mentoring-refetch-ui", handleRefetch);
    };
  }, [router]);

  // showCreateForm 변경 감지
  useEffect(() => {
    console.log("🔄 showCreateForm 변경:", showCreateForm);
  }, [showCreateForm]);

  // 생성 성공
  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    toast.success("멘토링이 생성되었습니다!");
    window.location.reload();
  };

  // 수정 성공
  const handleSettingSuccess = () => {
    setShowSettingDialog(false);
    toast.success("멘토링 설정이 변경되었습니다!");
    window.location.reload();
  };

  // 삭제
  const handleDelete = async () => {
    if (!mentoring) return;

    const result = await deleteMentoring(m.id);

    if (result.error) {
      const error = result.error as any;
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || "멘토링 삭제에 실패했습니다.";
      toast.error(errorMessage);
    } else {
      toast.success("멘토링이 삭제되었습니다.");
      setMentoring(null);
      setApplications([]);
      setShowDeleteDialog(false);
      window.location.reload();
    }
  };

  // 신청 상세보기
  const handleViewDetail = (application: any) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  // 신청 상태 업데이트 (승인/거절)
  const handleStatusUpdate = async (
    applicationId: string,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    try {
      const { updateApplicationStatus } = await import("@/lib/api");
      const { data, error } = await updateApplicationStatus(applicationId, {
        status,
      });

      if (error) {
        throw new Error("상태 업데이트 실패");
      }

      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error("상태 업데이트 오류:", error);
      throw error;
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="space-y-6">
        {/* 멘토링이 없고 토글이 OFF인 경우 */}
        {!mentoring && !showCreateForm && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">멘토링을 시작하세요</h2>
                <p className="text-gray-600 mb-6">
                  상단의 토글을 ON으로 전환하면 멘토링을 생성할 수 있습니다.
                </p>
                <div className="text-sm text-gray-500">
                  💡 토글을 켜면 멘토링 정보 입력 폼이 나타납니다.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 멘토링 생성 폼 */}
        {!mentoring && showCreateForm && (
          <>
            {console.log("✅ 생성 폼 렌더링 시작")}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>멘토링 정보 입력</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                  >
                    취소
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <MentoringForm onSuccess={handleCreateSuccess} />
              </CardContent>
            </Card>
          </>
        )}

        {/* 멘토링이 있는 경우 */}
        {mentoring && (
          <>
            {/* 멘토링 정보 카드 */}
            <Card>
              <CardHeader>
                <CardTitle>멘토링 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">1회 가격</div>
                    <div className="text-xl font-bold">
                      {m.pricePerSession?.toLocaleString() || 0}원
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      1회 최대 인원
                    </div>
                    <div className="text-xl font-bold">
                      {m.maxParticipants || 0}명
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">1회 시간</div>
                    <div className="text-xl font-bold">
                      {Math.floor((m.sessionDuration || 0) / 60)}시간
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <span className="font-medium">{m.name}</span>
                  <span className="mx-2">•</span>
                  <span>{m.jobRole}</span>
                  <span className="mx-2">•</span>
                  <span>{m.experience}</span>
                  {m.company && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{m.company}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 멘토링 스케줄 */}
            <Card>
              <CardHeader>
                <CardTitle>멘토링 스케줄</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {m.schedules && m.schedules.length > 0 ? (
                    m.schedules.map((schedule: any) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium">
                          {
                            ["일", "월", "화", "수", "목", "금", "토"][
                              schedule.dayOfWeek
                            ]
                          }
                          요일
                        </span>
                        <span className="text-sm text-gray-600">
                          {schedule.startTime} ~ {schedule.endTime}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      등록된 스케줄이 없습니다.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 신청자 목록 테이블 */}
            <ApplicationsTable
              applications={applications}
              onViewDetail={handleViewDetail}
            />
          </>
        )}
      </div>

      {/* 멘토링 설정 Dialog */}
      <Dialog open={showSettingDialog} onOpenChange={setShowSettingDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>멘토링 설정</DialogTitle>
          </DialogHeader>
          <MentoringForm
            initialData={mentoring}
            isEdit={true}
            onSuccess={handleSettingSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>멘토링을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {applications.length > 0
                ? `현재 ${applications.length}명의 신청자가 있습니다. 모든 신청 내역도 함께 삭제됩니다.`
                : "이 작업은 되돌릴 수 없습니다."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 신청 상세보기 모달 */}
      <ApplicationDetailModal
        application={selectedApplication}
        open={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
