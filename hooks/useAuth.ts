import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, isTokenExpired } from '@/lib/auth/token';

import { ROUTES } from '@/constants/routes';

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token?.accessToken)) {
      router.push(ROUTES.LOGIN);
    }
  }, [router]);
};

const useGuest = () => {
    const router = useRouter();
  
    useEffect(() => {
      const token = getToken();
      if (token && !isTokenExpired(token?.accessToken)) {
        router.push(ROUTES.ADM002);
      }
    }, [router]);
}


export { useAuth, useGuest };
