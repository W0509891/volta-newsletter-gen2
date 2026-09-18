'use server';

import { revalidatePath } from 'next/cache';
import {
  getNewsletterById,
  getNewsletterItemsWithContent,
  updateNewsletter,
  createNewsletter,
  syncTrackedLinksForNewsletter,
  updateContentItem,
  recordLinkClick,
} from '@/lib/db/queries';
import {
  buildNewsletterViewModel,
  renderNewsletter,
} from '@/lib/render-newsletter';
import {
  createOrUpdateMailchimpCampaign,
  sendMailchimpCampaign,
  getMailchimpReport,
} from '@/lib/mailchimp';

export async function createNewNewsletterAction(data: {
  slug: string;
  subject: string;
  previewText?: string;
  scheduledFor?: string;
}) {
  const newsletter = await createNewsletter({
    slug: data.slug,
    subject: data.subject,
    previewText: data.previewText,
    scheduledFor: data.scheduledFor,
  });

  revalidatePath('/admin/newsletters');
  return { success: true, newsletter };
}

export async function pushToMailchimpAction(newsletterId: string) {
  const newsletter = await getNewsletterById(newsletterId);
  if (!newsletter) {
    return { success: false, error: 'Newsletter not found' };
  }

  // Ensure tracked links are up to date with UTM params
  await syncTrackedLinksForNewsletter(newsletterId);

  // Render HTML via step 03 pipeline
  const items = await getNewsletterItemsWithContent(newsletterId);
  const viewModel = buildNewsletterViewModel(newsletter, items);
  const htmlContent = renderNewsletter(viewModel);

  try {
    const result = await createOrUpdateMailchimpCampaign(
      {
        subject: newsletter.subject,
        previewText: newsletter.previewText,
        htmlContent,
        title: `Volta Dispatch: ${newsletter.slug}`,
      },
      newsletter.mailchimpCampaignId
    );

    await updateNewsletter(newsletterId, {
      mailchimpCampaignId: result.campaignId,
      mailchimpWebId: result.webId,
      mailchimpArchiveUrl: result.archiveUrl,
      htmlContent,
    });

    revalidatePath(`/admin/newsletters`);
    revalidatePath(`/admin/newsletters/${newsletterId}`);
    revalidatePath(`/admin/newsletters/${newsletterId}/preview`);
    return { success: true, campaignId: result.campaignId, archiveUrl: result.archiveUrl };
  } catch (err: any) {
    console.error('Push to Mailchimp error:', err);
    return { success: false, error: err.message || 'Failed to push to Mailchimp' };
  }
}

export async function sendMailchimpCampaignAction(newsletterId: string) {
  const newsletter = await getNewsletterById(newsletterId);
  if (!newsletter) {
    return { success: false, error: 'Newsletter not found' };
  }

  if (newsletter.status === 'SENT') {
    return { success: false, error: 'Campaign has already been sent.' };
  }

  if (!newsletter.mailchimpCampaignId) {
    // If not pushed yet, push first
    const pushRes = await pushToMailchimpAction(newsletterId);
    if (!pushRes.success) {
      return { success: false, error: pushRes.error };
    }
  }

  const updatedNewsletter = await getNewsletterById(newsletterId);
  const campaignId = updatedNewsletter!.mailchimpCampaignId!;

  try {
    await sendMailchimpCampaign(campaignId);

    // Update status to SENT and record timestamp
    await updateNewsletter(newsletterId, {
      status: 'SENT',
      sentAt: new Date().toISOString(),
    });

    // Mark attached items as ARCHIVED (published)
    const items = await getNewsletterItemsWithContent(newsletterId);
    for (const row of items) {
      await updateContentItem(row.item.id, {
        status: 'ARCHIVED',
      });
    }

    revalidatePath(`/admin/newsletters`);
    revalidatePath(`/admin/newsletters/${newsletterId}`);
    revalidatePath(`/admin/newsletters/${newsletterId}/preview`);
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('Send Mailchimp campaign error:', err);
    return { success: false, error: err.message || 'Failed to send campaign' };
  }
}

export async function syncMailchimpReportsAction(newsletterId: string) {
  const newsletter = await getNewsletterById(newsletterId);
  if (!newsletter || !newsletter.mailchimpCampaignId) {
    return { success: false, error: 'No Mailchimp campaign linked.' };
  }

  try {
    const { report, clickDetails } = await getMailchimpReport(
      newsletter.mailchimpCampaignId
    );

    // Write click counts back to matching TrackedLink rows by matching on destinationUrl
    for (const click of clickDetails) {
      if (click.url) {
        await recordLinkClick(click.url);
      }
    }

    revalidatePath(`/admin/newsletters/${newsletterId}/report`);
    return { success: true, report, clickDetails };
  } catch (err: any) {
    console.error('Sync reports error:', err);
    return { success: false, error: err.message };
  }
}
