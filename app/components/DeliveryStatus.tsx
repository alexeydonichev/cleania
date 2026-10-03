import type { WorkspaceData } from "@/lib/crm-data";

const channels: Record<string,string> = { telegram: "Telegram", max: "MAX", email: "Email" };
const states: Record<string,string> = { sent: "Доставлено", failed: "Не доставлено", pending: "Доставка не подтверждена", not_configured: "Не подключён" };

export default function DeliveryStatus({items}:{items:WorkspaceData["deliveries"]}) {
  if (!items.length) return null;
  const attention = !items.some(item=>item.status==="sent") && items.some(item=>["failed","pending"].includes(item.status));
  return <section aria-label="Доставка уведомлений" className="desk-delivery">
    <h3>Уведомления менеджеру</h3>
    {attention && <p className="desk-warning" role="status">Заявка сохранена, но доставка уведомления не подтверждена. Свяжитесь с клиентом из этой карточки.</p>}
    <ul>{items.map(item=><li key={item.id}><span>{channels[item.channel]||item.channel}</span><strong>{states[item.status]||"Уточнить"}</strong></li>)}</ul>
  </section>;
}
