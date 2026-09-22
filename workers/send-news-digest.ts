import { sendNewsDigest } from '@/lib/notifications/notification-service';
import { NewsDeliveryChannel } from '@/lib/types';

async function main() {
  const channel = (process.env.NEWS_DIGEST_CHANNEL || 'SLACK') as NewsDeliveryChannel;
  const result = await sendNewsDigest({ channel, deliveryType: 'DIGEST' });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
