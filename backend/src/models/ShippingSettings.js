const mongoose = require('mongoose');

// Singleton document — only one record ever exists (use findOneAndUpdate + upsert)
const shippingSettingsSchema = new mongoose.Schema(
  {
    // ── Prepaid (online payment) ──────────────────────────────────────────────
    prepaidFreeThreshold: { type: Number, default: 499 }, // subtotal >= this → free shipping
    prepaidCharge:        { type: Number, default: 79  }, // charge when subtotal < threshold

    // ── COD ───────────────────────────────────────────────────────────────────
    // COD never has "free" shipping — just a higher vs lower surcharge
    codEnabled:     { type: Boolean, default: true }, // global ON/OFF — admin toggles from Settings
    codThreshold:   { type: Number,  default: 499  }, // subtotal threshold for COD tiers
    codChargeBelow: { type: Number,  default: 79   }, // COD charge when subtotal < threshold
    codChargeAbove: { type: Number,  default: 20   }, // COD charge when subtotal >= threshold

    // ── Gift wrap ─────────────────────────────────────────────────────────────
    giftWrapEnabled: { type: Boolean, default: true },
    giftWrapPrice:   { type: Number,  default: 49   }, // flat fee added when customer opts in at checkout

    // ── Magazines (e.g. IQ Junior) ────────────────────────────────────────────
    // Magazines ship separately from books and always carry this flat surcharge
    // (both prepaid and COD), on top of whatever the book portion of the cart
    // charges. The free-shipping-above-threshold offer never applies to them —
    // only to the non-magazine (book) subtotal.
    magazineCategorySlug:   { type: String, default: 'kids-magazine' },
    magazineShippingCharge: { type: Number, default: 400 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShippingSettings', shippingSettingsSchema);

// ─── Site Settings (singleton) ────────────────────────────────────────────────
// Stores the global site logo + size. Only ONE document ever exists.
const siteSettingsSchema = new mongoose.Schema(
  {
    logoUrl:    { type: String, default: '' },
    logoWidth:  { type: String, default: '120px' },
    logoHeight: { type: String, default: 'auto' },
    logoAlt:    { type: String, default: 'Clever Cat' },

    // Global ON/OFF for the whole FAQs feature — when off, the FAQs tab is
    // hidden storefront-wide regardless of individual FAQ isActive flags.
    faqsEnabled: { type: Boolean, default: true },

    // Heading shown above the "Shop by Video" carousel on the homepage
    shopVideoHeading: { type: String, default: "Parent's Choice" },

    // Homepage hero banner slider — autoplay ON/OFF and interval (ms)
    bannerAutoplay:      { type: Boolean, default: true },
    bannerAutoplaySpeed: { type: Number,  default: 5000 },
  },
  { timestamps: true }
);

module.exports.SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
