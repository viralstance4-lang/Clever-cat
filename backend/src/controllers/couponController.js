const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

// ─── Shared validation helper ─────────────────────────────────────────────────
// True if this account (by user id) or this email (guest checkouts) has ever
// placed an order before — used to gate firstOrderOnly coupons. Matches email
// against both shippingAddress.email (always set — the checkout form requires
// it regardless of login state) and guestInfo.email, case-insensitively, since
// neither field is normalised to lowercase on save.
async function hasOrderedBefore({ userId, email }) {
  const conditions = [];
  if (userId) conditions.push({ user: userId });
  if (email) {
    const re = new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    conditions.push({ 'shippingAddress.email': re });
    conditions.push({ 'guestInfo.email': re });
  }
  if (conditions.length === 0) return false; // no identity to check — caller decides how to treat this
  return !!(await Order.exists({ $or: conditions }));
}

function computeDiscount(coupon, subtotal) {
  let amount = 0;
  if (coupon.discountType === 'free_gift') {
    return 0; // free-gift coupons don't reduce the cart total
  }
  if (coupon.discountType === 'percentage') {
    amount = Math.round(subtotal * coupon.discountValue / 100);
    if (coupon.maxDiscountAmount > 0) amount = Math.min(amount, coupon.maxDiscountAmount);
  } else {
    amount = coupon.discountValue;
  }
  return Math.min(amount, subtotal); // never exceed cart value
}

// ─── POST /api/coupons/validate — public ──────────────────────────────────────
exports.validateCoupon = async (req, res) => {
  const { code, subtotal = 0 } = req.body;
  if (!code?.trim()) {
    return res.status(400).json({ success: false, message: 'Coupon code is required' });
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() }).populate('giftProduct');

  if (!coupon) {
    return res.status(400).json({ success: false, message: 'Invalid coupon code' });
  }
  if (!coupon.isActive) {
    return res.status(400).json({ success: false, message: 'This coupon is no longer active' });
  }
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return res.status(400).json({ success: false, message: 'This coupon has expired' });
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
  }
  if (subtotal < coupon.minOrderValue) {
    return res.status(400).json({
      success: false,
      message: `Minimum order of ₹${coupon.minOrderValue.toLocaleString('en-IN')} required for this coupon`,
    });
  }
  if (coupon.firstOrderOnly) {
    const email = req.body.email || req.user?.email;
    // No identity to check yet (anonymous guest, email not entered) — don't
    // assume eligibility, since that's exactly how a repeat guest customer
    // would keep seeing this coupon "work" on the cart page before checkout.
    if (!req.user?.id && !email) {
      return res.status(400).json({ success: false, message: 'Enter your email to check eligibility for this coupon' });
    }
    const ordered = await hasOrderedBefore({ userId: req.user?.id, email });
    if (ordered) {
      return res.status(400).json({ success: false, message: 'This coupon is valid only on your first order' });
    }
  }

  // Free-gift coupons require the gift product to be in stock
  let giftProduct = null;
  if (coupon.discountType === 'free_gift') {
    if (!coupon.giftProduct || coupon.giftProduct.stock === 0) {
      return res.status(400).json({ success: false, message: 'Free gift currently unavailable' });
    }
    giftProduct = {
      _id:   coupon.giftProduct._id,
      name:  coupon.giftProduct.name,
      image: coupon.giftProduct.images?.[0]?.url,
      price: coupon.giftProduct.price,
    };
  }

  const discountAmount = computeDiscount(coupon, subtotal);

  res.json({
    success: true,
    coupon: {
      code:               coupon.code,
      discount:           discountAmount,
      type:               coupon.discountType,
      rate:               coupon.discountValue,
      maxDiscountAmount:  coupon.maxDiscountAmount || 0,
      description:        coupon.description,
      minOrderValue:      coupon.minOrderValue,
      applicationMode:    coupon.applicationMode,
      giftProduct,
    },
  });
};

// ─── POST /api/coupons/auto-apply — public: best auto-apply coupon for cart ───
// Frontend calls this whenever the cart subtotal changes (when no manual coupon
// is active) so qualifying "Auto Apply" coupons attach without a code.
exports.getAutoApplyCoupon = async (req, res) => {
  const { subtotal = 0 } = req.body;
  const now = new Date();

  const validityFilter = {
    isActive: true,
    $and: [
      { $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
      { $or: [{ usageLimit: 0 }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }] },
    ],
  };

  const benefitOf = (c) => c.discountType === 'free_gift'
    ? (c.giftProduct?.price || 0)
    : computeDiscount(c, subtotal);

  // ── Find the best currently-qualifying auto-apply coupon ──────────────────
  const candidates = await Coupon.find({
    ...validityFilter,
    applicationMode: 'auto',
    minOrderValue: { $gt: 0, $lte: subtotal },
  }).populate('giftProduct');

  let eligible = candidates.filter(c =>
    c.discountType !== 'free_gift' || (c.giftProduct && c.giftProduct.stock > 0)
  );

  if (eligible.some(c => c.firstOrderOnly)) {
    const email = req.body.email || req.user?.email;
    // No identity yet (anonymous guest on the cart page, before email is
    // known) — exclude firstOrderOnly coupons rather than assuming eligible,
    // otherwise a repeat guest customer sees it "auto-apply" on every visit.
    if (!req.user?.id && !email) {
      eligible = eligible.filter(c => !c.firstOrderOnly);
    } else {
      const ordered = await hasOrderedBefore({ userId: req.user?.id, email });
      if (ordered) eligible = eligible.filter(c => !c.firstOrderOnly);
    }
  }

  let best = null;
  for (const c of eligible) {
    if (!best || c.minOrderValue > best.minOrderValue) { best = c; continue; }
    if (c.minOrderValue === best.minOrderValue && benefitOf(c) > benefitOf(best)) best = c;
  }

  let coupon = null;
  if (best) {
    let giftProduct = null;
    if (best.discountType === 'free_gift' && best.giftProduct) {
      giftProduct = {
        _id:   best.giftProduct._id,
        name:  best.giftProduct.name,
        image: best.giftProduct.images?.[0]?.url,
        price: best.giftProduct.price,
      };
    }
    coupon = {
      code:               best.code,
      discount:           computeDiscount(best, subtotal),
      type:               best.discountType,
      rate:               best.discountValue,
      maxDiscountAmount:  best.maxDiscountAmount || 0,
      description:        best.description,
      minOrderValue:      best.minOrderValue,
      applicationMode:    best.applicationMode,
      giftProduct,
    };
  }

  // ── "Spend ₹X more to unlock…" hint for the nearest not-yet-qualified gift ──
  let upcoming = null;
  if (!coupon || coupon.type !== 'free_gift') {
    const next = await Coupon.findOne({
      ...validityFilter,
      applicationMode: 'auto',
      discountType: 'free_gift',
      minOrderValue: { $gt: subtotal },
    }).populate('giftProduct').sort({ minOrderValue: 1 });

    if (next?.giftProduct && next.giftProduct.stock > 0) {
      upcoming = {
        code:             next.code,
        giftProductName:  next.giftProduct.name,
        minOrderValue:    next.minOrderValue,
        amountAway:       Math.max(0, next.minOrderValue - subtotal),
      };
    }
  }

  res.json({ success: true, coupon, upcoming });
};

// ─── GET /api/coupons — admin: list all coupons ───────────────────────────────
exports.getAllCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).populate('giftProduct', 'name images stock price');
  res.json({ success: true, coupons });
};

// ─── POST /api/coupons — admin: create coupon ─────────────────────────────────
exports.createCoupon = async (req, res) => {
  const {
    code, description, discountType, discountValue, giftProduct,
    minOrderValue, maxDiscountAmount, isActive, usageLimit, expiresAt, applicationMode,
    firstOrderOnly,
  } = req.body;

  if (!code?.trim())     return res.status(400).json({ success: false, message: 'Code is required' });
  if (!discountType)     return res.status(400).json({ success: false, message: 'Discount type is required' });

  if (discountType === 'free_gift') {
    if (!giftProduct) return res.status(400).json({ success: false, message: 'Please select a free gift product' });
    if (!minOrderValue || minOrderValue <= 0) {
      return res.status(400).json({ success: false, message: 'Minimum order amount is required for a free-gift coupon' });
    }
  } else {
    if (discountValue <= 0) return res.status(400).json({ success: false, message: 'Discount value must be > 0' });
    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({ success: false, message: 'Percentage discount cannot exceed 100%' });
    }
  }

  if (applicationMode && !['auto', 'manual'].includes(applicationMode)) {
    return res.status(400).json({ success: false, message: 'Invalid application mode' });
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    description,
    discountType,
    discountValue:     discountType === 'free_gift' ? 0 : discountValue,
    giftProduct:       discountType === 'free_gift' ? giftProduct : undefined,
    applicationMode:   applicationMode || 'manual',
    minOrderValue:     minOrderValue     || 0,
    maxDiscountAmount: maxDiscountAmount || 0,
    isActive:          isActive          ?? true,
    usageLimit:        usageLimit        || 0,
    expiresAt:         expiresAt || undefined,
    firstOrderOnly:    firstOrderOnly    ?? false,
  });

  res.status(201).json({ success: true, coupon });
};

// ─── PUT /api/coupons/:id — admin: update coupon ──────────────────────────────
exports.updateCoupon = async (req, res) => {
  const update = { ...req.body };

  if (update.applicationMode && !['auto', 'manual'].includes(update.applicationMode)) {
    return res.status(400).json({ success: false, message: 'Invalid application mode' });
  }

  let mongoUpdate = update;
  // Switching away from free_gift should clear the gift product reference
  if (update.discountType && update.discountType !== 'free_gift') {
    delete update.giftProduct;
    mongoUpdate = { ...update, $unset: { giftProduct: 1 } };
  }

  const coupon = await Coupon.findByIdAndUpdate(req.params.id, mongoUpdate, {
    new: true, runValidators: true,
  });
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
  res.json({ success: true, coupon });
};

// ─── DELETE /api/coupons/:id — admin ─────────────────────────────────────────
exports.deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
  res.json({ success: true, message: 'Coupon deleted' });
};

// ─── Helper: apply coupon in order creation ───────────────────────────────────
// Atomic findOneAndUpdate prevents race condition where two simultaneous orders
// could both pass the usageLimit check before either increments the counter.
// Returns { discount, giftProduct, couponType, applicationMode } — giftProduct is
// the populated Product doc when the coupon is a free_gift type and the gift is
// currently in stock, else null. couponType/applicationMode reflect the matched
// coupon so the order can record exactly what was applied.
exports.applyCouponToOrder = async (code, subtotal, identity = {}) => {
  if (!code) return { discount: 0, giftProduct: null, couponType: null, applicationMode: null };

  const now = new Date();
  const normalised = code.toUpperCase().trim();

  // firstOrderOnly can't be checked inside the atomic update below (it depends
  // on the separate Order collection), so gate it with a read first. The race
  // window this leaves (same identity submitting two orders in the same instant)
  // is negligible for a discount coupon.
  const precheck = await Coupon.findOne({ code: normalised }).select('firstOrderOnly');
  if (precheck?.firstOrderOnly) {
    const ordered = await hasOrderedBefore(identity);
    if (ordered) return { discount: 0, giftProduct: null, couponType: null, applicationMode: null };
  }

  // Single atomic operation: match all validity conditions AND increment in one step
  const coupon = await Coupon.findOneAndUpdate(
    {
      code: normalised,
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      $and: [
        { $or: [{ usageLimit: 0 }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }] },
        { $or: [{ minOrderValue: { $lte: subtotal } }, { minOrderValue: { $exists: false } }] },
      ],
    },
    { $inc: { usedCount: 1 } },
    { new: false } // return the doc before increment to compute discount on original values
  ).populate('giftProduct');

  if (!coupon) return { discount: 0, giftProduct: null, couponType: null, applicationMode: null };

  const meta = { couponType: coupon.discountType, applicationMode: coupon.applicationMode };

  if (coupon.discountType === 'free_gift') {
    const gift = coupon.giftProduct;
    return { discount: 0, giftProduct: (gift && gift.stock > 0) ? gift : null, ...meta };
  }

  return { discount: computeDiscount(coupon, subtotal), giftProduct: null, ...meta };
};
