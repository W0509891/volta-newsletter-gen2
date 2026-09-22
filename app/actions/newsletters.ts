'use server';

import { revalidatePath } from 'next/cache';
import {
  createDispatchNewsletter,
  pushDispatchNewsletterToMailchimp,
  sendDispatchNewsletter,
  syncDispatchNewsletterReports,
} from '@/lib/services/newsletter-service';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function createNewNewsletterAction(data: {
  slug: string;
  subject: string;
  previewText?: string;
  scheduledFor?: string;
}) {
  const newsletter = await createDispatchNewsletter(data);

  revalidatePath('/admin/newsletters');
  return { success: true, newsletter };
}

export async function pushToMailchimpAction(newsletterId: string) {
  try {
    const result = await pushDispatchNewsletterToMailchimp(newsletterId);
    if (!result.success) {
      return result;
    }

    revalidatePath(`/admin/newsletters`);
    revalidatePath(`/admin/newsletters/${newsletterId}`);
    revalidatePath(`/admin/newsletters/${newsletterId}/preview`);
    return {
      success: true as const,
      campaignId: result.campaignId,
      archiveUrl: result.archiveUrl,
    };
  } catch (err: unknown) {
    console.error('Push to Mailchimp error:', err);
    return {
      success: false as const,
      error: getErrorMessage(err, 'Failed to push to Mailchimp'),
    };
  }
}

export async function sendMailchimpCampaignAction(newsletterId: string) {
  try {
    const result = await sendDispatchNewsletter(newsletterId);
    if (!result.success) {
      return result;
    }

    revalidatePath(`/admin/newsletters`);
    revalidatePath(`/admin/newsletters/${newsletterId}`);
    revalidatePath(`/admin/newsletters/${newsletterId}/preview`);
    revalidatePath('/admin');
    return { success: true as const };
  } catch (err: unknown) {
    console.error('Send Mailchimp campaign error:', err);
    return {
      success: false as const,
      error: getErrorMessage(err, 'Failed to send campaign'),
    };
  }
}

export async function syncMailchimpReportsAction(newsletterId: string) {
  try {
    const result = await syncDispatchNewsletterReports(newsletterId);
    if (!result.success) {
      return result;
    }

    revalidatePath(`/admin/newsletters/${newsletterId}/report`);
    return result;
  } catch (err: unknown) {
    console.error('Sync reports error:', err);
    return {
      success: false as const,
      error: getErrorMessage(err, 'Failed to sync reports'),
    };
  }
}
