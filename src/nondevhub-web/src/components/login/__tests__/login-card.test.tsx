import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LoginCard } from '../login-card'

describe('LoginCard Component', () => {
  it('renders NONDEVHUB SYSTEM brand badge without SQL Server text', () => {
    render(
      <LoginCard isFlipped={false} dbStatus="online">
        <div>Test Form Content</div>
      </LoginCard>
    )

    // ตรวจสอบว่ามี Brand Name ขึ้นแสดงถูกต้อง
    expect(screen.getByText('NONDEVHUB SYSTEM')).toBeInTheDocument()

    // ตรวจสอบว่าไม่มีคำว่า SQL Server อยู่ใน DOM
    expect(screen.queryByText(/SQL Server/i)).not.toBeInTheDocument()
  })

  it('displays status tooltip correctly for offline mode', () => {
    render(
      <LoginCard isFlipped={false} dbStatus="offline">
        <div>Test Form Content</div>
      </LoginCard>
    )

    expect(screen.getByTitle('System Status: Disconnected (Offline)')).toBeInTheDocument()
  })
})