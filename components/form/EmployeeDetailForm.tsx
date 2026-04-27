/**
 * Copyright(C) 2026 Luvina
 * [EmployeeDetailForm.tsx], 26/04/2026 tranledat
 */
"use client";

import React from 'react'
import { useADM003 } from '@/hooks/useADM003';

/**
 * Component hiển thị màn hình chi tiết thông tin nhân viên (ADM003).
 * Kết nối với hook useADM003 để lấy dữ liệu và xử lý các sự kiện (Xóa, Sửa, Quay lại).
 * @return JSX.Element Giao diện của màn hình chi tiết nhân viên.
 */
function EmployeeDetailForm() {
    const { 
        employee, 
        isLoading, 
        errorMessage, 
        handleDelete, 
        handleEdit, 
        handleBack 
    } = useADM003();

    if (isLoading) {
        return <div className="p-3">読み込み中...</div>;
    }

    if (errorMessage) {
        return (
            <div className="p-3">
                <div className="text-danger mb-3">{errorMessage}</div>
                <button type="button" onClick={handleBack} className="btn btn-secondary btn-sm">戻る</button>
            </div>
        );
    }

    if (!employee) {
        return <div className="p-3">データが見つかりません。</div>;
    }

    return (
        <>
            <form className="c-form box-shadow">
                <ul className="show-data">
                <li className="title">情報確認</li>
                <li className="form-group row d-flex">
                    <label className="col-form-label col-sm-2">アカウント名</label>
                    <div className="col-sm col-sm-10">{employee.employeeLoginId}</div>
                </li>
                <li className="form-group row d-flex">
                    <label className="col-form-label col-sm-2">グループ</label>
                    <div className="col-sm col-sm-10">{employee.departmentName}</div>
                </li>
                <li className="form-group row d-flex">
                    <label className="col-form-label col-sm-2">氏名</label>
                    <div className="col-sm col-sm-10">{employee.employeeName}</div>
                </li>
                <li className="form-group row d-flex">
                    <label className="col-form-label col-sm-2">カタカナ氏名</label>
                    <div className="col-sm col-sm-10">{employee.employeeNameKana}</div>
                </li>
                <li className="form-group row d-flex">
                    <label className="col-form-label col-sm-2">生年月日</label>
                    <div className="col-sm col-sm-10">{employee.employeeBirthDate?.replace(/-/g, '/')}</div>
                </li>
                <li className="form-group row d-flex">
                    <label className="col-form-label col-sm-2">メールアドレス</label>
                    <div className="col-sm col-sm-10">{employee.employeeEmail}</div>
                </li>
                <li className="form-group row d-flex  bor-none">
                    <label className="col-form-label col-sm-2">電話番号</label>
                    <div className="col-sm col-sm-10">{employee.employeeTelephone}</div>
                </li>

                {employee.certifications && employee.certifications.length > 0 && employee.certifications.map((cert, index) => (
                    <React.Fragment key={cert.certificationId || index}>
                        <li className="title mt-12"><a href="#!">日本語能力</a></li>
                        <li className="form-group row d-flex">
                            <label className="col-form-label col-sm-2">資格</label>
                            <div className="col-sm col-sm-10">{cert.certificationName}</div>
                        </li>
                        <li className="form-group row d-flex">
                            <label className="col-form-label col-sm-2">資格交付日</label>
                            <div className="col-sm col-sm-10">{cert.startDate?.replace(/-/g, '/')}</div>
                        </li>
                        <li className="form-group row d-flex">
                            <label className="col-form-label col-sm-2">失効日</label>
                            <div className="col-sm col-sm-10">{cert.endDate?.replace(/-/g, '/')}</div>
                        </li>
                        <li className="form-group row d-flex">
                            <label className="col-form-label col-sm-2">点数</label>
                            <div className="col-sm col-sm-10">{cert.score}</div>
                        </li>
                    </React.Fragment>
                ))}

                <li className="form-group row d-flex">
                    <div className="btn-group col-sm col-sm-10 ml">
                    <button type="button" onClick={handleEdit} className="btn btn-primary btn-sm">編集</button>
                    <button type="button" onClick={handleDelete} className="btn btn-secondary btn-sm">削除</button>
                    <button type="button" onClick={handleBack} className="btn btn-secondary btn-sm">戻る</button>
                    </div>
                </li>
                </ul>
            </form>
        </>
    )
}

export default EmployeeDetailForm