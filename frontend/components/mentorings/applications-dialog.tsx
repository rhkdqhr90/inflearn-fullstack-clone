"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateApplicationStatus } from "@/lib/api";
import { toast } from "sonner";
import { Check, X, Clock, User } from "lucide-react";

interface Application {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface ApplicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applications: Application[];
  onUpdate: () => void;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "미승인",
    color: "bg-orange-100 text-orange-800",
    icon: Clock,
  },
  ACCEPTED: {
    label: "수락",
    color: "bg-green-100 text-green-800",
    icon: Check,
  },
  REJECTED: {
    label: "거절",
    color: "bg-red-100 text-red-800",
    icon: X,
  },
};

export function ApplicationsDialog({
  open,
  onOpenChange,
  applications,
  onUpdate,
}: ApplicationsDialogProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "ACCEPTED" | "REJECTED" | null
  >(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (
    applicationId: string,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    setIsUpdating(true);
    const result = await updateApplicationStatus(applicationId, { status });

    if (result.error) {
      const error = result.error as any;
      const errorMessage =
        typeof result.error === "string"
          ? error
          : error.message || "신청 상태 변경에 실패했습니다.";
      toast.error(errorMessage);
    } else {
      toast.success(
        status === "ACCEPTED" ? "신청을 수락했습니다." : "신청을 거절했습니다."
      );
      setConfirmAction(null);
      setSelectedApp(null);
      onUpdate();
    }
    setIsUpdating(false);
  };

  const openConfirmDialog = (
    app: Application,
    action: "ACCEPTED" | "REJECTED"
  ) => {
    setSelectedApp(app);
    setConfirmAction(action);
  };

  const filteredApplications = (status?: string) => {
    if (!status || status === "ALL") return applications;
    return applications.filter((app) => app.status === status);
  };

  const renderApplicationRow = (app: Application) => {
    const StatusIcon = STATUS_CONFIG[app.status].icon;

    return (
      <TableRow key={app.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              {app.user.image ? (
                <img
                  src={app.user.image}
                  alt={app.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="font-medium">{app.user.name}</div>
              <div className="text-sm text-muted-foreground">
                {app.user.email}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="max-w-xs truncate">{app.message || "-"}</div>
        </TableCell>
        <TableCell>
          <div className="text-sm text-muted-foreground">
            {new Date(app.createdAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </TableCell>
        <TableCell>
          <Badge className={STATUS_CONFIG[app.status].color} variant="outline">
            <StatusIcon className="h-3 w-3 mr-1" />
            {STATUS_CONFIG[app.status].label}
          </Badge>
        </TableCell>
        <TableCell>
          {app.status === "PENDING" ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => openConfirmDialog(app, "ACCEPTED")}
              >
                <Check className="h-4 w-4 mr-1" />
                수락
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => openConfirmDialog(app, "REJECTED")}
              >
                <X className="h-4 w-4 mr-1" />
                거절
              </Button>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">완료됨</span>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>신청 관리</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="ALL" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ALL">
                전체 ({applications.length})
              </TabsTrigger>
              <TabsTrigger value="PENDING">
                미승인 (
                {applications.filter((a) => a.status === "PENDING").length})
              </TabsTrigger>
              <TabsTrigger value="ACCEPTED">
                수락 (
                {applications.filter((a) => a.status === "ACCEPTED").length})
              </TabsTrigger>
              <TabsTrigger value="REJECTED">
                거절 (
                {applications.filter((a) => a.status === "REJECTED").length})
              </TabsTrigger>
            </TabsList>

            {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((status) => (
              <TabsContent key={status} value={status}>
                {filteredApplications(status).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    신청 내역이 없습니다.
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>신청자</TableHead>
                          <TableHead>메시지</TableHead>
                          <TableHead>신청일</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications(status).map(renderApplicationRow)}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* 확인 Dialog */}
      <AlertDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "ACCEPTED"
                ? "신청을 수락하시겠습니까?"
                : "신청을 거절하시겠습니까?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedApp && (
                <>
                  <div className="my-4 p-4 bg-muted rounded-lg">
                    <div className="font-medium mb-2">신청자 정보</div>
                    <div className="space-y-1 text-sm">
                      <div>이름: {selectedApp.user.name}</div>
                      <div>이메일: {selectedApp.user.email}</div>
                      {selectedApp.message && (
                        <div>메시지: {selectedApp.message}</div>
                      )}
                    </div>
                  </div>
                  {confirmAction === "REJECTED" && (
                    <div className="text-red-600">
                      거절 후에는 되돌릴 수 없습니다.
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>취소</AlertDialogCancel>
            <AlertDialogAction
              disabled={isUpdating}
              onClick={() =>
                selectedApp &&
                confirmAction &&
                handleStatusUpdate(selectedApp.id, confirmAction)
              }
              className={
                confirmAction === "REJECTED"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
            >
              {isUpdating
                ? "처리 중..."
                : confirmAction === "ACCEPTED"
                ? "수락"
                : "거절"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
