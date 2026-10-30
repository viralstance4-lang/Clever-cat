import { useEffect, useState } from 'react'
import { Image, Truck, Gift, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api'
import { fmtINR } from '../../utils/format'
import MediaInput from '../../components/admin/MediaInput'

const BACKEND_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '')

const resolveLogoUrl = (url) => {
  if (!url) return ''
  return url.startsWith('http') ? url : `${BACKEND_ORIGIN}${url}`
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card p-6 space-y-4">
      <h2 className="text-sm font-semibold text-forest-700 uppercase tracking-wider flex items-center gap-2">
        {Icon && <Icon size={15} />} {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-forest-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function ShippingPreview({ form }) {
  const prepaidFree = Number(form.prepaidFreeThreshold) || 0
  const prepaidCharge = Number(form.prepaidCharge) || 0
  const codThreshold = Number(form.codThreshold) || 0
  const codBelow = Number(form.codChargeBelow) || 0
  const codAbove = Number(form.codChargeAbove) || 0
  const magazineCharge = Number(form.magazineShippingCharge) || 0

  const examples = [
    { label: `Prepaid order below ${fmtINR(prepaidFree)}`, value: prepaidCharge > 0 ? fmtINR(prepaidCharge) : 'Free' },
    { label: `Prepaid order ${fmtINR(prepaidFree)} or above`, value: 'Free' },
    ...(form.codEnabled ? [
      { label: `COD order below ${fmtINR(codThreshold)}`, value: fmtINR(codBelow) },
      { label: `COD order ${fmtINR(codThreshold)} or above`, value: fmtINR(codAbove) },
    ] : [
      { label: 'Cash on Delivery', value: 'Disabled' },
    ]),
    { label: 'Order containing a magazine (any amount)', value: `+${fmtINR(magazineCharge)}` },
  ]

  return (
    <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 space-y-2">
      <p className="text-xs font-semibold text-forest-600 uppercase tracking-wider mb-1">Live Preview</p>
      {examples.map((ex, i) => (
        <div key={i} className="flex justify-between text-sm">
          <span className="text-forest-600">{ex.label}</span>
          <span className="font-semibold text-forest-900">{ex.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)

  const [logoForm, setLogoForm] = useState({ logoUrl: '', logoWidth: '120px', logoHeight: 'auto', logoAlt: '' })
  const [savingLogo, setSavingLogo] = useState(false)

  const [shipping, setShipping] = useState({
    prepaidFreeThreshold: '499', prepaidCharge: '79',
    codEnabled: true, codThreshold: '499', codChargeBelow: '79', codChargeAbove: '20',
    giftWrapEnabled: true, giftWrapPrice: '49',
    magazineShippingCharge: '400',
  })
  const [savingShipping, setSavingShipping] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/settings'),
      api.get('/settings/shipping'),
    ]).then(([siteRes, shipRes]) => {
      const s = siteRes.data.settings
      setLogoForm({ logoUrl: s.logoUrl || '', logoWidth: s.logoWidth || '120px', logoHeight: s.logoHeight || 'auto', logoAlt: s.logoAlt || '' })
      const sh = shipRes.data.settings
      setShipping({
        prepaidFreeThreshold: String(sh.prepaidFreeThreshold),
        prepaidCharge: String(sh.prepaidCharge),
        codEnabled: sh.codEnabled,
        codThreshold: String(sh.codThreshold),
        codChargeBelow: String(sh.codChargeBelow),
        codChargeAbove: String(sh.codChargeAbove),
        giftWrapEnabled: sh.giftWrapEnabled !== false,
        giftWrapPrice: String(sh.giftWrapPrice ?? 49),
        magazineShippingCharge: String(sh.magazineShippingCharge ?? 400),
      })
    }).catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const handleSaveLogo = async (e) => {
    e.preventDefault()
    setSavingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', logoForm.logoUrl || '')
      formData.append('logoWidth', logoForm.logoWidth)
      formData.append('logoHeight', logoForm.logoHeight)
      formData.append('logoAlt', logoForm.logoAlt)
      const { data } = await api.put('/settings/logo', formData)
      setLogoForm({
        logoUrl: data.settings.logoUrl || '',
        logoWidth: data.settings.logoWidth || '120px',
        logoHeight: data.settings.logoHeight || 'auto',
        logoAlt: data.settings.logoAlt || '',
      })
      toast.success('Logo updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update logo')
    } finally {
      setSavingLogo(false)
    }
  }

  const handleSaveShipping = async (e) => {
    e.preventDefault()
    setSavingShipping(true)
    try {
      await api.put('/settings/shipping', {
        prepaidFreeThreshold: Number(shipping.prepaidFreeThreshold),
        prepaidCharge: Number(shipping.prepaidCharge),
        codEnabled: shipping.codEnabled,
        codThreshold: Number(shipping.codThreshold),
        codChargeBelow: Number(shipping.codChargeBelow),
        codChargeAbove: Number(shipping.codChargeAbove),
        giftWrapEnabled: shipping.giftWrapEnabled,
        giftWrapPrice: Number(shipping.giftWrapPrice),
        magazineShippingCharge: Number(shipping.magazineShippingCharge),
      })
      toast.success('Shipping settings updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update shipping settings')
    } finally {
      setSavingShipping(false)
    }
  }

  if (loading) return <div className="text-forest-600 text-sm">Loading settings…</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-forest-900 font-serif">Settings</h1>
        <p className="text-sm text-forest-500 mt-0.5">Manage site logo and shipping rules</p>
      </div>

      <form onSubmit={handleSaveLogo}>
        <Section icon={Image} title="Site Logo">
          <MediaInput
            value={logoForm.logoUrl ? resolveLogoUrl(logoForm.logoUrl) : ''}
            onChange={url => setLogoForm(f => ({ ...f, logoUrl: url }))}
            accept="image"
            layout="inline"
            previewClassName="w-20 h-20 rounded-xl"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Width">
              <input value={logoForm.logoWidth} onChange={e => setLogoForm(f => ({ ...f, logoWidth: e.target.value }))} className="input" placeholder="120px" />
            </Field>
            <Field label="Height">
              <input value={logoForm.logoHeight} onChange={e => setLogoForm(f => ({ ...f, logoHeight: e.target.value }))} className="input" placeholder="auto" />
            </Field>
            <Field label="Alt Text">
              <input value={logoForm.logoAlt} onChange={e => setLogoForm(f => ({ ...f, logoAlt: e.target.value }))} className="input" placeholder="Clever Cat" />
            </Field>
          </div>
          <button type="submit" disabled={savingLogo} className="btn-gold text-sm">
            {savingLogo ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Logo
          </button>
        </Section>
      </form>

      <form onSubmit={handleSaveShipping}>
        <Section icon={Truck} title="Shipping Rules">
          <div>
            <h3 className="text-xs font-semibold text-forest-400 uppercase tracking-wider mb-2">Prepaid Orders</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Free Shipping Threshold (₹)">
                <input type="number" min="0" value={shipping.prepaidFreeThreshold} onChange={e => setShipping(s => ({ ...s, prepaidFreeThreshold: e.target.value }))} className="input" />
              </Field>
              <Field label="Shipping Charge Below Threshold (₹)">
                <input type="number" min="0" value={shipping.prepaidCharge} onChange={e => setShipping(s => ({ ...s, prepaidCharge: e.target.value }))} className="input" />
              </Field>
            </div>
          </div>

          <div className="border-t border-forest-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-forest-400 uppercase tracking-wider">Cash on Delivery</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={shipping.codEnabled} onChange={e => setShipping(s => ({ ...s, codEnabled: e.target.checked }))} className="accent-forest-800 w-4 h-4" />
                <span className="text-sm text-forest-700">Enabled</span>
              </label>
            </div>
            {shipping.codEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Threshold (₹)">
                  <input type="number" min="0" value={shipping.codThreshold} onChange={e => setShipping(s => ({ ...s, codThreshold: e.target.value }))} className="input" />
                </Field>
                <Field label="Charge Below (₹)">
                  <input type="number" min="0" value={shipping.codChargeBelow} onChange={e => setShipping(s => ({ ...s, codChargeBelow: e.target.value }))} className="input" />
                </Field>
                <Field label="Charge Above (₹)">
                  <input type="number" min="0" value={shipping.codChargeAbove} onChange={e => setShipping(s => ({ ...s, codChargeAbove: e.target.value }))} className="input" />
                </Field>
              </div>
            )}
          </div>

          <div className="border-t border-forest-100 pt-4">
            <h3 className="text-xs font-semibold text-forest-400 uppercase tracking-wider mb-2">Magazines (e.g. IQ Junior)</h3>
            <Field label="Flat Shipping Charge (₹)">
              <input type="number" min="0" value={shipping.magazineShippingCharge} onChange={e => setShipping(s => ({ ...s, magazineShippingCharge: e.target.value }))} className="input max-w-xs" />
            </Field>
            <p className="text-xs text-forest-400 mt-1.5">
              Applied once per order whenever the cart contains a "Kids Magazine" category product — on top of any book shipping/COD charge. The free-shipping-above-threshold offer never applies to magazines.
            </p>
          </div>

          <ShippingPreview form={shipping} />

          <button type="submit" disabled={savingShipping} className="btn-gold text-sm">
            {savingShipping ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Shipping Rules
          </button>
        </Section>
      </form>

      <form onSubmit={handleSaveShipping}>
        <Section icon={Gift} title="Gift Wrap">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-forest-500">Let customers add gift-wrapping to their order at checkout for a flat fee.</p>
            <label className="flex items-center gap-2 cursor-pointer flex-shrink-0 ml-4">
              <input type="checkbox" checked={shipping.giftWrapEnabled} onChange={e => setShipping(s => ({ ...s, giftWrapEnabled: e.target.checked }))} className="accent-forest-800 w-4 h-4" />
              <span className="text-sm text-forest-700">Enabled</span>
            </label>
          </div>
          {shipping.giftWrapEnabled && (
            <Field label="Gift Wrap Price (₹)">
              <input type="number" min="0" value={shipping.giftWrapPrice} onChange={e => setShipping(s => ({ ...s, giftWrapPrice: e.target.value }))} className="input max-w-xs" />
            </Field>
          )}
          <button type="submit" disabled={savingShipping} className="btn-gold text-sm">
            {savingShipping ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
          </button>
        </Section>
      </form>
    </div>
  )
}
