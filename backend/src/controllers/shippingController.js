const ShippingSettings = require('../models/ShippingSettings');
const { SiteSettings } = require('../models/ShippingSettings');

// Default values used when no settings doc exists yet
const DEFAULTS = {
  prepaidFreeThreshold: 499,
  prepaidCharge:        79,
  codEnabled:           true,
  codThreshold:         499,
  codChargeBelow:       79,
  codChargeAbove:       20,
  giftWrapEnabled:      true,
  giftWrapPrice:        49,
};

// ─── GET /api/settings/shipping — public ──────────────────────────────────────
exports.getShipping = async (req, res) => {
  let settings = await ShippingSettings.findOne().lean();
  if (!settings) settings = DEFAULTS;
  res.json({ success: true, settings });
};

// ─── PUT /api/settings/shipping — admin only ──────────────────────────────────
exports.updateShipping = async (req, res) => {
  const {
    prepaidFreeThreshold,
    prepaidCharge,
    codEnabled,
    codThreshold,
    codChargeBelow,
    codChargeAbove,
    giftWrapEnabled,
    giftWrapPrice,
  } = req.body;

  // Validate numeric fields: no negative charges
  const numericFields = { prepaidFreeThreshold, prepaidCharge, codThreshold, codChargeBelow, codChargeAbove, giftWrapPrice };
  for (const [key, val] of Object.entries(numericFields)) {
    if (val !== undefined && (isNaN(val) || Number(val) < 0)) {
      return res.status(400).json({ success: false, message: `${key} must be a non-negative number` });
    }
  }

  const fields = { ...numericFields };
  if (codEnabled !== undefined) fields.codEnabled = Boolean(codEnabled);
  if (giftWrapEnabled !== undefined) fields.giftWrapEnabled = Boolean(giftWrapEnabled);

  const settings = await ShippingSettings.findOneAndUpdate(
    {},
    { $set: fields },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, settings });
};

// ─── GET /api/settings — public (returns site logo + shipping) ───────────────
exports.getSiteSettings = async (req, res) => {
  const site = await SiteSettings.findOne().lean();
  res.json({
    success: true,
    settings: {
      logoUrl:     site?.logoUrl    || '',
      logoWidth:   site?.logoWidth  || '120px',
      logoHeight:  site?.logoHeight || 'auto',
      logoAlt:     site?.logoAlt    || 'Clever Cat',
      faqsEnabled: site?.faqsEnabled ?? true,
      shopVideoHeading: site?.shopVideoHeading || "Parent's Choice",
    },
  });
};

// ─── PUT /api/settings/faqs — admin only — master ON/OFF for the FAQs feature ─
exports.updateFaqsEnabled = async (req, res) => {
  const { faqsEnabled } = req.body;
  const site = await SiteSettings.findOneAndUpdate(
    {},
    { $set: { faqsEnabled: Boolean(faqsEnabled) } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, settings: site });
};

// ─── PUT /api/settings/shop-video-heading — admin only ────────────────────────
exports.updateShopVideoHeading = async (req, res) => {
  const { shopVideoHeading } = req.body;
  if (!shopVideoHeading || !shopVideoHeading.trim()) {
    return res.status(400).json({ success: false, message: 'Heading cannot be empty' });
  }
  const site = await SiteSettings.findOneAndUpdate(
    {},
    { $set: { shopVideoHeading: shopVideoHeading.trim() } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, settings: site });
};

// ─── PUT /api/settings/logo — admin only ──────────────────────────────────────
exports.updateSiteLogo = async (req, res) => {
  const { logoWidth, logoHeight, logoAlt, logo: logoUrlField } = req.body;

  // If a file was uploaded via multer, use its URL; if a URL string was sent
  // instead (Choose-from-Media / already uploaded via the Media Library), use
  // that; otherwise keep the existing logo untouched.
  let logoUrl;
  if (req.file) {
    // Cloudinary storage: file.path = secure_url (absolute https URL)
    // Disk storage:       store as root-relative path so it works through
    //                     any proxy (Vite dev, Vercel, nginx, etc.)
    logoUrl = req.file.path?.startsWith('http')
      ? req.file.path
      : `/uploads/logos/${req.file.filename}`;
  } else if (logoUrlField) {
    logoUrl = logoUrlField;
  }

  const update = {};
  if (logoUrl)    update.logoUrl    = logoUrl;
  if (logoWidth)  update.logoWidth  = logoWidth;
  if (logoHeight) update.logoHeight = logoHeight;
  if (logoAlt)    update.logoAlt    = logoAlt;

  const site = await SiteSettings.findOneAndUpdate(
    {},
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, settings: site });
};

// ─── Helper: calculate shipping charge (used by order controller) ─────────────
exports.calculateShipping = async (subtotal, paymentMethod) => {
  let s = await ShippingSettings.findOne().lean();
  if (!s) s = DEFAULTS;

  // Partial COD still requires a cash collection on delivery, so it uses
  // the same shipping tiers as plain COD.
  if (paymentMethod === 'cod' || paymentMethod === 'partial_cod') {
    return subtotal >= s.codThreshold ? s.codChargeAbove : s.codChargeBelow;
  }
  // Prepaid / Razorpay / any online method
  return subtotal >= s.prepaidFreeThreshold ? 0 : s.prepaidCharge;
};
