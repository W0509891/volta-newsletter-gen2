import { NextRequest, NextResponse } from 'next/server';
import {
  getNewsletterById,
  getNewsletterItemsWithContent,
} from '@/lib/db/queries';
import {
  buildNewsletterViewModel,
  renderNewsletter,
} from '@/lib/render-newsletter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const newsletter = await getNewsletterById(id);

  if (!newsletter) {
    return new NextResponse('Newsletter not found', { status: 404 });
  }

  const items = await getNewsletterItemsWithContent(id);
  const viewModel = buildNewsletterViewModel(newsletter, items);
  const html = renderNewsletter(viewModel);

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
