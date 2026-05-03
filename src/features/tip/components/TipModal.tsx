import { useState, useEffect, type FC } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { getWalletBalance, sendTip } from '../../../services/qdn/tipService';

interface TipModalProps { open: boolean; onClose: () => void; recipientName?: string; }

const TipModal: FC<TipModalProps> = ({ open, onClose, recipientName = 'iffi' }) => {
  const [amount, setAmount] = useState('10');
  const [balance, setBalance] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setDone(false); setError(''); setSending(false); setAmount('10');
      getWalletBalance().then(setBalance).catch(() => setBalance(null));
    }
  }, [open]);

  const handleSend = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) { setError('Enter a valid amount'); return; }
    setSending(true); setError('');
    try {
      await sendTip(recipientName, val);
      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to send tip');
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>💚 Support this blog</DialogTitle>
      <DialogContent>
        {done ? (
          <Typography sx={{ textAlign: 'center', py: 3, color: 'success.main' }}>
            ✅ Thank you for your support! 🎉
          </Typography>
        ) : (
          <>
            {balance !== null && <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>Your balance: <strong>{balance} QORT</strong></Typography>}
            <TextField fullWidth label="Amount (QORT)" type="number" value={amount}
              onChange={(e) => setAmount(e.target.value)} disabled={sending}
              inputProps={{ min: 1, step: 1 }} sx={{ mb: 1 }} />
            {error && <Typography color="error" variant="caption">{error}</Typography>}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{done ? 'Close' : 'Cancel'}</Button>
        {!done && <Button variant="contained" onClick={handleSend} disabled={sending}>{sending ? 'Sending...' : 'Send ❤️'}</Button>}
      </DialogActions>
    </Dialog>
  );
};

export default TipModal;
