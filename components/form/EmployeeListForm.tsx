/**
 * Copyright(C) 2026 Luvina
 * [EmployeeListForm.tsx], 10/05/2026 tranledat
 */

'use client';

import React from 'react';
import EmployeeTable from '@/components/tables/EmployeeTable';
import { MAX_LENGTH } from '@/constants/employee';
import { useADM002 } from '@/hooks/useADM002';

/**
 * Component hiển thị danh sách nhân viên và form tìm kiếm (ADM002).
 * Kết nối với hook useADM002 để quản lý việc tìm kiếm, phân trang và sắp xếp.
 * 
 * @author tranledat
 */
const EmployeeListForm = () => {
  const {
    departments,
    employees,
    isLoading,
    errors,
    employeeParams,
    totalPages,
    visiblePages,
    handleSearchFieldChange,
    handleSearchFormSubmit,
    handlePageChange,
    handleSortChange,
    handleNavigateToAddPage,
  } = useADM002();

  return (
    <>
      {/* Search Section: Khu vực tìm kiếm nhân viên */}
      <div className="search-memb">
        <h1 className="title">
          会員名称で会員を検索します。検索条件無しの場合は全て表示されます。
        </h1>
        <form className="c-form" onSubmit={handleSearchFormSubmit}>
          <ul className="d-flex">
            {/* Tên nhân viên */}
            <li className="form-group row">
              <label className="col-form-label">氏名:</label>
              <div className="col-sm">
                <input
                  type="text"
                  value={employeeParams.employeeName}
                  maxLength={MAX_LENGTH}
                  aria-invalid={!!errors.employeeName}
                  onChange={(e) => handleSearchFieldChange('employeeName', e.target.value)}
                />
                {errors.employeeName && (
                  <div className="error-message">{errors.employeeName}</div>
                )}
              </div>
            </li>

            {/* Nhóm (Department) */}
            <li className="form-group row">
              <label className="col-form-label">グループ:</label>
              <div className="col-sm">
                <select
                  className="form-select"
                  value={employeeParams.departmentId}
                  onChange={(e) => handleSearchFieldChange('departmentId', e.target.value)}
                >
                  <option value="">全て</option>
                  {departments.map((dept) => (
                    <option key={dept.departmentId} value={String(dept.departmentId)}>
                      {dept.departmentName}
                    </option>
                  ))}
                </select>
              </div>
            </li>

            {/* Buttons: Các nút thao tác chính */}
            <li className="form-group row">
              <div className="btn-group">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isLoading}
                >
                  検索
                </button>
                <button
                  type="button"
                  onClick={handleNavigateToAddPage}
                  className="btn btn-secondary btn-sm"
                >
                  新規追加
                </button>
              </div>
            </li>
          </ul>
        </form>
        {errors.department && (
          <div className="text-danger mt-2">{errors.department}</div>
        )}
      </div>

      {/* Table Section: Hiển thị danh sách kết quả */}
      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        errorMessage={errors.general}
        currentPage={employeeParams.page}
        totalPages={totalPages}
        visiblePages={visiblePages}
        employeeNameSort={employeeParams.ordEmployeeName}
        certificationSort={employeeParams.ordCertificationName}
        endDateSort={employeeParams.ordEndDate}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />
    </>
  );
};

export default EmployeeListForm;
