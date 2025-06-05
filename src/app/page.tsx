'use client'
import styled from '@emotion/styled'

export default function Home() {
  return (
    <Container>
      <h1>Hello World</h1>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`
