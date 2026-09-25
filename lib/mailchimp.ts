import mailchimp from '@mailchimp/mailchimp_marketing';
import {writeFile} from "node:fs";

const apiKey = process.env.MAILCHIMP_API_KEY || '';
const server = process.env.MAILCHIMP_SERVER_PREFIX || 'us1';
const listId = process.env.MAILCHIMP_LIST_ID || '';
const fromName = process.env.MAILCHIMP_FROM_NAME || 'Volta Innovation Hub';
const replyTo = process.env.MAILCHIMP_REPLY_TO || 'newsletter@voltaeffect.com';

const hasApiKey = Boolean(apiKey && apiKey !== 'mock-key-for-demo' && apiKey.includes('-'));
const isConfigured = Boolean((hasApiKey) && server && listId && listId !== 'mock-list-id');

const client = mailchimp as any;

if (isConfigured) {
  client.setConfig(
   {
          apiKey,
          server,
    }
  );
}

export interface CreateCampaignParams {
  subject: string;
  previewText?: string | null;
  htmlContent: string;
  title: string;
}

export async function createOrUpdateMailchimpCampaign(
  params: CreateCampaignParams,
  existingCampaignId?: string | null
): Promise<{
  campaignId: string;
  webId: string;
  archiveUrl: string;
}> {
  if (!isConfigured) {
    console.log('Mailchimp not configured, using mock data');
    // Demo / mock mode fallback
    const mockId = existingCampaignId || `mc_mock_${Math.random().toString(36).substring(2, 9)}`;
    const mockWebId = `web_${mockId}`;
    const mockArchive = `https://mailchi.mp/voltaeffect/${params.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    return {
      campaignId: mockId,
      webId: mockWebId,
      archiveUrl: mockArchive,
    };
  }

  let campaignId = existingCampaignId;

  if (!campaignId) {
    try {

    const response: any = await client.campaigns.create({
      type: 'regular',
      recipients: {
        list_id: listId,
      },
      settings: {
        subject_line: params.subject,
        preview_text: params.previewText || undefined,
        title: params.title,
        from_name: fromName,
        reply_to: replyTo,
      },
    });

    campaignId = response.id;
    }
    catch (e) {
      console.error('Error creating Mailchimp campaign:',e)
      writeFile("err.json", JSON.stringify(e, null, 2), (err) => {
        console.error('Error writing error to file:', err);
      });
    }
  }

  await client.campaigns.setContent(campaignId, {
    html: params.htmlContent,
  });

  const details: any = await client.campaigns.get(campaignId);

  return {
    campaignId: String(campaignId),
    webId: String(details.web_id || ''),
    archiveUrl: details.archive_url || '',
  };
}

export async function sendMailchimpCampaign(campaignId: string): Promise<boolean> {
  if (!isConfigured) {
    return true;
  }

  await client.campaigns.send(campaignId);
  return true;
}

export interface CampaignReport {
  opens: number;
  uniqueOpens: number;
  openRate: number;
  clicks: number;
  subscriberClicks: number;
  clickRate: number;
  emailsSent: number;
}

export interface ClickDetail {
  url: string;
  totalClicks: number;
  uniqueClicks: number;
}

export async function getMailchimpReport(
  campaignId: string
): Promise<{ report: CampaignReport; clickDetails: ClickDetail[] }> {
  if (!isConfigured) {
    // Realistic mock metrics for demo
    return {
      report: {
        opens: 342,
        uniqueOpens: 284,
        openRate: 0.442,
        clicks: 98,
        subscriberClicks: 76,
        clickRate: 0.118,
        emailsSent: 642,
      },
      clickDetails: [],
    };
  }

  try {
    const reportData: any = await client.reports.getCampaignReport(campaignId);
    const clicksData: any = await client.reports.getCampaignClickDetails(campaignId);

    const report: CampaignReport = {
      opens: reportData.opens?.opens_total || 0,
      uniqueOpens: reportData.opens?.unique_opens || 0,
      openRate: reportData.opens?.open_rate || 0,
      clicks: reportData.clicks?.clicks_total || 0,
      subscriberClicks: reportData.clicks?.unique_subscriber_clicks || 0,
      clickRate: reportData.clicks?.click_rate || 0,
      emailsSent: reportData.emails_sent || 0,
    };

    const clickDetails: ClickDetail[] = (clicksData.urls_clicked || []).map((u: any) => ({
      url: u.url,
      totalClicks: u.total_clicks || 0,
      uniqueClicks: u.unique_clicks || 0,
    }));

    return { report, clickDetails };
  } catch (err) {
    console.error('Mailchimp report fetch error:', err);
    return {
      report: {
        opens: 0,
        uniqueOpens: 0,
        openRate: 0,
        clicks: 0,
        subscriberClicks: 0,
        clickRate: 0,
        emailsSent: 0,
      },
      clickDetails: [],
    };
  }
}
