import { redirect } from '@/i18n/routing'

export default function HomePage() {
  // This will automatically redirect to the localized path, e.g. `/en/dashboard`
  redirect('/dashboard')
}
