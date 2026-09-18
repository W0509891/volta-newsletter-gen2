import pug from 'pug';
import juice from 'juice';
import path from 'path';
import { NewsletterItemWithContent } from '@/lib/db/queries';
import { Newsletter } from '@/lib/types';

export interface ItemViewModel {
  id: string;
  type: string;
  title: string;
  summary?: string | null;
  body?: string | null;
  url?: string | null;
  trackedUrl?: string | null;
}

export interface NewsletterViewModel {
  id: string;
  slug: string;
  subject: string;
  previewText?: string | null;
  sections: {
    featured: ItemViewModel[];
    events: ItemViewModel[];
    updates: ItemViewModel[];
  };
}

export function buildNewsletterViewModel(
  newsletter: Newsletter,
  items: NewsletterItemWithContent[]
): NewsletterViewModel {
  const featured: ItemViewModel[] = [];
  const events: ItemViewModel[] = [];
  const updates: ItemViewModel[] = [];

  for (const row of items) {
    const itemVm: ItemViewModel = {
      id: row.item.id,
      type: row.item.type,
      title: row.item.title,
      summary: row.item.summary,
      body: row.item.body,
      url: row.item.url,
      trackedUrl: row.trackedUrl || row.item.url,
    };

    if (row.section === 'FEATURED' || (row.item.featured && row.section === 'STORIES' && featured.length === 0)) {
      featured.push(itemVm);
    } else if (row.section === 'EVENTS' || row.item.type === 'EVENT') {
      events.push(itemVm);
    } else {
      updates.push(itemVm);
    }
  }

  // If featured was empty but stories exist, take the first story as founder highlight
  if (featured.length === 0 && updates.length > 0) {
    const storyIdx = updates.findIndex((u) => u.type === 'STORY');
    if (storyIdx !== -1) {
      const [story] = updates.splice(storyIdx, 1);
      featured.push(story);
    }
  }

  return {
    id: newsletter.id,
    slug: newsletter.slug,
    subject: newsletter.subject,
    previewText: newsletter.previewText,
    sections: {
      featured,
      events,
      updates,
    },
  };
}

export function renderNewsletter(newsletter: NewsletterViewModel): string {
  const templatePath = path.join(process.cwd(), 'templates/weekly.pug');
  const compiledFunction = pug.compileFile(templatePath, {
    basedir: path.join(process.cwd(), 'templates'),
    filename: templatePath,
  });

  const rawHtml = compiledFunction({ newsletter });
  return juice(rawHtml, { removeStyleTags: true });
}
