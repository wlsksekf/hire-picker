'use client';

import { createContext } from 'react';

// 테마 모드(light/dark)를 전역적으로 관리하기 위한 React Context
export const ThemeModeContext = createContext(null);