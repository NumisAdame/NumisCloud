export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET: List all categories for admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const catRole = (session?.user as any)?.role;
    if (!session?.user?.id || (catRole !== 'ADMIN' && catRole !== 'MODERATOR')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const categories = await prisma.forumCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { topics: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Admin forum categories error:', error);
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 });
  }
}

// POST: Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, icon } = body ?? {};

    if (!name?.trim()) {
      return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
    }

    const slug = slugify(name.trim());
    const existing = await prisma.forumCategory.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 });
    }

    const maxSort = await prisma.forumCategory.aggregate({ _max: { sortOrder: true } });
    const category = await prisma.forumCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() ?? '',
        icon: icon?.trim() ?? '📁',
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 });
  }
}

// PUT: Update category
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, icon, sortOrder } = body ?? {};

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const data: any = {};
    if (name?.trim()) {
      data.name = name.trim();
      data.slug = slugify(name.trim());
    }
    if (description !== undefined) data.description = description?.trim() ?? '';
    if (icon?.trim()) data.icon = icon.trim();
    if (sortOrder !== undefined) data.sortOrder = sortOrder;

    const category = await prisma.forumCategory.update({
      where: { id },
      data,
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 });
  }
}

// DELETE: Delete category (only if empty)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const topicCount = await prisma.forumTopic.count({ where: { categoryId: id } });
    if (topicCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: la categoría tiene ${topicCount} tema(s)` },
        { status: 400 }
      );
    }

    await prisma.forumCategory.delete({ where: { id } });
    return NextResponse.json({ message: 'Categoría eliminada' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Error al eliminar categoría' }, { status: 500 });
  }
}
