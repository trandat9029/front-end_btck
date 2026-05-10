/**
 * Copyright(C) 2026 Luvina
 * [EmployeeTable.tsx], 10/05/2026 tranledat
 */

'use client';

import React, { Fragment } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { EmployeeListItem, SortOrder } from '@/types/employee';
import { formatDateDisplay } from '@/lib/utils/date';
import { ROUTES } from '@/constants/routes';

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
  onSortChange: (sortKey: 'employeeName' | 'certification' | 'endDate') => Promise<void>;
  emptyMessage?: string;
}

/**
 * Component hiển thị bảng danh sách nhân viên với tính năng sắp xếp và phân trang.
 * 
 * @author tranledat
 */
const EmployeeTable = ({
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
  emptyMessage = '検索条件に該当するユーザが見つかりません。',
}: Props) => {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  /**
   * Tạo URL chi tiết nhân viên kèm theo các tham số tìm kiếm hiện tại (để quay lại đúng trang).
   */
  const getHref = (id: number) => {
    return `${ROUTES.ADM003}?id=${id}${queryString ? `&${queryString}` : ''}`;
  };

  /**
   * Hiển thị nhãn sắp xếp kèm mũi tên chỉ hướng.
   */
  const renderSortLabel = (label: string, sortOrder: SortOrder) => {
    return `${label} ${sortOrder === 'asc' ? '▲▽' : '△▼'}`;
  };

  return (
    <div className="row row-table">
      <div className="css-grid-table box-shadow">
        {/* Table Header */}
        <div className="css-grid-table-header">
          <div>ID</div>
          <div
            className="sort-header-button"
            onClick={() => void onSortChange('employeeName')}
          >
            {renderSortLabel('氏名', employeeNameSort)}
          </div>
          <div>生年月日</div>
          <div>グループ</div>
          <div>メールアドレス</div>
          <div>電話番号</div>
          <div
            className="sort-header-button"
            onClick={() => void onSortChange('certification')}
          >
            {renderSortLabel('日本語能力', certificationSort)}
          </div>
          <div
            className="sort-header-button"
            onClick={() => void onSortChange('endDate')}
          >
            {renderSortLabel('失効日', endDateSort)}
          </div>
          <div>点数</div>
        </div>

        {/* Loading / Error / Empty States */}
        {isLoading && <div className="p-3">Loading...</div>}
        {!isLoading && errorMessage && (
          <div className="p-3 text-danger">{errorMessage}</div>
        )}
        {!isLoading && !errorMessage && employees.length === 0 && (
          <div className="p-3">{emptyMessage}</div>
        )}

        {/* Table Body */}
        {!isLoading && !errorMessage && employees.length > 0 && (
          <div className="css-grid-table-body">
            {employees.map((e, index) => (
              <Fragment
                key={`${e.employeeId}-${e.certificationName ?? 'none'}-${e.endDate ?? 'none'}-${index}`}
              >
                <div className="bor-l-none text-center">
                  <Link href={getHref(e.employeeId)} className="no-underline text-black hover-primary">
                    {e.employeeId}
                  </Link>
                </div>
                <div title={e.employeeName}>{e.employeeName}</div>
                <div>{formatDateDisplay(e.employeeBirthDate)}</div>
                <div>{e.departmentName}</div>
                <div>{e.employeeEmail}</div>
                <div>{e.employeeTelephone}</div>
                <div>{e.certificationName}</div>
                <div>{formatDateDisplay(e.endDate)}</div>
                <div>{e.score ?? ''}</div>
              </Fragment>
            ))}
          </div>
        )}

        {/* Pagination Section */}
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
                      page === currentPage ? 'text-dark' : 'text-primary'
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
};

export default EmployeeTable;
