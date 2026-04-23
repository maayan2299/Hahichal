export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { amount, orderId, customerName } = req.body;

    const response = await fetch('https://pay.hyp.co.il/api/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HYP_API_KEY.trim()}`
      },
      body: JSON.stringify({
        terminal: process.env.HYP_TERMINAL_ID.trim(),
        passp: process.env.HYP_PASSP?.trim(),
        amount: Number(amount), // חייב להיות מספר
        order: String(orderId),
        customer_name: customerName,
        success_url: `https://${req.headers.host}/success?order=${orderId}`,
        cancel_url: `https://${req.headers.host}/checkout`,
        language: 'he'
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'HYP Error');

    res.status(200).json({ url: data.url });
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
}