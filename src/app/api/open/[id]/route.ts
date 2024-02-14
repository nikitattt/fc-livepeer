import { NextRequest, NextResponse } from 'next/server'
import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit'
import Redis from 'ioredis'
import { VideoShareData } from '@/utils/types'
import { checkOwnership } from '@/lib/checkOwnership'

const NEYNAR_KEY = process.env.NEYNAR_KEY

const redisClient = new Redis(process.env.REDIS_URL!)

export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body: FrameRequest = await req.json()

  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: NEYNAR_KEY
  })

  if (!isValid) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const wallets = message.interactor.verified_accounts

  if (wallets.length === 0) {
    const imageUrl = `${process.env.HOST}/no-wallets.jpg`

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>No wallets!</title>
          <meta property="og:title" content="You need to add at least 1 wallet!" />
          <meta property="og:image" content="${imageUrl}" />
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${imageUrl}" />
        </head>
        <body />
      </html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html'
        }
      }
    )
  }

  // console.log(wallets)

  const id = params.id

  const dataString = await redisClient.get(id)

  if (!dataString) {
    return new NextResponse('Not found', { status: 404 })
  }

  const data = JSON.parse(dataString) as VideoShareData

  // console.log(data)

  const requirement = data.requirement.split(':')
  const chain = requirement[0]
  const address = requirement[1]
  const tokenId = requirement[2]

  const ownershipPassed = await checkOwnership(wallets, chain, address, tokenId)

  let response

  if (ownershipPassed) {
    const postUrl = `https://lvpr.tv?v=${data.playbackId}`
    const imageUrl = `${process.env.HOST}/all-good.jpg`

    response = new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Watch the video!</title>
          <meta property="og:title" content="You can watch the video!" />
          <meta property="og:image" content="${imageUrl}" />
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${imageUrl}" />
          <meta name="fc:frame:button:1" content="Watch video" />
          <meta name="fc:frame:button:1:action" content="link" />
          <meta name="fc:frame:button:1:target" content="${postUrl}" />
        </head>
        <body />
      </html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html'
        }
      }
    )
  } else {
    const openseaChain = chain === 'eth' ? 'ethereum' : chain

    const imageUrl = `${process.env.HOST}/api/images/no-pass/${id}`
    const collectionLink = tokenId
      ? `https://opensea.io/assets/${openseaChain}/${address}/${tokenId}`
      : `https://opensea.io/assets/${openseaChain}/${address}`

    response = new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Oops, no access!</title>
          <meta property="og:title" content="Access haven't been granted to you." />
          <meta property="og:image" content="${imageUrl}" />
          <meta name="fc:frame" content="vNext" />
          <meta name="fc:frame:image" content="${imageUrl}" />
          <meta name="fc:frame:button:1" content="See Collection" />
          <meta name="fc:frame:button:1:action" content="link" />
          <meta name="fc:frame:button:1:target" content="${collectionLink}" />
        </head>
        <body />
      </html>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html'
        }
      }
    )
  }

  // response.headers.set('Cache-Control', 'max-age=900, stale-while-revalidate')

  return response
}

export const GET = POST
