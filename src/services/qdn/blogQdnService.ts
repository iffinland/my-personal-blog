import { requestQortal } from '../qortal/qortalClient';

const BLOG_SERVICE = 'POSTITUS';
const BLOG_PREFIX = 'wb-post-';
const IMAGE_SERVICE = 'IMAGE';
const VIDEO_SERVICE = 'VIDEO';
const IMG_PREFIX = 'wb-img-';
const VID_PREFIX = 'wb-vid-';

function uuid() { return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2,10)}`; }

interface BlogPost {
  name: string; identifier: string; title: string; content: string;
  createdAt: number; updatedAt: number; status: string;
  imageIds?: string[]; videoIds?: string[];
}

export const publishPost = async (name: string, title: string, content: string, imageIds?: string[], videoIds?: string[]) => {
  const id = uuid();
  const identifier = `${BLOG_PREFIX}${id}`;
  const now = Date.now();
  const data = { version: 1, postId: id, title, content, imageIds: imageIds ?? [], videoIds: videoIds ?? [], createdAt: now, updatedAt: now, status: 'active' };
  await requestQortal({
    action: 'PUBLISH_QDN_RESOURCE', service: BLOG_SERVICE, name, identifier,
    title: title.slice(0, 80), description: 'Wildlife Blog post', tags: ['wildlife', 'blog'],
    base64: btoa(unescape(encodeURIComponent(JSON.stringify(data)))),
  });
  return { identifier, ...data };
};

export const fetchAllPosts = async (): Promise<BlogPost[]> => {
  const search = await requestQortal<Array<{ name: string; identifier: string }>>({
    action: 'SEARCH_QDN_RESOURCES', service: BLOG_SERVICE, identifier: BLOG_PREFIX,
    prefix: true, mode: 'ALL', reverse: true, limit: 100, offset: 0,
  });
  if (!Array.isArray(search)) return [];
  const posts = await Promise.all(search.map(async (item) => {
    try {
      const raw = await requestQortal<unknown>({
        action: 'FETCH_QDN_RESOURCE', service: BLOG_SERVICE, name: item.name, identifier: item.identifier,
      });
      let parsed: any;
      if (typeof raw === 'string') parsed = JSON.parse(decodeURIComponent(escape(atob(raw))));
      else parsed = raw;
      if (!parsed || parsed.status === 'deleted') return null;
      return { name: item.name, identifier: item.identifier, title: parsed.title, content: parsed.content,
        createdAt: parsed.createdAt, updatedAt: parsed.updatedAt, status: parsed.status,
        imageIds: parsed.imageIds ?? [], videoIds: parsed.videoIds ?? [] } as BlogPost;
    } catch { return null; }
  }));
  return posts.filter((p): p is BlogPost => p !== null).sort((a, b) => b.createdAt - a.createdAt);
};

export const deletePost = async (name: string, identifier: string, title: string) => {
  const now = Date.now();
  await requestQortal({
    action: 'PUBLISH_QDN_RESOURCE', service: BLOG_SERVICE, name, identifier,
    title: title.slice(0, 80), description: 'Deleted post', tags: ['wildlife', 'blog'],
    base64: btoa(unescape(encodeURIComponent(JSON.stringify({ status: 'deleted', deletedAt: now })))),
  });
};

export const uploadImage = async (name: string, file: File): Promise<{ identifier: string }> => {
  const id = uuid();
  const identifier = `${IMG_PREFIX}${id}`;
  await requestQortal({
    action: 'PUBLISH_QDN_RESOURCE', service: IMAGE_SERVICE, name, identifier,
    filename: file.name, file,
  }, { timeoutMs: 120000 });
  return { identifier };
};

export const uploadVideo = async (name: string, file: File): Promise<{ identifier: string }> => {
  const id = uuid();
  const identifier = `${VID_PREFIX}${id}`;
  await requestQortal({
    action: 'PUBLISH_QDN_RESOURCE', service: VIDEO_SERVICE, name, identifier,
    filename: file.name, file,
  }, { timeoutMs: 300000 });
  return { identifier };
};

export const getResourceUrl = async (service: string, name: string, identifier: string): Promise<string> => {
  try {
    const status = await requestQortal<{ status: string }>({
      action: 'GET_QDN_RESOURCE_STATUS', service, name, identifier,
    });
    if (['PUBLISHED', 'DOWNLOADING', 'DOWNLOADED'].includes(status?.status ?? '')) {
      await requestQortal({ action: 'BUILD_QDN_RESOURCE', service, name, identifier }).catch(() => {});
    }
  } catch { /* */ }
  return requestQortal<string>({ action: 'GET_QDN_RESOURCE_URL', service, name, identifier });
};

export const searchMedia = async (service: string, prefix: string) => {
  const search = await requestQortal<Array<{ name: string; identifier: string; title?: string }>>({
    action: 'SEARCH_QDN_RESOURCES', service, identifier: prefix,
    prefix: true, mode: 'ALL', reverse: true, limit: 500, offset: 0,
  });
  if (!Array.isArray(search)) return [];
  return search;
};
