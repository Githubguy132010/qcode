import { redirect } from 'next/navigation'

export default function AnalyticsRedirectPage() {
  redirect('/?tab=analytics')
}