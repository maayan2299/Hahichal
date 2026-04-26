export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { amount, orderId, customerName, customerEmail } = req.body;

    const MASOF = process.env.HYP_TERMINAL_ID.trim();
    const KEY = process.env.HYP_API_KEY.trim();
    const PASSP = process.env.HYP_PASSP.trim();

    const apiSignParams = new URLSearchParams({
      action: 'APISign',
      What: 'SIGN',
      KEY: KEY,
      PassP: PASSP,
      Masof: MASOF,
      Amount: String(Math.round(Number(amount))),
      Order: String(orderId),
      Info: customerName || 'הזמנה',
      email: customerEmail || '',
      SuccessUrl: `https://www.hahiechal.co.il/success?order=${orderId}`,      CancelUrl: 'https://www.hahiechal.co.il/checkout',
      PageLang: 'HEB',
      UTF8: 'True',
      UTF8out: 'True',
      Sign: 'True',
    });

    const signResponse = await fetch(`https://icom.yaad.net/p/?${apiSignParams.toString()}`);
    const signText = await signResponse.text();
    console.log('Step 1 response:', signText);

    const signParams = new URLSearchParams(signText);
    const signature = signParams.get('signature');

    if (!signature) {
      throw new Error('לא התקבל signature: ' + signText.substring(0, 200));
    }

    const paymentParams = new URLSearchParams({
      action: 'pay',
      Masof: MASOF,
      Order: String(orderId),
      Amount: String(Math.round(Number(amount))),
      Info: customerName || 'הזמנה',
      email: customerEmail || '',
      SuccessUrl: `https://www.hahiechal.co.il/success?order=${orderId}`,      CancelUrl: 'https://www.hahiechal.co.il/checkout',
      PageLang: 'HEB',
      UTF8: 'True',
      UTF8out: 'True',
      Sign: 'True',
      signature: signature,
    });

    const paymentUrl = `https://icom.yaad.net/p/?${paymentParams.toString()}`;
    return res.status(200).json({ url: paymentUrl });

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}