import React from 'react'
import styled from '@emotion/styled'
import Logo from '@/assets/logo'

const Sidebar = styled.aside`
  width: 280px;
  padding: 1.5rem;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
`

const SearchInput = styled.input`
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin-bottom: 16px;
`

const Menu = styled.div`
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 15px;
`

const MenuItem = styled.div<{ active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  background-color: ${(props) => (props.active ? '#f8f8f8' : 'transparent')};
  color: #000;
  font-weight: ${(props) => (props.active ? 'bold' : 'normal')};
  cursor: pointer;
  margin-bottom: 0.25rem;
`

const Hr = styled.hr`
  width: calc(100% + 3rem);
  margin-left: -1.5rem;
  border: 1px solid #dedede;
  margin-bottom: 16px;
  margin-top: 0px;
`

const LogoutButton = styled.button`
  margin-top: auto;
  margin-bottom: 40px;
  padding: 0.5rem;
  background-color: #000;
  color: #fff;
  border-radius: 0.375rem;
  width: 100%;
`

export default function LeftSidebar() {
  return (
    <Sidebar>
      <h1
        style={{
          fontWeight: 'bold',
          fontSize: '1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <Logo />
        RoadmapMaker
      </h1>
      <Hr />
      <SearchInput placeholder="로드맵 검색..." />
      <Hr />
      <Menu>
        <p style={{ color: '#6d6d6d' }}>메인 기능</p>
        <div>
          <MenuItem active>🗂️ 로드맵 보러가기</MenuItem>
          <MenuItem>🪄 로드맵 만들기</MenuItem>
        </div>
      </Menu>
      <Hr />
      <Menu>
        <p style={{ color: '#6d6d6d' }}>마이페이지</p>
        <div>
          <MenuItem>📌 저장한 로드맵</MenuItem>
          <MenuItem>✏️ 로드맵 수정 & 삭제</MenuItem>
        </div>
      </Menu>
      <LogoutButton>로그아웃</LogoutButton>
    </Sidebar>
  )
}
