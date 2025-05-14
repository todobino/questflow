
// This page is no longer needed as character creation is moved to a dialog
// on the /party page. You can delete this file.
// To prevent build errors, I'll leave a placeholder.

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function CharacterCreatorRedirectPage() {
  return (
    <>
      <PageHeader
        title="Character Creator (Moved)"
        description="Character creation has been moved to the Party Manager."
      />
      <Card>
        <CardHeader>
          <CardTitle>This Page Has Moved</CardTitle>
          <CardDescription>
            You can now create and manage characters from the Party Manager page for your active campaign.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please navigate to the <Link href="/party" className="text-primary hover:underline">Party Manager</Link>.</p>
        </CardContent>
      </Card>
    </>
  );
}
