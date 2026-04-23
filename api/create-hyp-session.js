export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { amount, orderId, customerName, customerEmail } = req.body;

    const params = new URLSearchParams({
      action: 'APISign',
      What: 'SIGN',
      KEY: process.env.HYP_API_KEY.trim(),
      PassP: process.env.HYP_PASSP.trim(),
      Masof: process.env.HYP_TERMINAL_ID.trim(),
      Amount: String(Math.round(Number(amount) * 100)),
      Order: String(orderId),
      Info: customerName || 'הזמנה',
      email: customerEmail || '',
      SuccessUrl: 'https://www.hahiechal.co.il/success',
      CancelUrl: 'https://www.hahiechal.co.il/checkout',
      PageLang: 'HEB',
      UTF8: 'True',
      UTF8out: 'True',
      Sign: 'True',
    });

    const response = await fetch(`https://icom.yaad.net/p/?${params.toString()}`);
    const text = await response.text();
    console.log('HYP Response:', text);

    if (text.startsWith('https')) {
      return res.status(200).json({ url: text.trim() });
    }

    throw new Error('HYP Error: ' + text.substring(0, 300));

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}