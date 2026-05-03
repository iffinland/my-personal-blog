export const requestQortal = async <T>(payload: Record<string, unknown>, _options?: { timeoutMs?: number }): Promise<T> => {
  const qr = (window as any).qortalRequest;
  if (!qr) throw new Error('Not in Qortal environment');
  return qr(payload);
};
