
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Users, Map, ScrollText } from 'lucide-react'; // Removed Dice5, Swords

const quickAccessItems = [
  { title: 'Manage Campaigns', href: '/campaigns', icon: BookOpen, description: 'Create, edit, and organize your adventures.' },
  { title: 'Character Creator', href: '/creator/characters', icon: Users, description: 'Bring your heroes and villains to life.' },
  { title: 'Map Maker', href: '/map-maker', icon: Map, description: 'Visualize your world with AI-powered maps.' },
  { title: 'Session Journal', href: '/journal', icon: ScrollText, description: 'Log your game sessions and track progress.' },
  // Dice Roller and Combat Tracker moved to right sidebar
  // { title: 'Dice Roller', href: '/dice-roller', icon: Dice5, description: 'Quickly roll any dice you need.' },
  // { title: 'Combat Tracker', href: '/combat-tracker', icon: Swords, description: 'Manage initiative and combat encounters.' },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="Welcome to Campaign Canvas"
        description="Your all-in-one toolkit for crafting and managing unforgettable TTRPG experiences."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickAccessItems.map((item) => (
          <Card key={item.href} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">{item.title}</CardTitle>
              <item.icon className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
            <div className="p-6 pt-0">
              <Button asChild className="w-full">
                <Link href={item.href}>Go to {item.title.split(' ')[0]}</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            New to Campaign Canvas? Here are a few tips to get you started on your adventure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Begin by creating a new campaign in the <Link href="/campaigns" className="text-accent hover:underline">Campaigns</Link> section.</li>
            <li>Use the <Link href="/creator/characters" className="text-accent hover:underline">Character Creator</Link> to design your main characters and notable NPCs.</li>
            <li>Explore the <Link href="/map-maker" className="text-accent hover:underline">Map Maker</Link> to generate an overworld map for your setting.</li>
            <li>Keep track of your sessions and important plot points with the <Link href="/journal" className="text-accent hover:underline">Journal</Link>.</li>
            <li>Access the Dice Roller and Combat Tracker from the right sidebar on larger screens.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
