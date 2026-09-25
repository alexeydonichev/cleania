import { contactPhone, contactPhoneDisplay, maxProfileUrl, telegramUrl } from "@/lib/brand";

export default function ContactLinks({ showPhone = true }: { showPhone?: boolean }) {
  return <div className="contact-links">
    {showPhone && <a className="contact-phone" href={`tel:${contactPhone}`}>{contactPhoneDisplay}</a>}
    <a className="contact-channel contact-telegram" href={telegramUrl} target="_blank" rel="noopener noreferrer" aria-label="Написать БлескПРО в Telegram">Telegram</a>
    <a className="contact-channel contact-max" href={maxProfileUrl} target="_blank" rel="noopener noreferrer" aria-label="Написать БлескПРО в MAX">MAX</a>
  </div>;
}
