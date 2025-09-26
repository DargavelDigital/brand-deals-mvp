import { cookies } from 'next/headers'

// Cookie name constants
export const CK_TIKTOK_CONNECTED = 'tiktok_connected' // non-HttpOnly, readable by the UI
export const CK_TIKTOK_ACCESS = 'tiktok_access_token' // HttpOnly
export const CK_TIKTOK_REFRESH = 'tiktok_refresh_token' // HttpOnly
export const CK_TIKTOK_STATE = 'tiktok_state' // HttpOnly, short-lived

// Helper functions
export const getCookie = async (name: string) => (await cookies()).get(name)?.value
export const clearCookie = async (name: string) => (await cookies()).set(name, '', { path: '/', maxAge: 0 })
