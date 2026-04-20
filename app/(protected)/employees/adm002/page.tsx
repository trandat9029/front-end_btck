/**
 * Copyright(C) 2026 Luvina
 * [page.tsx], 12/04/2026 tranledat
 */
"use client";

import { useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import EmployeeTable from "@/components/tables/EmployeeTable";
import { MAX_LENGTH } from "@/constants/employee";
import { useAuth } from "@/hooks/useAuth";
import { useADM002 } from "@/hooks/useADM002";

/**
 * Man hinh danh sach nhan vien (ADM002), ho tro tim kiem, sap xep va phan trang.
 *
 * @author tranledat
 */
export default function EmployeeListPage() {
  useAuth();
  const router = useRouter();

  const {
    departments,
    employees,
    isLoading,
    errorMessage,
    departmentErrorMessage,
    employeeName,
    employeeNameErrorMessage,
    departmentId,
    setDepartmentId,
    currentPage,
    totalPages,
    visiblePages,
    employeeNameSort,
    certificationSort,
    endDateSort,
    handleEmployeeNameChange,
    handleSearch,
    handlePageChange,
    handleSortChange,
  } = useADM002();

  useEffect(() => {
    if (currentPage > totalPages) {
      void handlePageChange(totalPages);
    }
  }, [currentPage, handlePageChange, totalPages]);

  /**
   * Submit form t�m ki?m c?a ADM002 v� chuy?n ph?n x? l� d? li?u xu?ng hook.
   */
  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSearch(employeeName.trim());
  };

  return (
    <>
      <div className="search-memb">
        <h1 className="title">
          会員名称で会員を検索します。検索条件無しの場合は全て表示されます。
        </h1>
        <form className="c-form" onSubmit={handleSearchSubmit}>
          <ul className="d-flex">
            <li className="form-group row">
              <label className="col-form-label">氏名:</label>
              <div className="col-sm">
                <input
                  type="text"
                  value={employeeName}
                  maxLength={MAX_LENGTH}
                  aria-invalid={employeeNameErrorMessage ? "true" : "false"}
                  onChange={(event) => handleEmployeeNameChange(event.target.value)}
                />
                {employeeNameErrorMessage && (
                  <div className="error-message">{employeeNameErrorMessage}</div>
                )}
              </div>
            </li>
            <li className="form-group row">
              <label className="col-form-label">グループ:</label>
              <div className="col-sm">
                <select
                  className="form-select"
                  value={departmentId}
                  onChange={(event) => setDepartmentId(event.target.value)}
                >
                  <option value="">全て</option>
                  {departments.map((department) => (
                    <option
                      key={department.department_id}
                      value={String(department.department_id)}
                    >
                      {department.department_name}
                    </option>
                  ))}
                </select>
              </div>
            </li>
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
                  onClick={() => router.push("/employees/edit")}
                  className="btn btn-secondary btn-sm"
                >
                  新規追加
                </button>
              </div>
            </li>
          </ul>
        </form>
        {departmentErrorMessage && (
          <div className="text-danger mt-2">{departmentErrorMessage}</div>
        )}
      </div>

      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        errorMessage={errorMessage}
        currentPage={currentPage}
        totalPages={totalPages}
        visiblePages={visiblePages}
        employeeNameSort={employeeNameSort}
        certificationSort={certificationSort}
        endDateSort={endDateSort}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
      />
    </>
  );
}
