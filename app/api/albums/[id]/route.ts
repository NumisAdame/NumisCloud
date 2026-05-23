export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const existing = await prisma.album.findUnique({ where: { id: params?.id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const album = await prisma.album.update({
      where: { id: params.id },
      data: {
        name: body?.name ?? existing.name,
        description: body?.description !== undefined ? body.description : existing.description,
      },
    });

    return NextResponse.json({ album });
  } catch (error: any) {
    console.error('Error updating album:', error);
    return NextResponse.json({ error: 'Error al actualizar álbum' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const existing = await prisma.album.findUnique({ where: { id: params?.id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await prisma.album.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Álbum eliminado' });
  } catch (error: any) {
    console.error('Error deleting album:', error);
    return NextResponse.json({ error: 'Error al eliminar álbum' }, { status: 500 });
  }
}
