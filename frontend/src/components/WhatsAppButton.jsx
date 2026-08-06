import { MessageCircle } from "lucide-react";
import { COMPANY } from "@/data/content";

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${COMPANY.whatsappRaw}?text=${encodeURIComponent("Hello SKL Enterprises, I have an enquiry.")}`}
      target="_blank"
      rel="noreferrer"
      data-testid="floating-whatsapp"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
    </a>
  );
}
