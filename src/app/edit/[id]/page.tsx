'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { getRoadmap, type RoadmapNode } from '@/api/roadmap'
import RoadmapEditor from '@/components/roadmapEditor'
import styled from '@emotion/styled'

interface TransformedNode {
  id: string
  title: string
  x: number
  y: number
}

interface TransformedEdge {
  from: string
  to: string
}

// 재귀적으로 모든 노드를 평탄화하여 변환하는 함수
const transformNodes = (
  nodes: RoadmapNode[],
  result: { nodes: TransformedNode[]; edges: TransformedEdge[] } = {
    nodes: [],
    edges: [],
  }
) => {
  nodes.forEach((node) => {
    // 현재 노드 추가
    result.nodes.push({
      id: String(node.id),
      title: node.title,
      x: node.x_coord,
      y: node.y_coord,
    })

    // 자식 노드들과의 엣지 추가
    node.children.forEach((child) => {
      result.edges.push({
        from: String(node.id),
        to: String(child.id),
      })
    })

    // 자식 노드들에 대해 재귀적으로 처리
    if (node.children.length > 0) {
      transformNodes(node.children, result)
    }
  })

  return result
}

export default function EditRoadmapPage() {
  const params = useParams()
  const id = Number(params.id)

  const {
    data: roadmap,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['roadmap', id],
    queryFn: () => getRoadmap(id),
  })

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>로드맵을 불러오는 중...</LoadingText>
      </LoadingContainer>
    )
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorText>로드맵을 불러오는데 실패했습니다.</ErrorText>
        <ErrorDetail>{(error as Error).message}</ErrorDetail>
      </ErrorContainer>
    )
  }

  if (!roadmap) {
    return (
      <ErrorContainer>
        <ErrorText>로드맵을 찾을 수 없습니다.</ErrorText>
      </ErrorContainer>
    )
  }

  // 모든 노드와 엣지를 변환
  const { nodes: transformedNodes, edges: transformedEdges } = transformNodes(
    roadmap.nodes
  )

  return (
    <RoadmapEditor
      mode="edit"
      roadmapId={id}
      initialTitle={roadmap.title}
      initialDescription={roadmap.description}
      initialNodes={transformedNodes}
      initialEdges={transformedEdges}
    />
  )
}

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
`

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

const LoadingText = styled.p`
  font-size: 1rem;
  color: #6b7280;
`

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 0.5rem;
`

const ErrorText = styled.p`
  font-size: 1.25rem;
  font-weight: 500;
  color: #ef4444;
`

const ErrorDetail = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
`
