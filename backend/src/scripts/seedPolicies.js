require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const Policy = require('../models/Policy');
const connectDB = require('../config/db');

const POLICIES = [
  {
    title: 'Privacy Policy',
    order: 1,
    content: `
<p>At Clever Cat, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains what information we collect, how we use it, and the choices you have.</p>

<h2>1. Information We Collect</h2>
<p>When you browse our store, create an account, or place an order, we may collect:</p>
<ul>
<li>Name, email address and phone number</li>
<li>Shipping and billing address</li>
<li>Order history and product preferences</li>
<li>Payment details processed securely via Razorpay (we do not store your card, UPI or bank details)</li>
<li>Device and browsing information such as IP address, browser type and cookies</li>
</ul>

<h2>2. How We Use Your Information</h2>
<ul>
<li>To process and deliver your orders</li>
<li>To send order confirmations, shipping updates and delivery notifications</li>
<li>To respond to your queries, returns or support requests</li>
<li>To send offers, discount codes and newsletters (only if you've opted in)</li>
<li>To improve our website, products and shopping experience</li>
<li>To prevent fraud and keep your account secure</li>
</ul>

<h2>3. Payment Security</h2>
<p>All online payments are processed through Razorpay, a PCI-DSS compliant payment gateway. Clever Cat does not collect or store your card, UPI or net banking credentials on its servers at any point.</p>

<h2>4. Sharing of Information</h2>
<p>We do not sell or rent your personal information to third parties. We share your details only with:</p>
<ul>
<li>Our shipping and logistics partners, to deliver your order to the correct address</li>
<li>Our payment gateway (Razorpay), to process transactions securely</li>
<li>Service providers who help us run the website (such as hosting and email services), under confidentiality obligations</li>
<li>Law enforcement or regulatory authorities, where required by law</li>
</ul>

<h2>5. Cookies</h2>
<p>Our website uses cookies to keep you logged in, remember items in your cart and wishlist, and understand how visitors use our site. You can disable cookies from your browser settings, though some features of the site may not work as intended.</p>

<h2>6. Your Choices</h2>
<ul>
<li>You can view and update your account details anytime from your profile page</li>
<li>You can unsubscribe from marketing emails using the link in any newsletter</li>
<li>You can request deletion of your account and personal data by writing to us</li>
</ul>

<h2>7. Children's Privacy</h2>
<p>While our products are designed for children, our website and checkout are intended to be used by parents or guardians. We do not knowingly collect personal information directly from children.</p>

<h2>8. Data Security</h2>
<p>We use industry-standard measures to protect your information from unauthorised access, alteration or disclosure. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.</p>

<h2>9. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time to reflect changes in our practices. The updated version will be posted on this page with a revised date.</p>

<h2>10. Contact Us</h2>
<p>If you have any questions about this Privacy Policy or how your data is handled, write to us at <a href="mailto:coordination@theclevercat.in">coordination@theclevercat.in</a> or call us at +91 92181 71625 (Mon–Sat, 9 AM – 7 PM).</p>
`.trim(),
  },
  {
    title: 'Terms & Conditions',
    order: 2,
    content: `
<p>Welcome to Clever Cat. By accessing or using our website and placing an order with us, you agree to be bound by the following Terms &amp; Conditions. Please read them carefully before shopping with us.</p>

<h2>1. About Us</h2>
<p>Clever Cat is an online store offering children's story books, activity books, puzzles, flash cards, craft kits and learning products, curated and age-tagged for parents shopping in India.</p>

<h2>2. Eligibility</h2>
<p>Our website is intended for use by adults (18 years and above) purchasing on behalf of or for children. By placing an order, you confirm that you are legally capable of entering into a binding contract.</p>

<h2>3. Account Registration</h2>
<p>You are responsible for maintaining the confidentiality of your account and password, and for all activities carried out under your account. Please notify us immediately of any unauthorised use.</p>

<h2>4. Products &amp; Pricing</h2>
<ul>
<li>All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes, unless stated otherwise</li>
<li>Product images are for representation purposes; actual packaging or cover design may vary slightly</li>
<li>We reserve the right to change prices, descriptions or discontinue any product without prior notice</li>
<li>In case of a pricing or listing error, we reserve the right to cancel the affected order and issue a full refund</li>
</ul>

<h2>5. Orders</h2>
<p>Placing an order on Clever Cat is an offer to purchase. An order is confirmed only once payment is successfully received (or, for Cash on Delivery orders, once we confirm the order). We reserve the right to refuse or cancel any order due to stock unavailability, suspected fraud, or incorrect pricing.</p>

<h2>6. Payments</h2>
<p>We accept the following payment methods:</p>
<ul>
<li><strong>Pay Online</strong> — UPI, Credit/Debit Cards and Net Banking via Razorpay</li>
<li><strong>Cash on Delivery (COD)</strong> — pay in cash when your order is delivered, subject to a small COD handling charge</li>
<li><strong>Partial COD</strong> — pay a percentage of the order online in advance, with the remaining amount due on delivery</li>
</ul>

<h2>7. Shipping &amp; Delivery</h2>
<p>We currently deliver Pan India. Delivery timelines, shipping charges and tracking details are described in our <a href="/policy/shipping-policy">Shipping Policy</a>.</p>

<h2>8. Cancellations, Returns &amp; Refunds</h2>
<ul>
<li>Orders can be cancelled free of charge as long as they have not been shipped</li>
<li>Once an order is shipped, it cannot be cancelled but may be eligible for return as per our return guidelines, subject to the product being unused, unopened and in its original packaging</li>
<li>Approved refunds are credited back to the original mode of payment (or bank account, for COD orders) within 7–10 business days of the returned item being received and inspected</li>
<li>Personalised, opened, or used items are not eligible for return unless found defective or damaged on arrival</li>
</ul>

<h2>9. Coupons &amp; Promotions</h2>
<p>Discount codes and promotional offers are valid only for the period specified and subject to any minimum order value or usage limits mentioned at the time of the offer. Clever Cat reserves the right to modify or withdraw any offer at its discretion.</p>

<h2>10. Intellectual Property</h2>
<p>All content on this website — including the Clever Cat name, logo, product descriptions, images and design — is the property of Clever Cat and may not be reproduced, copied or used without prior written permission.</p>

<h2>11. User Conduct</h2>
<p>You agree not to misuse the website, attempt unauthorised access to our systems, post false reviews, or use the site for any unlawful purpose.</p>

<h2>12. Limitation of Liability</h2>
<p>Clever Cat shall not be liable for any indirect, incidental or consequential damages arising from the use of our products or website, to the extent permitted by applicable law.</p>

<h2>13. Governing Law</h2>
<p>These Terms &amp; Conditions are governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the competent courts.</p>

<h2>14. Changes to These Terms</h2>
<p>We may revise these Terms &amp; Conditions from time to time. Continued use of the website after changes are posted constitutes your acceptance of the updated terms.</p>

<h2>15. Contact Us</h2>
<p>For any questions regarding these Terms, reach us at <a href="mailto:coordination@theclevercat.in">coordination@theclevercat.in</a> or +91 92181 71625 (Mon–Sat, 9 AM – 7 PM).</p>
`.trim(),
  },
  {
    title: 'Shipping Policy',
    order: 3,
    content: `
<p>We know how excited little ones are to receive their books and activity kits — here's everything you need to know about how we get your Clever Cat order to your doorstep.</p>

<h2>1. Delivery Coverage</h2>
<p>We currently deliver Pan India through our trusted courier and logistics partners. At this time, we do not offer international shipping.</p>

<h2>2. Order Processing Time</h2>
<p>Orders are processed and handed over to our courier partner within 1–2 business days of confirmation. Orders placed on Sundays or public holidays are processed the next business day.</p>

<h2>3. Delivery Timeline</h2>
<p>Once shipped, most orders are delivered within <strong>5 to 7 business days</strong>, depending on your location. Deliveries to remote or non-serviceable pin codes may take a little longer.</p>

<h2>4. Shipping Charges</h2>
<table>
<tbody>
<tr><td><strong>Payment Method</strong></td><td><strong>Order Value</strong></td><td><strong>Shipping Charge</strong></td></tr>
<tr><td>Pay Online (Razorpay)</td><td>₹499 and above</td><td>Free</td></tr>
<tr><td>Pay Online (Razorpay)</td><td>Below ₹499</td><td>₹79</td></tr>
<tr><td>Cash on Delivery</td><td>₹499 and above</td><td>₹20 COD handling fee</td></tr>
<tr><td>Cash on Delivery</td><td>Below ₹499</td><td>₹79</td></tr>
</tbody>
</table>
<p>Exact shipping charges are always shown at checkout before you place your order.</p>

<h2>5. Order Tracking</h2>
<p>As soon as your order is shipped, you'll receive a shipping confirmation with a tracking link via email/SMS. You can also check your order status anytime from the <a href="/orders">My Orders</a> section of your account.</p>

<h2>6. Gift Wrapping</h2>
<p>Want to make it a surprise? You can add gift wrap to any order at checkout for ₹49.</p>

<h2>7. Failed Delivery Attempts</h2>
<p>Our courier partners typically make up to 2–3 delivery attempts. Please ensure your address and phone number are accurate and reachable. If an order is undelivered after multiple attempts, it will be returned to us, and we will reach out to arrange re-shipping (additional shipping charges may apply) or a refund, as applicable.</p>

<h2>8. Delays</h2>
<p>While we work hard to meet our delivery timelines, factors like weather, regional restrictions, courier delays or remote locations may occasionally cause delays beyond our control. We appreciate your patience and will keep you informed in such cases.</p>

<h2>9. Damaged or Incorrect Items</h2>
<p>Please inspect your package on delivery. If you receive a damaged, defective or incorrect item, contact us within 48 hours of delivery at <a href="mailto:coordination@theclevercat.in">coordination@theclevercat.in</a> along with your order number and photos of the item, and we'll arrange a replacement or refund promptly.</p>

<h2>10. Need Help?</h2>
<p>For any shipping-related questions, reach out to us at <a href="mailto:coordination@theclevercat.in">coordination@theclevercat.in</a> or call/WhatsApp us at +91 92181 71625 (Mon–Sat, 9 AM – 7 PM).</p>
`.trim(),
  },
];

// Matches existing placeholder policies by keyword so re-running this script
// fills in content on the pages already created in the admin panel, instead
// of creating title-mismatched duplicates (e.g. "Terms & Condition" vs
// "Terms & Conditions").
const MATCH_KEYWORDS = {
  'Privacy Policy': /privacy/i,
  'Terms & Conditions': /terms/i,
  'Shipping Policy': /shipping/i,
};

async function seedPolicies() {
  await connectDB();

  for (const p of POLICIES) {
    const existing = await Policy.findOne({ title: MATCH_KEYWORDS[p.title] });
    if (existing) {
      existing.content = p.content;
      existing.isActive = true;
      await existing.save();
      console.log(`✅ Updated existing policy "${existing.title}" (/${existing.slug})`);
    } else {
      const created = await Policy.create({ title: p.title, content: p.content, order: p.order, isActive: true });
      console.log(`✅ Created new policy "${created.title}" (/${created.slug})`);
    }
  }

  console.log('\n🎉 Policies seeded successfully!');
}

module.exports = seedPolicies;

if (require.main === module) {
  seedPolicies()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed policies error:', err);
      process.exit(1);
    });
}
