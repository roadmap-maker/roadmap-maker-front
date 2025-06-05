'use client'

import { CacheProvider } from '@emotion/react'
import createEmotionCache from '@/lib/createEmotionCache'
import { PropsWithChildren, useState } from 'react'

export default function EmotionProvider({ children }: PropsWithChildren) {
  const [emotionCache] = useState(() => createEmotionCache())
  return <CacheProvider value={emotionCache}>{children}</CacheProvider>
}
