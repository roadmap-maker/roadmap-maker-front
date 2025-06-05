'use client'

import styled from '@emotion/styled'
import Link from 'next/link'
import { useState } from 'react'
export default function Signup() {
  const [password, setPassword] = useState('')
  const [passwordCheck, setPasswordCheck] = useState('')
  const [isPasswordMatch, setIsPasswordMatch] = useState(true)

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

  return (
    <Container>
      <Form>
        <h1>회원가입</h1>
        <InputContainer isPasswordMatch={isPasswordMatch}>
          <Input type="text" placeholder="아이디를 입력하세요" />
          <Input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={handlePasswordChange}
          />
          <Input
            type="password"
            placeholder="비밀번호를 재입력하세요"
            value={passwordCheck}
            onChange={handlePasswordCheckChange}
          />
          <p>
            {passwordCheck
              ? isPasswordMatch
                ? '비밀번호가 일치합니다'
                : '비밀번호가 일치하지 않습니다'
              : ''}
          </p>
        </InputContainer>
        <ButtonContainer>
          <Button type="submit">회원가입</Button>
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

const Button = styled.button`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  background: #000;
  color: #fff;
  cursor: pointer;
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
