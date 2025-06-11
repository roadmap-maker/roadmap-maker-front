'use client'

import styled from '@emotion/styled'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from '@/api/auth'

export default function Signin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('회원가입이 완료되었습니다. 로그인해주세요.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      await login({ username, password })
      router.push('/') // 로그인 성공 시 메인 페이지로 이동
    } catch (err: any) {
      setError(err.response?.data?.message || '로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <h1>로그인</h1>
        <InputContainer>
          <Input
            type="text"
            placeholder="아이디를 입력하세요"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}
        </InputContainer>

        <ButtonContainer>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
          <Link href="/signup">
            <GrayText>회원이 아니신가요? </GrayText>
            <BlackText>회원가입</BlackText>
          </Link>
        </ButtonContainer>
      </Form>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 10px 4px rgba(0, 0, 0, 0.07);
  padding: 20px;
  border-radius: 10px;
  gap: 70px;
`

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const Input = styled.input`
  width: 100%;
  height: 45px;
  padding: 10px;
  margin-bottom: 10px;
  min-width: 400px;
  border-radius: 5px;
  border: 1px solid #dedede;
  outline: none;
`

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  & > a {
    font-size: 12px;
    text-decoration: none;
  }
`

const GrayText = styled.span`
  color: #888;
`

const BlackText = styled.span`
  color: #000;
`

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`

const SuccessMessage = styled.p`
  color: #10b981;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`

const Button = styled.button<{ disabled: boolean }>`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  background: ${(props) => (props.disabled ? '#9ca3af' : '#000')};
  color: #fff;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s;

  &:hover {
    background: ${(props) => (props.disabled ? '#9ca3af' : '#333')};
  }
`
