export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, orderId, customerName } = req.body;

    // כאן אנחנו פונים לשרתים של HYP
    const response = await fetch('https://pay.hyp.co.il/api/v1/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HYP_API_KEY}`
      },
      body: JSON.stringify({
        terminal: process.env.HYP_TERMINAL_ID,
        passp: process.env.HYP_PASSP,
        amount: amount,
        order: orderId,
        customer_name: customerName,
        success_url: `https://${req.headers.host}/success?order=${orderId}`,
        cancel_url: `https://${req.headers.host}/cart`,
        language: 'he',
        // כאן אפשר להוסיף 'test: 1' אם רוצים מצב בדיקה, 
        // אבל HYP בדרך כלל דורשים הגדרה במסוף עצמו
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment session');
    }

    // מחזירים את הקישור לדף התשלום המאובטח של HYP
    res.status(200).json({ url: data.url });
  } catch (error) {
    console.error('Payment Error:', error);
    res.status(500).json({ error: error.message });
  }
}