import { contactPhone, contactPhoneDisplay, maxProfileUrl, telegramUrl, telegramDraftUrl, maxDraftUrl } from "@/lib/brand";

export default function ContactLinks({ showPhone = true, message }: { showPhone?: boolean; message?: string }) {
  return <><div className="contact-links">
    {showPhone && <a className="contact-phone" href={`tel:${contactPhone}`}>{contactPhoneDisplay}</a>}
    <a className="contact-channel contact-telegram" href={message ? telegramDraftUrl(message) : telegramUrl} target="_blank" rel="noopener noreferrer" aria-label={message ? "Передать расчёт в Telegram" : "Написать БлескПРО в Telegram"}>Telegram</a>
    <a className="contact-channel contact-max" href={message ? maxDraftUrl(message) : maxProfileUrl} target="_blank" rel="noopener noreferrer" aria-label={message ? "Передать расчёт в MAX" : "Написать БлескПРО в MAX"}>MAX</a>
  </div>{message && <p className="messenger-draft-hint">Telegram откроет чат с текстом расчёта. В MAX выберите получателя. Если ещё не общались — <a href={maxProfileUrl} target="_blank" rel="noopener noreferrer">откройте наш профиль MAX</a>. Сообщение отправите вы.</p>}</>;
}
