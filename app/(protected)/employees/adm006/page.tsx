'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import * as Messages from '@/constants/messages';

export default function EmployeeCompletePage() {
  useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('msg') || Messages.MSG_SUCCESS_COMPLETED;

  return (
    <div className="box-shadow">
      <div className="notification-box">
        <h1 className="msg-title">{message}</h1>
        <div className="notification-box-btn">
          <button type="button" onClick={() => router.push('/employees/adm002')} className="btn btn-primary btn-sm">OK</button>
        </div>
      </div>
    </div>
  );
}
