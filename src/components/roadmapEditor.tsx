'use client'

import React, { useState } from 'react'
import { v4 as uuid } from 'uuid'
import axios from 'axios'
import styled from '@emotion/styled'
import { useMutation } from '@tanstack/react-query'
import {
  createRoadmap,
  updateRoadmap,
  type CreateRoadmapRequest,
  type RoadmapNode,
} from '@/api/roadmap'
import LeftSidebar from './LeftSidebar'
import Logo from '@/assets/logo'

interface NodeType {
  id: string
  title: string
  x: number
  y: number
}

interface EdgeType {
  from: string
  to: string
}

interface EditorNode {
  title: string
  x_coord: number
  y_coord: number
  children: EditorNode[]
}

interface RoadmapEditorProps {
  mode?: 'create' | 'edit'
  roadmapId?: number
  initialTitle?: string
  initialDescription?: string
  initialNodes?: NodeType[]
  initialEdges?: EdgeType[]
}

interface SaveNode {
  title: string
  x_coord: number
  y_coord: number
  children: SaveNode[]
}

const transformNodesToTree = (
  nodes: NodeType[],
  edges: EdgeType[]
): EditorNode[] => {
  const nodeMap = new Map<string, EditorNode>()
  const rootNodes: EditorNode[] = []

  // 먼저 모든 노드를 맵에 추가
  nodes.forEach((node) => {
    nodeMap.set(node.id, {
      title: node.title,
      x_coord: node.x,
      y_coord: node.y,
      children: [],
    })
  })

  // 엣지를 순회하며 부모-자식 관계 설정
  edges.forEach((edge) => {
    const parentNode = nodeMap.get(edge.from)
    const childNode = nodeMap.get(edge.to)
    if (parentNode && childNode) {
      parentNode.children.push(childNode)
    }
  })

  // 루트 노드 찾기 (부모가 없는 노드들)
  const childIds = new Set(edges.map((edge) => edge.to))
  nodes.forEach((node) => {
    if (!childIds.has(node.id)) {
      const rootNode = nodeMap.get(node.id)
      if (rootNode) {
        rootNodes.push(rootNode)
      }
    }
  })

  return rootNodes
}

const transformNodesToSaveFormat = (
  nodes: NodeType[],
  edges: EdgeType[]
): SaveNode[] => {
  const nodeMap = new Map<string, SaveNode>()
  const rootNodes: SaveNode[] = []

  // 먼저 모든 노드를 맵에 추가
  nodes.forEach((node) => {
    nodeMap.set(node.id, {
      title: node.title,
      x_coord: node.x,
      y_coord: node.y,
      children: [],
    })
  })

  // 엣지를 순회하며 부모-자식 관계 설정
  edges.forEach((edge) => {
    const parentNode = nodeMap.get(edge.from)
    const childNode = nodeMap.get(edge.to)
    if (parentNode && childNode) {
      parentNode.children.push(childNode)
    }
  })

  // 루트 노드 찾기 (부모가 없는 노드들)
  const childIds = new Set(edges.map((edge) => edge.to))
  nodes.forEach((node) => {
    if (!childIds.has(node.id)) {
      const rootNode = nodeMap.get(node.id)
      if (rootNode) {
        rootNodes.push(rootNode)
      }
    }
  })

  return rootNodes
}

export default function RoadmapEditor({
  mode = 'create',
  roadmapId,
  initialTitle = '제목',
  initialDescription = '설명',
  initialNodes = [],
  initialEdges = [],
}: RoadmapEditorProps) {
  const [nodes, setNodes] = useState<NodeType[]>(initialNodes)
  const [edges, setEdges] = useState<EdgeType[]>(initialEdges)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [connectingFrom, setConnectingFrom] = useState<NodeType | null>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0 })
  const [editableNodeId, setEditableNodeId] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [editableTitle, setEditableTitle] = useState(false)
  const [editableDesc, setEditableDesc] = useState(false)
  const [titleText, setTitleText] = useState(initialTitle)
  const [descText, setDescText] = useState(initialDescription)
  const [showGuideTooltip, setShowGuideTooltip] = useState(false)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  const createRoadmapMutation = useMutation({
    mutationFn: createRoadmap,
    onSuccess: (data) => {
      alert('로드맵이 성공적으로 저장되었습니다!')
      console.log('저장된 로드맵:', data)
    },
    onError: (error) => {
      console.error('로드맵 저장 실패:', error)
      alert('로드맵 저장 중 오류가 발생했습니다.')
    },
  })

  const updateRoadmapMutation = useMutation({
    mutationFn: (data: CreateRoadmapRequest) => {
      if (!roadmapId) throw new Error('로드맵 ID가 필요합니다.')
      return updateRoadmap(roadmapId, data)
    },
    onSuccess: (data) => {
      alert('로드맵이 성공적으로 수정되었습니다!')
      console.log('수정된 로드맵:', data)
    },
    onError: (error) => {
      console.error('로드맵 수정 실패:', error)
      alert('로드맵 수정 중 오류가 발생했습니다.')
    },
  })

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (connectingFrom || isConnecting || e.shiftKey) return
    if (e.target !== e.currentTarget) return

    const rect = e.currentTarget.getBoundingClientRect()
    const newNode: NodeType = {
      id: uuid(),
      title: `노드 ${nodes.length + 1}`,
      x: e.clientX - rect.left - 80,
      y: e.clientY - rect.top - 20,
    }
    setNodes((prev) => [...prev, newNode])
  }

  const handleMouseDown = (e: React.MouseEvent, node: NodeType) => {
    if (e.shiftKey) {
      setConnectingFrom(node)
      setIsConnecting(true)
    } else {
      setDraggingId(node.id)
      setOffset({ x: e.clientX - node.x, y: e.clientY - node.y })
    }
  }

  const handleMouseUp = (targetNode?: NodeType) => {
    if (connectingFrom && targetNode && connectingFrom.id !== targetNode.id) {
      const exists = edges.find(
        (e) => e.from === connectingFrom.id && e.to === targetNode.id
      )
      if (!exists) {
        setEdges((prev) => [
          ...prev,
          { from: connectingFrom.id, to: targetNode.id },
        ])
      }
    }
    setDraggingId(null)
    setConnectingFrom(null)
    setIsConnecting(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvasRect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - canvasRect.left
    const y = e.clientY - canvasRect.top
    setCursor({ x, y })

    if (draggingId) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingId
            ? { ...n, x: e.clientX - offset.x, y: e.clientY - offset.y }
            : n
        )
      )
    }
  }

  const deleteNode = (nodeId: string) => {
    const descendantIds = getDescendants(nodeId)
    const deleteIds = new Set([nodeId, ...descendantIds])
    setNodes((prev) => prev.filter((n) => !deleteIds.has(n.id)))
    setEdges((prev) =>
      prev.filter((e) => !deleteIds.has(e.from) && !deleteIds.has(e.to))
    )
  }

  const getDescendants = (id: string): string[] => {
    const children = edges.filter((e) => e.from === id).map((e) => e.to)
    return children.flatMap((childId) => [childId, ...getDescendants(childId)])
  }

  const deleteEdge = (edge: EdgeType) => {
    setEdges((prev) =>
      prev.filter((e) => !(e.from === edge.from && e.to === edge.to))
    )
  }

  const handleSave = async () => {
    const saveNodes = transformNodesToSaveFormat(nodes, edges)

    const payload = {
      title: titleText,
      description: descText,
      nodes: saveNodes,
    }

    if (mode === 'edit') {
      updateRoadmapMutation.mutate(payload)
    } else {
      createRoadmapMutation.mutate(payload)
    }
  }

  const getConnectedNodes = (nodeId: string) => {
    const connectedEdges = edges.filter((edge) => edge.from === nodeId)
    return connectedEdges
      .map((edge) => {
        const targetNode = nodes.find((n) => n.id === edge.to)
        return targetNode ? { id: edge.to, title: targetNode.title } : null
      })
      .filter((node): node is { id: string; title: string } => node !== null)
  }

  return (
    <Container>
      <LeftSidebar />
      <Page>
        <Header>
          <HeaderContent>
            <Title onDoubleClick={() => setEditableTitle(true)}>
              {editableTitle ? (
                <StyledInput
                  autoFocus
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  onBlur={() => setEditableTitle(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape')
                      setEditableTitle(false)
                  }}
                />
              ) : (
                titleText
              )}
            </Title>
            <Description onDoubleClick={() => setEditableDesc(true)}>
              {editableDesc ? (
                <StyledInput
                  autoFocus
                  value={descText}
                  onChange={(e) => setDescText(e.target.value)}
                  onBlur={() => setEditableDesc(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape')
                      setEditableDesc(false)
                  }}
                />
              ) : (
                descText
              )}
            </Description>
          </HeaderContent>
          <HelpButton
            onMouseEnter={() => setShowGuideTooltip(true)}
            onMouseLeave={() => setShowGuideTooltip(false)}
          >
            ?
            <Tooltip visible={showGuideTooltip}>
              <TooltipTitle>로드맵 만들기 가이드</TooltipTitle>
              <TooltipList>
                <TooltipItem>
                  캔버스를 클릭하여 새로운 노드를 추가합니다.
                </TooltipItem>
                <TooltipItem>
                  노드를 드래그하여 원하는 위치로 이동합니다.
                </TooltipItem>
                <TooltipItem>
                  Shift 키를 누른 상태에서 노드를 클릭하면 연결 모드가
                  시작됩니다.
                </TooltipItem>
                <TooltipItem>
                  연결 모드에서 다른 노드를 클릭하면 두 노드가 연결됩니다.
                </TooltipItem>
                <TooltipItem>
                  노드를 더블클릭하여 제목을 수정할 수 있습니다.
                </TooltipItem>
                <TooltipItem>
                  노드에 마우스를 올리면 연결된 노드 목록이 표시됩니다.
                </TooltipItem>
                <TooltipItem>
                  연결된 노드 목록에서 '연결 끊기' 버튼을 클릭하여 연결을 삭제할
                  수 있습니다.
                </TooltipItem>
                <TooltipItem>
                  노드에서 우클릭하여 노드를 삭제할 수 있습니다.
                </TooltipItem>
              </TooltipList>
            </Tooltip>
          </HelpButton>
        </Header>

        <Canvas
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onContextMenu={(e) => {
            e.preventDefault()
          }}
        >
          <StyledSvg>
            {edges.map((edge, i) => {
              const from = nodes.find((n) => n.id === edge.from)
              const to = nodes.find((n) => n.id === edge.to)
              if (!from || !to) return null
              return (
                <line
                  key={i}
                  x1={from.x + 80}
                  y1={from.y + 20}
                  x2={to.x + 80}
                  y2={to.y + 20}
                  stroke="black"
                  strokeWidth={2}
                  markerEnd="url(#arrow)"
                  onClick={() => deleteEdge(edge)}
                  style={{ cursor: 'pointer' }}
                />
              )
            })}
            {connectingFrom && (
              <line
                x1={connectingFrom.x + 80}
                y1={connectingFrom.y + 20}
                x2={cursor.x}
                y2={cursor.y}
                stroke="gray"
                strokeDasharray="4"
                strokeWidth={1.5}
              />
            )}
            <defs>
              <marker
                id="arrow"
                markerWidth="10"
                markerHeight="7"
                refX="0"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="black" />
              </marker>
            </defs>
          </StyledSvg>

          {nodes.map((node) => (
            <Node
              key={node.id}
              style={{ left: node.x, top: node.y }}
              dragging={draggingId === node.id}
              onMouseDown={(e) => handleMouseDown(e, node)}
              onMouseUp={() => handleMouseUp(node)}
              onContextMenu={(e) => {
                e.preventDefault()
                if (confirm(`노드 "${node.title}" 삭제할까요?`))
                  deleteNode(node.id)
              }}
              onDoubleClick={() => setEditableNodeId(node.id)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              {editableNodeId === node.id ? (
                <StyledInput
                  autoFocus
                  value={node.title}
                  onChange={(e) => {
                    const value = e.target.value
                    setNodes((prev) =>
                      prev.map((n) =>
                        n.id === node.id ? { ...n, title: value } : n
                      )
                    )
                  }}
                  onBlur={() => setEditableNodeId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape')
                      setEditableNodeId(null)
                  }}
                />
              ) : (
                <>
                  {node.title}
                  {getConnectedNodes(node.id).length > 0 && (
                    <NodeTooltip visible={hoveredNodeId === node.id}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        연결된 노드
                      </div>
                      <TooltipConnectionList>
                        {getConnectedNodes(node.id).map((connectedNode) => (
                          <TooltipConnectionItem key={connectedNode.id}>
                            <span>→ {connectedNode.title}</span>
                            <TooltipDisconnectButton
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteEdge({
                                  from: node.id,
                                  to: connectedNode.id,
                                })
                              }}
                            >
                              연결 끊기
                            </TooltipDisconnectButton>
                          </TooltipConnectionItem>
                        ))}
                      </TooltipConnectionList>
                    </NodeTooltip>
                  )}
                </>
              )}
            </Node>
          ))}

          <ButtonPanel>
            <SaveButton
              onClick={handleSave}
              disabled={
                createRoadmapMutation.isPending ||
                updateRoadmapMutation.isPending
              }
            >
              {createRoadmapMutation.isPending ||
              updateRoadmapMutation.isPending ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="animate-spin"
                  >
                    <path
                      d="M8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0ZM8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2Z"
                      fill="currentColor"
                      fillOpacity="0.2"
                    />
                    <path
                      d="M8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0ZM8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2Z"
                      fill="currentColor"
                      className="opacity-75"
                    />
                  </svg>
                  {mode === 'edit' ? '수정 중...' : '저장 중...'}
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.3333 4L6 11.3333L2.66667 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {mode === 'edit' ? '수정하기' : '저장하기'}
                </>
              )}
            </SaveButton>
          </ButtonPanel>
        </Canvas>
      </Page>
      <RightSidebar>
        <InfoBox>
          <p>
            <strong>작성자</strong>
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#d1d5db',
                borderRadius: '50%',
              }}
            ></div>
            <span>이의진</span>
          </div>
        </InfoBox>
        <AdBox>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Logo />
            <p>RoadmapMaker</p>
          </div>
          <div>
            <h1>
              누군가의
              <br />
              로드맵에서
              <br />
              영감을 받아보세요
            </h1>
            <br />
            <p>
              나만의 로드맵을 만들기 전에
              <br />
              다른 사람들의 학습 설계를 살펴보세요
            </p>
          </div>
          <div>
            <button
              style={{
                width: '100%',
                backgroundColor: 'black',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '14px 0',
              }}
            >
              로드맵 보러가기
            </button>
          </div>
        </AdBox>
      </RightSidebar>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #fff;
  font-family: 'Pretendard', sans-serif;
`

const Page = styled.div`
  flex: 1;
  position: relative;
  padding: 2rem;
`

const Header = styled.div`
  margin-bottom: 2rem;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`

const HeaderContent = styled.div`
  flex: 1;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
`

const Description = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
`

const InfoBox = styled.div`
  width: 100%;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: #fff;
  font-size: 0.875rem;
`

const Canvas = styled.div`
  position: relative;
  width: 100%;
  height: calc(100% - 4rem);
  background-color: #f9fafb;
  border-radius: 0.5rem;
  overflow: hidden;
`

const ButtonPanel = styled.div`
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  z-index: 10;
`

const SaveButton = styled.button<{ disabled: boolean }>`
  padding: 0.75rem 1.5rem;
  background-color: ${(props) => (props.disabled ? '#d1d5db' : '#000')};
  color: ${(props) => (props.disabled ? '#9ca3af' : '#fff')};
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.disabled ? '#e5e7eb' : '#333')};
    transform: ${(props) => (props.disabled ? 'none' : 'translateY(-1px)')};
  }

  &:active {
    transform: ${(props) => (props.disabled ? 'none' : 'translateY(0)')};
  }
`

const StyledSvg = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`

const Node = styled.div<{ dragging?: boolean }>`
  position: absolute;
  width: 160px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  font-size: 0.875rem;
  user-select: none;
  cursor: ${(props) => (props.dragging ? 'grabbing' : 'grab')};
`

const StyledInput = styled.input`
  width: 100%;
  border: 1px solid #d1d5db;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
`

const HelpButton = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #d1d5db;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  position: relative;
  margin-left: 16px;

  &:hover {
    background-color: #f3f4f6;
  }
`

const Tooltip = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #1f2937;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  z-index: 1000;
  display: ${(props) => (props.visible ? 'block' : 'none')};
  margin-top: 8px;
  width: 280px;
  line-height: 1.5;

  &::before {
    content: '';
    position: absolute;
    bottom: 100%;
    right: 12px;
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent #1f2937 transparent;
  }
`

const TooltipTitle = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  color: #fff;
`

const TooltipList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`

const TooltipItem = styled.li`
  margin-bottom: 6px;
  padding-left: 16px;
  position: relative;

  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #9ca3af;
  }
`

const NodeTooltip = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #1f2937;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  z-index: 1000;
  display: ${(props) => (props.visible ? 'block' : 'none')};
  margin-top: 8px;
  min-width: 200px;
  white-space: nowrap;

  &::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: transparent transparent #1f2937 transparent;
  }
`

const TooltipConnectionList = styled.div`
  margin-top: 4px;
`

const TooltipConnectionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  &:first-of-type {
    border-top: none;
  }
`

const TooltipDisconnectButton = styled.button`
  padding: 2px 6px;
  font-size: 11px;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  cursor: pointer;
  border-radius: 4px;
  margin-left: 8px;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
`

const RightSidebar = styled.aside`
  width: 280px;
  padding: 1.5rem;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const AdBox = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #dedede;
  padding: 24px;
  border-radius: 10px;
  gap: 52px;
`
