import {
  createNewsletter,
  getNewsletterById,
  getNewsletterItemsWithContent,
  recordLinkClick,
  syncTrackedLinksForNewsletter,
  updateContentItem,
  updateNewsletter,
} from '@/lib/db/queries';
import {
  buildNewsletterViewModel,
  renderNewsletter,
} from '@/lib/render-newsletter';
import {
  createOrUpdateMailchimpCampaign,
  getMailchimpReport,
  sendMailchimpCampaign,
} from '@/lib/mailchimp';

export async function createDispatchNewsletter(data: {
  slug: string;
  subject: string;
  previewText?: string;
  scheduledFor?: string;
}) {
  return createNewsletter({
    slug: data.slug,
    subject: data.subject,
    previewText: data.previewText,
    scheduledFor: data.scheduledFor,
  });
}

export async function renderDispatchNewsletter(newsletterId: string) {
  const newsletter = await getNewsletterById(newsletterId);
  if (!newsletter) {
    return { success: false as const, error: 'Newsletter not found' };
  }

  await syncTrackedLinksForNewsletter(newsletterId);
  const items = await getNewsletterItemsWithContent(newsletterId);
  const viewModel = buildNewsletterViewModel(newsletter, items);
  const htmlContent = renderNewsletter(viewModel);

  return {
    success: true as const,
    newsletter,
    htmlContent,
  };
}

export async function pushDispatchNewsletterToMailchimp(newsletterId: string) {
  const rendered = await renderDispatchNewsletter(newsletterId);
  if (!rendered.success) {
    return rendered;
  }

  const { newsletter, htmlContent } = rendered;

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

  return {
    success: true as const,
    campaignId: result.campaignId,
    archiveUrl: result.archiveUrl,
  };
}

export async function sendDispatchNewsletter(newsletterId: string) {
  const newsletter = await getNewsletterById(newsletterId);
  if (!newsletter) {
    return { success: false as const, error: 'Newsletter not found' };
  }

  if (newsletter.status === 'SENT') {
    return { success: false as const, error: 'Campaign has already been sent.' };
  }

  let campaignId = newsletter.mailchimpCampaignId;
  if (!campaignId) {
    const pushRes = await pushDispatchNewsletterToMailchimp(newsletterId);
    if (!pushRes.success) {
      return pushRes;
    }
    const updatedNewsletter = await getNewsletterById(newsletterId);
    campaignId = updatedNewsletter?.mailchimpCampaignId || null;
  }

  if (!campaignId) {
    return { success: false as const, error: 'No Mailchimp campaign linked.' };
  }

  await sendMailchimpCampaign(campaignId);

  await updateNewsletter(newsletterId, {
    status: 'SENT',
    sentAt: new Date().toISOString(),
  });

  const items = await getNewsletterItemsWithContent(newsletterId);
  for (const row of items) {
    await updateContentItem(row.item.id, {
      status: 'ARCHIVED',
    });
  }

  return { success: true as const };
}

export async function syncDispatchNewsletterReports(newsletterId: string) {
  const newsletter = await getNewsletterById(newsletterId);
  if (!newsletter || !newsletter.mailchimpCampaignId) {
    return { success: false as const, error: 'No Mailchimp campaign linked.' };
  }

  const { report, clickDetails } = await getMailchimpReport(
    newsletter.mailchimpCampaignId
  );

  for (const click of clickDetails) {
    if (click.url) {
      await recordLinkClick(click.url);
    }
  }

  return { success: true as const, report, clickDetails };
}
