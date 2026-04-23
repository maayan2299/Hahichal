export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { amount, orderId, customerName } = req.body;

  // המשתנים החדשים שאת מגדירה ב-Vercel
  const TERMINAL = process.env.HYP_TERMINAL;
  const USERNAME = process.env.HYP_USERNAME;
  const PASSWORD = process.env.HYP_PASSWORD;
  const HYP_URL = 'https://cg.creditguard.co.il/xpo/Relay';

  // שינוי 1: המרה לאגורות (המערכת הישנה עובדת רק ככה)
  const totalInAgorot = Math.round(parseFloat(amount) * 100);

  // שינוי 2: בניית ה-XML (הפורמט שהמסוף שלך דורש)
  const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<ashrait>
  <request>
    <version>2000</version>
    <language>HEB</language>
    <command>doDeal</command>
    <doDeal>
      <terminalNumber>${TERMINAL}</terminalNumber>
      <cardNo>CGMPI</cardNo>
      <total>${totalInAgorot}</total>
      <transactionType>Debit</transactionType>
      <creditType>RegularCredit</creditType>
      <currency>ILS</currency>
      <transactionCode>Internet</transactionCode>
      <validation>TxnSetup</validation>
      <uniqueid>${orderId}</uniqueid>
      <mpiValidation>AutoComm</mpiValidation>
      <successUrl>https://${req.headers.host}/success?order=${orderId}</successUrl>
      <errorUrl>https://${req.headers.host}/checkout</errorUrl>
      <cancelUrl>https://${req.headers.host}/checkout</cancelUrl>
      <customerName>${customerName || 'לקוח אתר'}</customerName>
    </doDeal>
  </request>
</ashrait>`;

  try {
    // שינוי 3: שיטת אימות "Basic Auth" (שילוב של שם משתמש וסיסמה מוצפנים)
    const credentials = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');

    const response = await fetch(HYP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: new URLSearchParams({ int_in: xmlPayload }).toString()
    });

    const responseText = await response.text();
    
    // שינוי 4: חילוץ הקישור מתוך ה-XML שחזר מהם
    const urlMatch = responseText.match(/<mpiHostedPageUrl>([\s\S]*?)<\/mpiHostedPageUrl>/);
    const statusMatch = responseText.match(/<status>(.*?)<\/status>/);

    if (urlMatch && statusMatch && statusMatch[1].trim() === '000') {
      // מחזירים את ה-URL בדיוק כמו שה-Checkout מצפה לקבל
      return res.status(200).json({ url: urlMatch[1].trim() });
    } else {
      console.error('HYP Error Response:', responseText);
      return res.status(400).json({ error: 'שגיאה מול חברת האשראי' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}