import { redirect } from 'next/navigation'

export default function RootPage() {
  // Redirect ผู้ใช้ไปที่หน้า /login อัตโนมัติ
  redirect('/login')
}