export type StoryblokAsset = {
  id: number | null;
  filename: string;
  [key: string]: unknown;
};
export type StoryContent = Record<string, unknown>;
type Story = { id: number; slug: string; content: StoryContent };

const RATE_LIMIT_RETRIES = 3;

async function mapi<T>(method: string, route: string, body?: unknown): Promise<T> {
  const url = `https://mapi.storyblok.com/v1/spaces/${process.env.STORYBLOK_SPACE_ID}${route}`;
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: process.env.STORYBLOK_OAUTH_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 429 && attempt < RATE_LIMIT_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      continue;
    }
    if (!response.ok) {
      throw new Error(
        `Storyblok ${method} ${route} → ${response.status}: ${await response.text()}`,
      );
    }
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }
}

export async function getStory(storyId: number) {
  const { story } = await mapi<{ story: Story }>('GET', `/stories/${storyId}`);
  return story;
}

// Without `publish`, the Management API saves the draft only.
export async function saveStoryDraft(storyId: number, content: StoryContent) {
  await mapi('PUT', `/stories/${storyId}`, { story: { content } });
}

export async function getAssetFolderId(assetId: number) {
  const asset = await mapi<{ asset_folder_id: number | null }>('GET', `/assets/${assetId}`);
  return asset.asset_folder_id ?? null;
}

type SignedUpload = { id: number; post_url: string; fields: Record<string, string> };

// The size in the filename is what next/image reads the dimensions from.
export async function uploadAsset(file: {
  filename: string;
  contentType: string;
  body: Buffer | string;
  width: number;
  height: number;
  folderId: number | null;
}): Promise<StoryblokAsset> {
  const signed = await mapi<SignedUpload>('POST', '/assets', {
    filename: file.filename,
    size: `${file.width}x${file.height}`,
    asset_folder_id: file.folderId,
  });

  const form = new FormData();
  for (const [key, value] of Object.entries(signed.fields)) form.append(key, value);
  const blob = new Blob([new Uint8Array(Buffer.from(file.body))], { type: file.contentType });
  form.append('file', blob, file.filename);
  const upload = await fetch(signed.post_url, { method: 'POST', body: form });
  if (!upload.ok) throw new Error(`Uploading ${file.filename} failed with ${upload.status}`);

  await mapi('GET', `/assets/${signed.id}/finish_upload`);

  return {
    id: signed.id,
    alt: '',
    name: '',
    focus: '',
    title: '',
    source: '',
    filename: `https://a.storyblok.com/${signed.fields.key}`,
    copyright: '',
    fieldtype: 'asset',
    meta_data: {},
    is_external_url: false,
  };
}

// The `partners` datasource feeds `included_for_partners`: name = slug, value = display name.
export async function ensurePartnersDatasourceEntry(slug: string, name: string) {
  const { datasources } = await mapi<{ datasources: { id: number; slug: string }[] }>(
    'GET',
    '/datasources?search=partners',
  );
  const datasource = datasources.find((candidate) => candidate.slug === 'partners');
  if (!datasource) throw new Error('Storyblok has no partners datasource');

  const { datasource_entries: entries } = await mapi<{
    datasource_entries: { name: string; value: string }[];
  }>('GET', `/datasource_entries?datasource_id=${datasource.id}&per_page=1000`);
  if (entries.some((entry) => entry.name === slug || entry.value === name)) return;

  await mapi('POST', '/datasource_entries', {
    datasource_entry: { name: slug, value: name, datasource_id: datasource.id },
  });
}
