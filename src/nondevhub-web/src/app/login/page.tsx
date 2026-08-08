'use client'

import { useState } from 'react'
import { Background } from '@/components/login/background'
import { LoginCard } from '@/components/login/login-card'
import { LoginForm } from '@/components/login/login-form'

export default function LoginPage() {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <Background backgroundImageUrl={process.env.NEXT_PUBLIC_LOGIN_BG_URL}>
      <LoginCard isFlipped={isFlipped}>
        <LoginForm isFlipped={isFlipped} setIsFlipped={setIsFlipped} />
      </LoginCard>
    </Background>
  )
}