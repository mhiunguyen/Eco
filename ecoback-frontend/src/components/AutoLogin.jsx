import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export default function AutoLogin() {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const autoLoginFlag = localStorage.getItem('autoLoginAdmin');
    console.log('🔍 AutoLogin check:', {
      autoLoginFlag,
      isAuthenticated,
      shouldRun: autoLoginFlag === 'true' && !isAuthenticated
    });

    // Auto-login khi:
    // 1. Chưa đăng nhập
    // 2. Có flag trong localStorage
    const shouldAutoLogin = !isAuthenticated && autoLoginFlag === 'true';

    if (shouldAutoLogin) {
      console.log('🔐 Starting fake auto-login as admin (demo mode)...');
      
      // Fake admin user và token
      const fakeAdminUser = {
        _id: 'demo-admin-id',
        fullName: 'Administrator (Demo)',
        email: 'admin@ecoback.com',
        phone: '0999999999',
        role: 'admin',
        isVerified: true
      };
      
      const fakeToken = 'demo-token-for-mobile-testing';
      
      // Set trực tiếp vào store và localStorage
      localStorage.setItem('token', fakeToken);
      useAuthStore.setState({
        user: fakeAdminUser,
        token: fakeToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      console.log('✅ Fake auto-login successful! (Demo mode)');
      alert('✅ Demo mode activated! Logged in as Admin (no backend required)');
    } else {
      console.log('⏭️ Skip auto-login');
    }
  }, [isAuthenticated]);

  return null; // Component này không render gì
}
