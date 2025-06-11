'use client'

import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import EmotionProvider from '@/components/emotionProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <QueryClientProvider client={queryClient}>
          <EmotionProvider>{children}</EmotionProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  )
}
