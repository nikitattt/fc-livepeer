import { NextRequest, NextResponse } from 'next/server'
import { ImageResponse } from 'next/og'
import { join } from 'path'
import * as fs from 'fs'
import Redis from 'ioredis'
import { VideoShareData } from '@/utils/types'

const unboundedBlackPath = join(process.cwd(), 'public/Unbounded-Black.ttf')
let unboundedBlack = fs.readFileSync(unboundedBlackPath)

const redisClient = new Redis(process.env.REDIS_URL!)

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id

  const dataString = await redisClient.get(id)

  if (!dataString) {
    return new NextResponse('Not found', { status: 404 })
  }

  const data = JSON.parse(dataString) as VideoShareData

  const title = data.title
  const requirementDescription = data.requirementDescription

  const response = new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start', // Align items to the start of the container
          justifyContent: 'flex-start', // Align items to the start of the main axis
          width: '100%',
          height: '100vh',
          background: '#FFFFFF',
          padding: '52px', // Add padding to ensure content does not touch the edges
          boxSizing: 'border-box' // Include padding in width and height calculations
        }}
      ></div>
    ),
    {
      width: 1528,
      height: 800,
      fonts: [
        {
          name: 'Unbounded',
          data: unboundedBlack,
          weight: 900,
          style: 'normal'
        }
      ]
    }
  )

  //   response.headers.set('Cache-Control', 'max-age=900, stale-while-revalidate')

  return response
}
