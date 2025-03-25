import BotTestClient from './client'

interface BotTestPageProps {
  params: {
    id: string
  }
}

export default async function BotTestPage({ params }: BotTestPageProps) {
  const parameters = await params;
  const id = parameters.id
  return <BotTestClient id={id} />
}