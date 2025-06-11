import axios from 'axios'
import { authAxios } from './auth'

interface SaveNode {
  title: string
  x_coord: number
  y_coord: number
  children: SaveNode[]
}

export interface CreateRoadmapRequest {
  title: string
  description: string
  nodes: SaveNode[]
}

export interface RoadmapNode {
  id: number
  parent_id: number | null
  title: string
  content: string
  x_coord: number
  y_coord: number
  created_at: string
  updated_at: string
  children: RoadmapNode[]
}

export interface Roadmap {
  id: number
  title: string
  description: string
  created_at: string
  updated_at: string
  nodes: RoadmapNode[]
}

const API_BASE_URL = 'http://localhost:8000'

export const createRoadmap = async (
  data: CreateRoadmapRequest
): Promise<Roadmap> => {
  const response = await authAxios.post(`${API_BASE_URL}/roadmaps/`, data)
  return response.data
}

export const updateRoadmap = async (
  id: number,
  data: CreateRoadmapRequest
): Promise<Roadmap> => {
  const response = await authAxios.patch(`${API_BASE_URL}/roadmaps/${id}`, data)
  return response.data
}

export const getRoadmap = async (id: number): Promise<Roadmap> => {
  const response = await authAxios.get(`${API_BASE_URL}/roadmaps/${id}`)
  return response.data
}