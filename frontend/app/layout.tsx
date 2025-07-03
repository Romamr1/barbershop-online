import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import EnvironmentInfo from '@/components/EnvironmentInfo'
import I18nProvider from '@/components/I18nProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Barbershop Booking - Premium Hair Services',
  description: 'Book your next haircut at the best barbershops in town. Professional barbers, premium services, easy online booking.',
  keywords: 'barbershop, haircut, booking, barber, hair services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 