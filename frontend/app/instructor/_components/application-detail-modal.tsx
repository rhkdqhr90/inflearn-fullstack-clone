"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Check,
  X,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  message: string;
  createdAt: string;
  scheduledDate?: string;
  email?: string;
  phoneNumber?: string;
  applicant?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface ApplicationDetailModalProps {
  application: Application | null;
  open: boolean;
  onClose: () => void;
  onStatusUpdate: (
    applicationId: string,
    status: "ACCEPTED" | "REJECTED"
  ) => Promise<void>;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "대기중",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  ACCEPTED: {
    label: "수락됨",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  REJECTED: {
    label: "거절됨",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  COMPLETED: {
    label: "완료됨",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  CANCELLED: {
    label: "취소됨",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
};

export function ApplicationDetailModal({
  application,
  open,
  onClose,
  onStatusUpdate,
}: ApplicationDetailModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (!application) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onStatusUpdate(application.id, "ACCEPTED");
      toast.success("신청을 수락했습니다.");
      onClose();
    } catch (error) {
      toast.error("수락 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("거절 사유를 입력해주세요.");
      return;
    }

    setIsProcessing(true);
    try {
      await onStatusUpdate(application.id, "REJECTED");
      toast.success("신청을 거절했습니다.");
      onClose();
    } catch (error) {
      toast.error("거절 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
      setRejectReason("");
    }
  };

  const isPending = application.status === "PENDING";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">멘토링 신청 상세</DialogTitle>
          <DialogDescription>
            신청자의 정보를 확인하고 승인 또는 거절할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 상태 */}
          <div>
            <Badge
              className={`${STATUS_CONFIG[application.status].bgColor} ${
                STATUS_CONFIG[application.status].color
              } hover:${STATUS_CONFIG[application.status].bgColor}`}
            >
              {STATUS_CONFIG[application.status].label}
            </Badge>
          </div>

          <Separator />

          {/* 신청자 정보 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">신청자 정보</h3>
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={application.applicant?.image}
                  alt={application.applicant?.name}
                />
                <AvatarFallback className="text-xl">
                  {application.applicant?.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div>
                  <div className="font-semibold text-lg">
                    {application.applicant?.name || "알 수 없음"}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>
                      {application.applicant?.email || application.email || "-"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{application.phoneNumber || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 신청 정보 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">신청 정보</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <div className="text-gray-500 text-xs mb-1">희망 일정</div>
                  <div className="font-medium">
                    {application.scheduledDate
                      ? formatDate(application.scheduledDate)
                      : "미정"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <div className="text-gray-500 text-xs mb-1">신청 일시</div>
                  <div className="font-medium">
                    {formatDate(application.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 신청 메시지 */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              신청 메시지
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] whitespace-pre-wrap">
              {application.message || "메시지가 없습니다."}
            </div>
          </div>

          {/* 대기중일 때만 거절 사유 입력 */}
          {isPending && (
            <>
              <Separator />
              <div>
                <Label
                  htmlFor="rejectReason"
                  className="text-base font-semibold"
                >
                  거절 사유 (거절 시 필수)
                </Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="거절하는 경우 사유를 입력해주세요."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {isPending ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                거절
              </Button>
              <Button
                onClick={handleAccept}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                승인
              </Button>
            </div>
          ) : (
            <Button onClick={onClose} className="w-full">
              닫기
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
