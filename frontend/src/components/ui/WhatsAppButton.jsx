// Floating WhatsApp chat button — lets parents ask quick questions before buying.
// Inspired by pegasusforkids.com per the Clever Cat scope document (§3.6).
// NOTE: replace the placeholder number below with Clever Cat's real WhatsApp number.
const WHATSAPP_NUMBER = '919218171625'
const WHATSAPP_MESSAGE = "Hi! I've got a quick question about a product on Clever Cat."

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
        <path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.353.615 4.56 1.692 6.475L2.667 29.333l7.03-1.843a13.27 13.27 0 0 0 6.307 1.605h.006c7.363 0 13.333-5.97 13.333-13.333S23.367 2.667 16.004 2.667zm0 24.198h-.005a11.03 11.03 0 0 1-5.617-1.538l-.403-.24-4.172 1.094 1.114-4.067-.263-.418a10.995 10.995 0 0 1-1.687-5.863c0-6.078 4.947-11.025 11.038-11.025 2.948 0 5.719 1.15 7.803 3.236a10.958 10.958 0 0 1 3.23 7.795c0 6.078-4.947 11.026-11.038 11.026zm6.05-8.257c-.331-.166-1.96-.967-2.264-1.078-.304-.111-.525-.166-.746.166-.221.332-.856 1.078-1.05 1.3-.193.221-.386.249-.717.083-.331-.166-1.397-.515-2.662-1.642-.984-.878-1.65-1.962-1.844-2.293-.193-.332-.02-.511.146-.677.15-.15.331-.387.497-.58.166-.194.221-.332.331-.553.11-.222.055-.415-.028-.581-.083-.166-.746-1.797-1.023-2.461-.269-.646-.543-.559-.746-.569l-.635-.011c-.221 0-.58.083-.884.415-.303.332-1.16 1.133-1.16 2.764s1.188 3.207 1.354 3.428c.166.221 2.338 3.57 5.665 5.006.792.342 1.41.546 1.892.699.795.253 1.518.217 2.09.132.638-.095 1.96-.802 2.236-1.576.276-.775.276-1.438.193-1.577-.083-.138-.304-.221-.635-.387z"/>
      </svg>
    </a>
  )
}
