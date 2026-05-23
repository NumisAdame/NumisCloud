export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const albums = await prisma.album.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { pieces: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ albums: albums ?? [] });
  } catch (error: any) {
    console.error('Error fetching albums:', error);
    return NextResponse.json({ error: 'Error al obtener álbumes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body ?? {};

    if (!name) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const album = await prisma.album.create({
      data: {
        name,
        description: description ?? null,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ album }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating album:', error);
    return NextResponse.json({ error: 'Error al crear álbum' }, { status: 500 });
  }
}
