'use client'

import styled from '@emotion/styled'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signup } from '@/api/auth'

export default function Signup() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordCheck, setPasswordCheck] = useState('')
  const [isPasswordMatch, setIsPasswordMatch] = useState(true)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setIsPasswordMatch(e.target.value === passwordCheck)
  }

  const handlePasswordCheckChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswordCheck(e.target.value)
    setIsPasswordMatch(e.target.value === password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!isPasswordMatch) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)

    try {
      await signup({ username, password })
      router.push('/signin?registered=true') // 회원가입 성공 시 로그인 페이지로 이동
    } catch (err: any) {
      setError(
        err.response?.data?.message || '회원가입 중 오류가 발생했습니다.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <h1>회원가입</h1>
        <InputContainer isPasswordMatch={isPasswordMatch}>
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
            onChange={handlePasswordChange}
            disabled={isLoading}
          />
          <Input
            type="password"
            placeholder="비밀번호를 재입력하세요"
            value={passwordCheck}
            onChange={handlePasswordCheckChange}
            disabled={isLoading}
          />
          {passwordCheck && (
            <PasswordMessage isMatch={isPasswordMatch}>
              {isPasswordMatch
                ? '비밀번호가 일치합니다'
                : '비밀번호가 일치하지 않습니다'}
            </PasswordMessage>
          )}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </InputContainer>
        <ButtonContainer>
          <Button type="submit" disabled={isLoading || !isPasswordMatch}>
            {isLoading ? '회원가입 중...' : '회원가입'}
          </Button>
          <Link href="/signin">
            <GrayText>이미 회원이신가요? </GrayText>
            <BlackText>로그인</BlackText>
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

const InputContainer = styled.div<{ isPasswordMatch: boolean }>`
  display: flex;
  flex-direction: column;

  & > p {
    font-size: 12px;
    color: ${({ isPasswordMatch }) => (isPasswordMatch ? 'green' : 'red')};
  }
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

const PasswordMessage = styled.p<{ isMatch: boolean }>`
  font-size: 12px;
  color: ${({ isMatch }) => (isMatch ? '#10b981' : '#ef4444')};
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
`

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`
