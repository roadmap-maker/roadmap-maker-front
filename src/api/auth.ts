import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = 'http://localhost:8000'

export interface SignupRequest {
  username: string
  password: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  date_joined: string
  profile: {
    created_at: string
    updated_at: string
  }
}

export interface LoginResponse {
  message: string
  user: User
  refresh: string
  access: string
}

export const signup = async (data: SignupRequest): Promise<void> => {
  await axios.post(`${API_BASE_URL}/auth/signup`, data)
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, data)
  const { access, refresh } = response.data

  // 토큰을 쿠키에 저장
  Cookies.set('access_token', access, {
    expires: 1, // 1일
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })
  Cookies.set('refresh_token', refresh, {
    expires: 7, // 7일
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  })

  return response.data
}

export const logout = () => {
  Cookies.remove('access_token')
  Cookies.remove('refresh_token')
}

export const getAccessToken = () => {
  return Cookies.get('access_token')
}

// axios 인스턴스 생성
export const authAxios = axios.create({
  baseURL: API_BASE_URL,
})

// 요청 인터셉터 추가
authAxios.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})