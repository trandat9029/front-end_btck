// =========================
// 5. components/EmployeeTable.tsx
// =========================
"use client";

import { Fragment } from "react";
import Link from "next/link";
import { EmployeeListItem, SortOrder } from "@/types/employee";

interface Props {
  employees: EmployeeListItem[];
  isLoading: boolean;
  errorMessage: string;
  currentPage: number;
  totalPages: number;
  visiblePages: number[];
  employeeNameSort: SortOrder;
  certificationSort: SortOrder;
  endDateSort: SortOrder;
  onPageChange: (page: number) => Promise<void>;
  onSortChange: (
    sortKey: "employeeName" | "certification" | "endDate"
  ) => Promise<void>;
  emptyMessage?: string;
}

export default function EmployeeTable({
  employees,
  isLoading,
  errorMessage,
  currentPage,
  totalPages,
  visiblePages,
  employeeNameSort,
  certificationSort,
  endDateSort,
  onPageChange,
  onSortChange,
  emptyMessage = "検索条件に該当するユーザが見つかりません。",
}: Props) {
  const renderSortLabel = (label: string, sortOrder: SortOrder) => {
    return `${label} ${sortOrder === "asc" ? "▲▽" : "△▼"}`;
  };

  return (
    <div className="row row-table">
      <div className="css-grid-table box-shadow">
        <div className="css-grid-table-header">
          <div>ID</div>
          <div
            
            className="sort-header-button"
            onClick={() => void onSortChange("employeeName")}
          >
            {renderSortLabel("氏名", employeeNameSort)}
          </div>
          <div>生年月日</div>
          <div>グループ</div>
          <div>メールアドレス</div>
          <div>電話番号</div>
          <div
           
            className="sort-header-button"
            onClick={() => void onSortChange("certification")}
          >
            {renderSortLabel("日本語能力", certificationSort)}
          </div>
          <div
            
            className="sort-header-button"
            onClick={() => void onSortChange("endDate")}
          >
            {renderSortLabel("失効日", endDateSort)}
          </div>
          <div>点数</div>
        </div>

        {isLoading && <div className="p-3">Loading...</div>}
        {!isLoading && errorMessage && <div className="p-3 text-danger">{errorMessage}</div>}
        {!isLoading && !errorMessage && employees.length === 0 && (
          <div className="p-3">{emptyMessage}</div>
        )}
        {!isLoading && !errorMessage && employees.length > 0 && (
          <div className="css-grid-table-body">
            {employees.map((e, index) => (
              <Fragment
                key={`${e.employeeId}-${e.certificationName ?? "none"}-${
                  e.endDate ?? "none"
                }-${index}`}
              >
                <div className="bor-l-none text-center">
                  <Link href="/employees/detail" className="no-underline text-black">
                    {e.employeeId}
                  </Link>
                </div>
                <div title={e.employeeName}>{e.employeeName}</div>
                <div>{e.employeeBirthDate}</div>
                <div>{e.departmentName}</div>
                <div>{e.employeeEmail}</div>
                <div>{e.employeeTelephone}</div>
                <div>{e.certificationName}</div>
                <div>{e.endDate}</div>
                <div>{e.score ?? ""}</div>
              </Fragment>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagin">
            <button
              type="button"
              className="btn btn-sm btn-pre btn-falcon-default"
              onClick={() => void onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              &lt;
            </button>
            {visiblePages.map((page, index) => {
              const previousPage = visiblePages[index - 1];
              const shouldShowEllipsis = previousPage && page - previousPage > 1;

              return (
                <Fragment key={page}>
                  {shouldShowEllipsis && (
                    <span className="btn btn-sm btn-falcon-default">...</span>
                  )}
                  <button
                    type="button"
                    className={`btn btn-sm btn-falcon-default ${
                      page === currentPage ? "text-dark" : "text-primary"
                    }`}
                    onClick={() => void onPageChange(page)}
                    disabled={page === currentPage || isLoading}
                  >
                    {page}
                  </button>
                </Fragment>
              );
            })}
            <button
              type="button"
              className="btn btn-sm btn-next btn-falcon-default"
              onClick={() => void onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
