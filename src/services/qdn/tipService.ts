import { requestQortal } from '../qortal/qortalClient';

export const getWalletBalance = async (): Promise<number> => {
  try {
    const acct = await requestQortal<{ balance?: number }>({ action: 'GET_USER_ACCOUNT' });
    return acct?.balance ?? 0;
  } catch {
    try {
      const info = await requestQortal<{ qort?: number }>({ action: 'GET_USER_WALLET' });
      return info?.qort ?? 0;
    } catch { return 0; }
  }
};

export const sendTip = async (recipientName: string, amount: number): Promise<void> => {
  await requestQortal({
    action: 'SEND_TIP',
    name: recipientName,
    amount,
  });
};
