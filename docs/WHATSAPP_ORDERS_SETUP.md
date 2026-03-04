# WhatsApp Orders (wa.me)

Orders are sent **directly via WhatsApp** using a `wa.me` link. There is **no backend, no API, no webhook**. The customer fills the form, clicks **Confirm Order**, and is redirected to WhatsApp with a pre-filled message. They press Send inside WhatsApp to complete the order.

## How It Works

1. You set your **WhatsApp number** (country code + number, e.g. `212600000000`) in **Admin Dashboard → GitHub Sync**.
2. Customer fills the checkout form (Name, Phone, City, Notes) and clicks **Confirm Order**.
3. The site builds a formatted message with order details and opens:
   `https://wa.me/WHATSAPP_NUMBER?text=ENCODED_MESSAGE`
4. The customer confirms and sends the message inside WhatsApp.

## Setup

1. Open **Admin Dashboard → GitHub Sync** (or مزامنة GitHub).
2. In **WhatsApp number for orders**, enter your number **with country code only**:
   - Example: `212600000000` (Morocco)
   - No `+`, no spaces, no `https://` or `wa.me`.
3. Click **Save settings**.
4. Optionally click **Sync now** so the number is saved to `data/store-data.json` and used on all devices.

## Message Format

The pre-filled WhatsApp message includes:

- **New order** heading
- Name, Phone, City
- Notes (if any)
- **Items:** product name, color, quantity, price per line
- **Total:** in MAD

The customer can edit the message before sending.

## No Backend Required

- No API routes, no Vercel/Netlify functions, no webhooks.
- The WhatsApp number is stored in settings (and optionally in `store-data.json` when you sync).
- Changing the number in the Admin Dashboard updates it for all future orders immediately.
