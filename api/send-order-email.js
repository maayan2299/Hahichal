import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { orderNumber, customerName, customerEmail, items, total } = req.body;

  try {
    await resend.emails.send({
      from: 'ההיכל <orders@hahiechal.co.il>',
      to: customerEmail,
      subject: `אישור הזמנה ${orderNumber}`,
      html: `<div dir="rtl">
        <h2>תודה על הזמנתך, ${customerName}!</h2>
        <p>הזמנה מספר: <strong>${orderNumber}</strong></p>
        <p>סה"כ לתשלום: ₪${total}</p>
      </div>`
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}