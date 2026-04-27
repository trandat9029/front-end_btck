/**
 * Copyright(C) 2026 Luvina
 * [page.tsx], 26/04/2026 tranledat
 */
"use client";

import { Suspense } from 'react';
import EmployeeDetailForm from "@/components/form/EmployeeDetailForm";

export default function EmployeeDetailPage() {
  return (
    <div className="row">
      <Suspense fallback={<div>読み込み中...</div>}>
        <EmployeeDetailForm />
      </Suspense>
    </div>
  );
}

