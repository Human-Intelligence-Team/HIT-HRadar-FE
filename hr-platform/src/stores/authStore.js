import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';

import {
  loginApi,
  logoutApi,
  refreshApi,
} from '@/api/authApi';
import { getMyPermissionsApi } from '@/api/roleApi';

import router from '@/router';

export const useAuthStore = defineStore('auth', () => {

  /* ----------------------------
   * state
   * ---------------------------- */
  const accessToken = ref(null);
  const emptyUser = () => ({
    userId: null,
    role: '',
    companyId: null,
    employeeId: null,
  })

  const user = ref(emptyUser())
  const permissions = ref([])
  const loading = ref(false);

  /* ----------------------------
   * getters
   * ---------------------------- */
  const isLoggedIn = computed(() => !!accessToken.value && !!user.value?.userId);
  const isAdmin = computed(() => (user.value?.role || '').toUpperCase() === 'ADMIN');
  const hasPermission = (permKey) => {
    if (isAdmin.value) return true; // ADMIN은 모든 권한 허용
    return permissions.value.includes(permKey);
  };

  /* ----------------------------
   * utils
   * ---------------------------- */
  const setAccessToken = (token) => {
    accessToken.value = token;
    token
      ? localStorage.setItem('accessToken', token)
      : localStorage.removeItem('accessToken');
  };

  const resetUser = () => {
    user.value = emptyUser()
    localStorage.removeItem('user')
  }

  const setUserFromToken = (token) => {
    try {
      const payload = jwtDecode(token)
      user.value = {
        userId: payload.sub,
        role: (payload.role || '').toUpperCase(),
        companyId: payload.companyId,
        employeeId: payload.employeeId,
      }
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch {
      user.value = null
    }
  }


  const loadFromStorage = () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    if (token) accessToken.value = token;
    if (userStr) user.value = JSON.parse(userStr);

    const permsStr = localStorage.getItem('permissions');
    if (permsStr) permissions.value = JSON.parse(permsStr);
  };

  const clearAuthState = () => {
    setAccessToken(null);
    resetUser();
    router.push('/login');
  };

  /* ----------------------------
   * actions
   * ---------------------------- */
  const login = async ({ loginId, password, companyCode }) => {
    loading.value = true;

    try {
      const res = await loginApi(loginId, password, companyCode);
      const { success, data, message } = res.data;

      if (!success)
        return { success: false, message: message || "로그인 실패" };

      setAccessToken(data.accessToken);
      setUserFromToken(data.accessToken);

      await fetchPermissions(); // 로그인 후 권한 목록 가져오기

      return { success: true };
    } catch (e) {
      return {
        success: false,
        message: e.response?.data?.message || "로그인 오류",
      };
    } finally {
      loading.value = false;
    }
  };

  const refreshTokens = async () => {
    try {
      const res = await refreshApi();
      const { success, data } = res.data;

      if (!success) throw new Error();

      setAccessToken(data.accessToken);
      setUserFromToken(data.accessToken);
    } catch {
      clearAuthState();
    }
  };

  // const register = async (payload) => {
  //   try {
  //     const res = await registerApi(payload);
  //     const { success, message } = res.data;
  //
  //     if (!success) return { success: false, message };
  //     return { success: true };
  //   } catch (e) {
  //     return {
  //       success: false,
  //       message: e.response?.data?.message || "회원가입 오류",
  //     };
  //   }
  // };
  //
  // const checkLoginId = async (loginId) => {
  //   const res = await checkLoginIdApi(loginId);
  //   return res.data.data.exists;
  // };
  //
  // const checkNickname = async (nickname) => {
  //   const res = await checkNicknameApi(nickname);
  //   return res.data.data.exists;
  // };

  const logout = async () => {
    try {
      await logoutApi();
    } catch { /* empty */ }
    clearAuthState();
  };

  const fetchPermissions = async () => {
    try {
      if (!isLoggedIn.value) return;
      const res = await getMyPermissionsApi();
      if (res.data.success) {
        permissions.value = res.data.data;
        localStorage.setItem('permissions', JSON.stringify(permissions.value));
      }
    } catch (e) {
      console.error('Failed to fetch permissions', e);
    }
  };

  const firstAccessiblePath = () => {
    if (!user.value) return '/login'
    if (user.value.role === 'ADMIN') return '/admin/company-applications'

    // Check permission for the default landing page
    if (hasPermission('NOTICE_READ')) return '/notice'

    return '/my-profile'
  }

  // const loadProfile = async () => {
  //   try {
  //     const res = await getProfileApi()
  //     const { success, data } = res.data
  //     if (!success) throw new Error()
  //
  //     profile.value = {
  //       name: data.user.name,
  //       companyName: data.company.name,
  //     }
  //
  //     localStorage.setItem('profile', JSON.stringify(profile.value))
  //   } catch {
  //     clearAuthState()
  //   }
  // }

  return {
    accessToken,
    user,
    permissions,
    loading,

    isLoggedIn,
    isAdmin,
    hasPermission,

    setAccessToken,
    resetUser,
    setUserFromToken,
    loadFromStorage,
    clearAuthState,

    login,
    fetchPermissions,
    refreshTokens,
    // register,
    logout,

    // checkLoginId,
    // checkNickname,
    firstAccessiblePath
  };
});
