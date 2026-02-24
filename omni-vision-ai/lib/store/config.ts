import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { APIConfig, defaultAPIConfig } from '@/lib/api/config';

interface ConfigState {
  // API 配置
  apiConfig: APIConfig;
  // 用户偏好
  preferences: {
    language: 'zh' | 'en';
    theme: 'light' | 'dark' | 'system';
    defaultImageAPI: string;
    defaultVideoAPI: string;
  };
  // 操作
  setAPIConfig: (config: Partial<APIConfig>) => void;
  setAPIKey: (api: keyof APIConfig, key: string) => void;
  toggleAPI: (api: keyof APIConfig) => void;
  setPreferences: (prefs: Partial<ConfigState['preferences']>) => void;
  resetConfig: () => void;
  // 检查是否有可用的 API Key
  hasAnyAPIKey: () => boolean;
  getEnabledAPIs: () => string[];
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      apiConfig: defaultAPIConfig,
      preferences: {
        language: 'zh',
        theme: 'system',
        defaultImageAPI: 'auto',
        defaultVideoAPI: 'auto',
      },

      setAPIConfig: (config) =>
        set((state) => ({
          apiConfig: { ...state.apiConfig, ...config },
        })),

      setAPIKey: (api, key) =>
        set((state) => ({
          apiConfig: {
            ...state.apiConfig,
            [api]: { ...state.apiConfig[api], apiKey: key },
          },
        })),

      toggleAPI: (api) =>
        set((state) => ({
          apiConfig: {
            ...state.apiConfig,
            [api]: {
              ...state.apiConfig[api],
              enabled: !state.apiConfig[api].enabled,
            },
          },
        })),

      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      resetConfig: () =>
        set({
          apiConfig: defaultAPIConfig,
          preferences: {
            language: 'zh',
            theme: 'system',
            defaultImageAPI: 'auto',
            defaultVideoAPI: 'auto',
          },
        }),

      hasAnyAPIKey: () => {
        const { apiConfig } = get();
        return Object.values(apiConfig).some((api) => api.apiKey && api.apiKey.length > 0);
      },

      getEnabledAPIs: () => {
        const { apiConfig } = get();
        return Object.entries(apiConfig)
          .filter(([_, config]) => config.enabled && config.apiKey)
          .map(([name]) => name);
      },
    }),
    {
      name: 'omni-vision-config',
    }
  )
);
