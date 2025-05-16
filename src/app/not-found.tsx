
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,0px))] text-center p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Oops! The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button asChild size="lg">
        <Link href="/campaigns">
          Go Back to Campaigns
        </Link>
      </Button>
    </div>
  )
}
