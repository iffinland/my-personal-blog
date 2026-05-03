import { requestQortal } from '../qortal/qortalClient';

const SERVICE = 'QAB_FEEDBACK';
const PREFIX = 'wb-guestbook-';

function uuid() { return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2,10)}`; }

export interface GuestbookMessage {
  id: string; userName: string; message: string; createdAt: number;
}

export const postMessage = async (userName: string, message: string) => {
  const id = uuid();
  const identifier = `${PREFIX}${id}`;
  const now = Date.now();
  const data = { version: 1, id, userName, message, createdAt: now };
  await requestQortal({
    action: 'PUBLISH_QDN_RESOURCE', service: SERVICE, name: userName, identifier,
    title: `Guestbook entry by ${userName}`, description: 'Wildlife Blog guestbook',
    tags: ['guestbook', 'wildlife'],
    base64: btoa(unescape(encodeURIComponent(JSON.stringify(data)))),
  });
  return { ...data, identifier };
};

export const fetchAllMessages = async (): Promise<GuestbookMessage[]> => {
  const search = await requestQortal<Array<{ name: string; identifier: string }>>({
    action: 'SEARCH_QDN_RESOURCES', service: SERVICE, identifier: PREFIX,
    prefix: true, mode: 'ALL', reverse: true, limit: 500, offset: 0,
  });
  if (!Array.isArray(search)) return [];
  const entries = await Promise.all(search.map(async (item) => {
    try {
      const raw = await requestQortal<unknown>({
        action: 'FETCH_QDN_RESOURCE', service: SERVICE, name: item.name, identifier: item.identifier,
      });
      let parsed: any;
      if (typeof raw === 'string') parsed = JSON.parse(decodeURIComponent(escape(atob(raw))));
      else parsed = raw;
      if (!parsed) return null;
      return { id: parsed.id, userName: parsed.userName, message: parsed.message, createdAt: parsed.createdAt } as GuestbookMessage;
    } catch { return null; }
  }));
  return entries.filter((e): e is GuestbookMessage => e !== null).sort((a, b) => b.createdAt - a.createdAt);
};
