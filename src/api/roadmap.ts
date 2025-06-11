import { authAxios } from './auth'

export interface RoadmapNode {
  title: string
  x_coord: number
  y_coord: number
  children: RoadmapNode[]
}

export interface CreateRoadmapRequest {
  title: string
  description: string
  nodes: RoadmapNode[]
}

export interface CreateRoadmapResponse {
  id: string
  title: string
  description: string
  nodes: RoadmapNode[]
  created_at: string
  updated_at: string
}

export const createRoadmap = async (data: CreateRoadmapRequest): Promise<CreateRoadmapResponse> => {
  const response = await authAxios.post<CreateRoadmapResponse>('/roadmaps/', data)
  return response.data
}