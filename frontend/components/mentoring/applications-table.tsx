"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, Clock, Eye } from "lucide-react";

interface Application {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  message: string;
  createdAt: string;
  scheduledAt?: string;
  canceledAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

interface ApplicationsTableProps {
  applications: Application[];
  onViewDetail: (application: Application) => void;
}

const STATUS_CONFIG = {
  PENDING: {
    label: "미승인",
    variant: "default" as const,
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
  ACCEPTED: {
    label: "수락",
    variant: "default" as const,
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  REJECTED: {
    label: "거절",
    variant: "default" as const,
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  COMPLETED: {
    label: "완료",
    variant: "secondary" as const,
    className: "",
  },
  CANCELLED: {
    label: "취소",
    variant: "secondary" as const,
    className: "",
  },
};

export function ApplicationsTable({
  applications,
  onViewDetail,
}: ApplicationsTableProps) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("latest");

  // 통계 계산
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "PENDING").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    completed: applications.filter((a) => a.status === "COMPLETED").length,
  };

  // 필터링
  const filteredApplications = applications.filter((app) => {
    if (filterStatus === "ALL") return true;
    return app.status === filterStatus;
  });

  // 정렬
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === "latest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return 0;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* 필터 영역 */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-gray-700">FILTER</span>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">전체 상태</SelectItem>
              <SelectItem value="PENDING">미승인</SelectItem>
              <SelectItem value="ACCEPTED">수락</SelectItem>
              <SelectItem value="REJECTED">거절</SelectItem>
              <SelectItem value="COMPLETED">완료</SelectItem>
              <SelectItem value="CANCELLED">취소</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 통계 */}
        <div className="flex items-center gap-4 mb-3">
          <span className="text-sm font-medium text-gray-700">STATUS</span>
          <div className="flex items-center gap-3 text-sm">
            <span>• 전체 {stats.total}</span>
            <span>• 미승인 {stats.pending}</span>
            <span>• 수락 {stats.accepted}</span>
            <span>• 완료 {stats.completed}</span>
          </div>
        </div>

        {/* 정렬 */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">SORT</span>
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => setSortBy("latest")}
              className={
                sortBy === "latest"
                  ? "text-green-600 font-medium"
                  : "text-gray-600"
              }
            >
              • 최근 신청순
            </button>
            <button
              onClick={() => setSortBy("oldest")}
              className={
                sortBy === "oldest"
                  ? "text-green-600 font-medium"
                  : "text-gray-600"
              }
            >
              • 오래된 신청순
            </button>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[100px]">상태</TableHead>
              <TableHead>신청자</TableHead>
              <TableHead>신청자 연락처</TableHead>
              <TableHead>신청 메시지</TableHead>
              <TableHead>신청일시</TableHead>
              <TableHead>멘토링 일정</TableHead>
              <TableHead>취소 일자</TableHead>
              <TableHead className="text-center">신청 정보</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedApplications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-12 text-gray-500"
                >
                  신청 내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              sortedApplications.map((app) => (
                <TableRow key={app.id} className="hover:bg-gray-50">
                  <TableCell>
                    <Badge
                      variant={STATUS_CONFIG[app.status].variant}
                      className={STATUS_CONFIG[app.status].className}
                    >
                      {STATUS_CONFIG[app.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{app.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {app.user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {app.user.phone || "-"}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="truncate text-sm text-gray-600">
                      {app.message || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(app.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {app.scheduledAt ? formatDate(app.scheduledAt) : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {app.canceledAt ? formatDate(app.canceledAt) : "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetail(app)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
