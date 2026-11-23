const GUIDE_TABLE = 'guides';

const formatPublicationDate = (guide) => {
  const rawDate = guide.published_at || guide.created_at;

  if (!rawDate) {
    return '';
  }

  return new Date(rawDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const normalizeGuide = (guide) => ({
  ...guide,
  imageUrl: guide.cover_image_url || '',
  publicationDate: formatPublicationDate(guide),
  description: guide.excerpt || '',
  url: `/guides/${guide.slug}`,
});

const throwIfError = ({ data, error }) => {
  if (error) {
    throw error;
  }

  return data;
};

// `status: null` lists every status; row-level security still limits non-admins to published.
export async function listGuides(supabase, { status = 'published', limit = 100 } = {}) {
  let query = supabase
    .from(GUIDE_TABLE)
    .select('*')
    .order('reviewed_at', { ascending: false, nullsFirst: true })
    .order('published_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const guides = throwIfError(await query);

  return {
    guides: (guides || []).map(normalizeGuide),
  };
}

export async function createGuide(supabase, guideData) {
  const data = throwIfError(
    await supabase.from(GUIDE_TABLE).insert(guideData).select('*').single()
  );

  return normalizeGuide(data);
}

export async function updateGuide(supabase, guideId, guideData) {
  const data = throwIfError(
    await supabase.from(GUIDE_TABLE).update(guideData).eq('id', guideId).select('*').single()
  );

  return normalizeGuide(data);
}

export async function deleteGuide(supabase, guideId) {
  const response = await supabase.from(GUIDE_TABLE).delete().eq('id', guideId).select('*');
  if (response.error) {
    console.error('[Supabase deleteGuide Error]:', response.error);
    throw response.error;
  }
  if (!response.data || response.data.length === 0) {
    const notFoundError = new Error(
      `Le guide (ID: ${guideId}) n'existe pas dans Supabase ou la politique RLS a bloqué la suppression.`
    );
    console.warn('[Supabase deleteGuide Warning]:', notFoundError.message);
    throw notFoundError;
  }
  return response.data;
}

export async function getGuideBySlug(supabase, slug) {
  const { data, error } = await supabase
    .from(GUIDE_TABLE)
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[Supabase getGuideBySlug Error]:', error);
    throw error;
  }

  return data ? normalizeGuide(data) : null;
}

const IMAGE_BUCKET = 'guides';
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const IMAGE_FOLDERS = ['covers', 'body'];

/**
 * Uploads a guide image (cover, or an image inside the body) to the public `guides` bucket
 * and returns its public URL. The checks mirror the bucket's own limits (migrations
 * 20261003100000 and 20261003110000) to give a clear message before the upload; the bucket
 * remains the authority.
 */
export async function uploadGuideImage(supabase, file, folder = 'covers') {
  if (!IMAGE_FOLDERS.includes(folder)) {
    throw new Error(`Dossier d'image inconnu : ${folder}`);
  }
  const extension = IMAGE_TYPES[file.type];
  if (!extension) {
    throw new Error('Format non pris en charge : utilisez une image JPEG, PNG ou WebP.');
  }
  if (file.size > IMAGE_MAX_BYTES) {
    throw new Error('Image trop lourde : 5 Mo au maximum. Réduisez-la avant de la téléverser.');
  }

  // Random name: the original file name is never trusted or reused, and a replaced image
  // gets a new URL, so a browser cache cannot show the old one.
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: '31536000' });
  if (error) {
    console.error('[Supabase uploadGuideImage Error]:', error);
    throw error;
  }

  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
