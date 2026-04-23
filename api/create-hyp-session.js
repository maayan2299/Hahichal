export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { amount, orderId, customerName, customerEmail } = req.body;

    const response = await fetch('https://api.hyp.co.il/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.HYP_API_KEY.trim()
      },
      body: JSON.stringify({
        terminal: process.env.HYP_TERMINAL_ID.trim(),
        amount: Number(amount),
        currency: 'ILS',
        orderId: String(orderId),
        description: customerName || 'הזמנה',
        successUrl: 'https://www.hahiechal.co.il/success',
        cancelUrl: 'https://www.hahiechal.co.il/checkout',
        language: 'he'
      })
    });

    const text = await response.text();
    console.log('HYP Response status:', response.status);
    console.log('HYP Response:', text);

    try {
      const data = JSON.parse(text);
      if (data.url || data.paymentUrl || data.redirectUrl) {
        return res.status(200).json({ 
          url: data.url || data.paymentUrl || data.redirectUrl 
        });
      }
      throw new Error(JSON.stringify(data));
    } catch {
      throw new Error('HYP Response: ' + text.substring(0, 300));
    }

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}