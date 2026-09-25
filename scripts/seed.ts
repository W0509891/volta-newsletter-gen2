import { query } from '@/lib/db';

async function seed() {
  console.log('Seeding initial Volta data...');

  await query('TRUNCATE TABLE consent_records, tracked_links, newsletter_items, newsletters, content_items, events, contacts CASCADE');

  // 1. Contacts
  const contacts = [
    {
      email: 'bader@voltaeffect.com',
      name: 'Bader Al-Riyami',
      organization: 'Volta Effect',
      role: 'Director of AI Programs',
      notes: 'Manages AI lab and curates builders newsletter',
    },
    {
      email: 'matt@voltaeffect.com',
      name: 'Matt Cooper',
      organization: 'Volta Effect',
      role: 'CEO',
      notes: 'Economic buyer, cares deeply about community practice and event attendance',
    },
    {
      email: 'elena@novasurge.ai',
      name: 'Dr. Elena Rostova',
      organization: 'NovaSurge AI',
      role: 'Founder & CTO',
      notes: 'AI Lab resident building surgical computer vision',
    },
    {
      email: 'marcus@atlanticrobotics.ca',
      name: 'Marcus Chen',
      organization: 'Atlantic Robotics',
      role: 'Co-Founder',
      notes: 'Hardware + AI startup working on marine inspection drones',
    },
    {
      email: 'sarah.k@dal.ca',
      name: 'Sarah Kelly',
      organization: 'Dalhousie University',
      role: 'Graduate Researcher',
      notes: 'Winner of Volta Spring AI Hackathon',
    },
  ];

  const contactMap = new Map<string, string>();
  for (const c of contacts) {
    const res = await query(
      `INSERT INTO contacts (email, name, organization, role, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, organization = EXCLUDED.organization
       RETURNING id, email`,
      [c.email, c.name, c.organization, c.role, c.notes]
    );
    contactMap.set(c.email, res.rows[0].id);
  }

  // 2. Events
  const events = [
    {
      title: 'Volta AI Builders Jam: Local LLMs on the Edge',
      description: 'Hands-on workshop benchmarking quantized open models on consumer hardware.',
      startsAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      endsAt: new Date(Date.now() + 5 * 86400000 + 7200000).toISOString(),
      location: 'Volta Event Space (Halifax, NS)',
      source: 'manual',
    },
    {
      title: 'Peer Practice Session: Autonomous Agents in Production',
      description: 'Show & tell session where founders walk through real agentic workflows.',
      startsAt: new Date(Date.now() + 12 * 86400000).toISOString(),
      endsAt: new Date(Date.now() + 12 * 86400000 + 7200000).toISOString(),
      location: 'Volta Boardroom & Hybrid',
      source: 'manual',
    },
    {
      title: 'Atlantic HealthTech Demo Day 2026',
      description: 'Showcasing AI-enabled diagnostics and device innovations across the Atlantic ecosystem.',
      startsAt: new Date(Date.now() + 20 * 86400000).toISOString(),
      endsAt: new Date(Date.now() + 20 * 86400000 + 14400000).toISOString(),
      location: 'Halifax Central Library Paul O’Regan Hall',
      source: 'manual',
    },
  ];

  const eventMap = new Map<string, string>();
  for (const ev of events) {
    const res = await query(
      `INSERT INTO events (title, description, starts_at, ends_at, location, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title`,
      [ev.title, ev.description, ev.startsAt, ev.endsAt, ev.location, ev.source]
    );
    eventMap.set(ev.title, res.rows[0].id);
  }

  // 3. Content Items
  const contentItems = [
    {
      type: 'STORY',
      title: 'How NovaSurge AI Scaled Real-Time Video Segmentation to 60 FPS',
      body: 'Resident team NovaSurge AI recently hit a major engineering milestone by compressing their medical imaging neural network onto compact edge GPUs. Founder Elena Rostova walked our lab members through their quantization techniques and real-world clinical testing protocol.',
      summary: 'Elena Rostova and the NovaSurge AI team detail how they brought real-time 60fps inference to edge surgical units.',
      url: 'https://voltaeffect.com/stories/novasurge-edge-vision',
      status: 'APPROVED',
      featured: true,
      contactEmail: 'elena@novasurge.ai',
      consentStatus: 'GRANTED',
      consentMethod: 'RECORDING',
      consentEvidence: 'Elena confirmed on transcript: "Yes, totally fine to share our quantization benchmark numbers in the October dispatch."',
    },
    {
      type: 'EVENT',
      title: 'Volta AI Builders Jam: Local LLMs on the Edge',
      body: 'Bring your laptop and test local quantized models on Apple Silicon and NVIDIA RTX hardware. We will experiment with Ollama, vLLM, and real-time streaming tools.',
      summary: 'Hands-on practice session testing local open-weight models on edge hardware. Saturday at Volta.',
      url: 'https://voltaeffect.com/events/ai-builders-jam-oct',
      status: 'APPROVED',
      featured: false,
      eventTitle: 'Volta AI Builders Jam: Local LLMs on the Edge',
    },
    {
      type: 'WIN',
      title: 'Atlantic Robotics Deploys First Fleet of Autonomous Inspection Drones in Halifax Harbour',
      body: 'Marcus Chen and Atlantic Robotics completed their first commercial harbor deployment using computer-vision powered subsea inspection rigs.',
      summary: 'Atlantic Robotics successfully launched autonomous harbor inspection drones following their AI Lab residency.',
      url: 'https://voltaeffect.com/wins/atlantic-robotics-harbour-deployment',
      status: 'APPROVED',
      featured: false,
      contactEmail: 'marcus@atlanticrobotics.ca',
      consentStatus: 'GRANTED',
      consentMethod: 'EMAIL',
      consentEvidence: 'Email confirmation from Marcus Chen on Sept 14th approving the release.',
    },
    {
      type: 'STORY',
      title: 'From Hackathon Project to Seed Round: Sarah Kelly on Autonomous Ocean Sensing',
      body: 'Sarah won first place at our Spring AI Hackathon and has spent the last three months prototyping autonomous oceanographic floats with Dalhousie and local marine partners.',
      summary: 'Sarah Kelly shares lessons from moving an ocean-sensing AI concept from a weekend hackathon into commercial trials.',
      url: 'https://voltaeffect.com/stories/sarah-kelly-ocean-sensing',
      status: 'PENDING_CONSENT',
      featured: false,
      contactEmail: 'sarah.k@dal.ca',
      consentStatus: 'PENDING',
      consentMethod: 'EMAIL',
      consentEvidence: 'Awaiting Sarah review of draft copy sent on Sept 16.',
    },
    {
      type: 'OPPORTUNITY',
      title: 'Applications Open: Fall 2026 AI Resident Residency Cohort',
      body: 'Volta is welcoming 6 new early-stage builder teams working with foundation models, fine-tuning, and hardware integrations. Grants, workspace, and compute credits provided.',
      summary: 'Volta is accepting applications for the Fall 2026 AI Residency cohort with compute credits and peer mentorship.',
      url: 'https://voltaeffect.com/programs/ai-residency',
      status: 'APPROVED',
      featured: false,
    },
    {
      type: 'COMMUNITY',
      title: 'Discord Community Milestone: 500 Active Builders in Atlantic Canada',
      body: 'Our builders channel crossed 500 active contributors this week, with over 30 shared open-source repos and peer-led study groups.',
      summary: 'Atlantic AI Builders Discord reaches 500 active builders collaborating across Halifax, Moncton, and St. John’s.',
      url: 'https://discord.gg/volta-builders',
      status: 'APPROVED',
      featured: false,
    },
    {
      type: 'STORY',
      title: 'Early Explorations in Agentic Tool Use for Supply Chain Audits',
      body: 'Notes from our informal Tuesday lunch chat about multi-agent orchestrators. Needs deeper technical benchmarks before publication.',
      summary: 'Exploration of LLM agent reliability in parsing complex logistics manifests.',
      url: 'https://voltaeffect.com/notes/supply-chain-agents',
      status: 'BACKLOG',
      featured: false,
      revisitAt: new Date(Date.now() - 2 * 86400000).toISOString(), // Overdue by 2 days!
    },
    {
      type: 'WIN',
      title: 'Local High School Robotics Team Uses Volta Lab for Autonomous Rover Challenge',
      body: 'Draft notes submitted via Slack from mentor. Check with team leads next month.',
      summary: 'Halifax high school robotics team prototypes rover autonomy inside Volta space.',
      status: 'BACKLOG',
      featured: false,
      revisitAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    },
    {
      type: 'OPPORTUNITY',
      title: 'External Sponsor Proposal for Web3 AI Summit',
      body: 'Submitted via external email. Doesn’t align with our focus on builder skill development and practical startup problems.',
      summary: 'Sponsorship pitch for crypto-AI token conference.',
      status: 'REJECTED',
      rejectionReason: 'Does not align with Volta focus on builder skill development and verified local founder practice.',
    },
  ];

  for (const item of contentItems) {
    const contactId = item.contactEmail ? contactMap.get(item.contactEmail) : null;
    const eventId = item.eventTitle ? eventMap.get(item.eventTitle) : null;

    const res = await query(
      `INSERT INTO content_items (
        type, title, body, summary, url, status, featured, revisit_at, rejection_reason, contact_id, event_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        item.type,
        item.title,
        item.body,
        item.summary,
        item.url || null,
        item.status,
        Boolean(item.featured),
        item.revisitAt ? new Date(item.revisitAt) : null,
        item.rejectionReason || null,
        contactId,
        eventId,
      ]
    );

    const itemId = res.rows[0].id;

    if (item.consentStatus && contactId) {
      await query(
        `INSERT INTO consent_records (
          content_item_id, contact_id, status, method, evidence, responded_at
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          itemId,
          contactId,
          item.consentStatus,
          item.consentMethod || 'EMAIL',
          item.consentEvidence || null,
          item.consentStatus === 'GRANTED' ? new Date() : null,
        ]
      );
    }
  }

  // 4. Sample Newsletter
  const nlRes = await query(
    `INSERT INTO newsletters (slug, subject, preview_text, status, scheduled_for)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (slug) DO UPDATE SET subject = EXCLUDED.subject
     RETURNING id, slug`,
    [
      '2026-10-builders-dispatch',
      'Volta Builders Dispatch: Edge AI, Marine Drones & October Jam',
      'Real-time edge vision at 60 FPS, Halifax harbour autonomous drones, and this month’s peer practice sessions.',
      'DRAFT',
      new Date(Date.now() + 7 * 86400000).toISOString(),
    ]
  );
  const newsletterId = nlRes.rows[0].id;

  // Attach approved items to newsletter
  const approvedItems = await query(
    `SELECT id, type, url FROM content_items WHERE status = 'APPROVED' LIMIT 5`
  );

  let pos = 0;
  for (const it of approvedItems.rows) {
    const section = it.type === 'STORY' ? 'STORIES' : it.type === 'EVENT' ? 'EVENTS' : it.type === 'WIN' ? 'WINS' : 'COMMUNITY';
    await query(
      `INSERT INTO newsletter_items (newsletter_id, content_item_id, section, position)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [newsletterId, it.id, section, pos++]
    );

    if (it.url) {
      const tracked = `${it.url}?utm_source=newsletter&utm_medium=email&utm_campaign=2026-10-builders-dispatch`;
      await query(
        `INSERT INTO tracked_links (newsletter_id, content_item_id, original_url, destination_url, utm_source, utm_medium, utm_campaign, clicks)
         VALUES ($1, $2, $3, $4, 'newsletter', 'email', '2026-10-builders-dispatch', $5)
         ON CONFLICT DO NOTHING`,
        [newsletterId, it.id, it.url, tracked, Math.floor(Math.random() * 25)]
      );
    }
  }

  console.log('Seeding completed successfully!');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
