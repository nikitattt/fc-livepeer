import { Metadata } from 'next'

export async function generateMetadata({
  params
}: {
  params: { id: string }
}): Promise<Metadata> {
  const id = params.id

  const imageUrl = `${process.env.HOST}/api/images/open/${id}`
  const postUrl = `${process.env.HOST}/api/open/${id}`

  return {
    title: 'Gated video',
    description: 'Get access to the gated video',
    openGraph: {
      title: 'Gated video?',
      images: [imageUrl]
    },
    other: {
      'fc:frame': 'vNext',
      'fc:frame:image': imageUrl,
      'fc:frame:post_url': postUrl,
      'fc:frame:button:1': 'Watch video'
    }
  }
}

export default function Home() {
  return (
    <main className="flex flex-col text-center p-8 lg:p-16">
      <div className="flex flex-col">
        <p className="font-black text-purple-400">Farcaster Frame</p>
        <h1 className="mt-12 lg:mt-16 text-6xl font-bold">
          View gated video on Livepeer
        </h1>
      </div>
    </main>
  )
}
