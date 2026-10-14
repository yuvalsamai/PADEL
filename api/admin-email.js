// Admin-only email actions, called from the /YUVAL panel:
//   POST { action: 'test' }                 → sends a sample confirmation to the admin
//   POST { action: 'resend', orderId: 123 } → re-sends an order's confirmation
// Auth: the admin's Supabase session token (Authorization: Bearer …), checked
// server-side against ADMIN_EMAIL — the same single admin the database allows.

import { createClient } from '@supabase/supabase-js';
import { recordEmailResult, sendOrderEmail } from './_orderEmail.js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://uwmydcfhedcquktxqsis.supabase.co';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'yuvalsamai@gmail.com').toLowerCase();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Server is not fully configured' });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const { data: auth } = token ? await supabase.auth.getUser(token) : { data: null };
  if (!auth?.user?.email || auth.user.email.toLowerCase() !== ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { action, orderId } = req.body || {};

  if (action === 'test') {
    const result = await sendOrderEmail({
      to: auth.user.email,
      subjectPrefix: '[בדיקה] ',
      name: 'לקוח לדוגמה',
      order: 'TEST-0001',
      product: 'תושבת NETCAM · שחור',
      quantity: 1,
      amount: 89,
      address: 'הרצל 1, תל אביב-יפו 6100001',
    });
    return res.status(200).json({ ...result, to: auth.user.email });
  }

  if (action === 'resend') {
    const id = Number(orderId);
    if (!id) return res.status(400).json({ error: 'orderId is required' });
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_ref, customer_id, customer_name, product, quantity, amount')
      .eq('id', id)
      .maybeSingle();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const { data: cust } = order.customer_id
      ? await supabase.from('customers').select('email').eq('id', order.customer_id).maybeSingle()
      : { data: null };
    const { data: ship } = await supabase
      .from('shipments').select('address').eq('order_id', id).limit(1).maybeSingle();

    const result = await sendOrderEmail({
      to: cust?.email,
      name: order.customer_name,
      order: order.order_ref,
      product: order.product,
      quantity: order.quantity,
      amount: order.amount,
      address: ship?.address,
    });
    await recordEmailResult(supabase, id, result);
    return res.status(200).json({ ...result, to: cust?.email || null });
  }

  return res.status(400).json({ error: 'Unknown action' });
}
