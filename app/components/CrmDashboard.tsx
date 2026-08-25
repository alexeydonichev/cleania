"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  order_number: string;
  service_type: string;
  area: number;
  preferred_date: string | null;
  estimate_total: number;
  final_total: number | null;
  duration_hours: number;
  crew_size: number;
  status: string;
  payment_status: string;
  created_at: string;
  cleaner_cost: number;
  supplies_cost: number;
  acquisition_cost: number;
  other_cost: number;
  name: string;
  phone: string;
  source: string;
  files_count: number;
  file_ids: string | null;
};
type Lead = {
  id: string;
  name: string;
  phone: string;
  source: string;
  status: string;
  notes: string | null;
  created_at: string;
};
type Crew = {
  id: string;
  name: string;
  lead_name: string | null;
  phone: string | null;
  status: string;
  capacity_hours: number;
  rating: number;
};
type Pricing = {
  key: string;
  label: string;
  rate: number;
  minimum: number;
  active: number;
};
type Daily = { day: string; orders: number; pipeline: number; revenue: number };
type Source = { source: string; leads: number; orders: number };
type Integration = { channel: string; status: string; events: number };

const money = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const statusLabels: Record<string, string> = {
  new: "Новая",
  confirmed: "Подтверждена",
  scheduled: "Назначена",
  in_progress: "В работе",
  completed: "Завершена",
  cancelled: "Отменена",
};
const serviceLabels: Record<string, string> = {
  regular: "Поддерживающая",
  deep: "Генеральная",
  renovation: "После ремонта",
  office: "Офис",
};
const sourceLabels: Record<string, string> = {
  website: "Сайт",
  business_page: "B2B-форма",
  direct: "Прямой",
  referral: "Рекомендации",
  maps: "Карты",
  ads: "Реклама",
};
const crmTimeZone = "Asia/Novosibirsk";
const crmDateTime = new Intl.DateTimeFormat("ru-RU", {
  timeZone: crmTimeZone,
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const crmDate = new Intl.DateTimeFormat("ru-RU", {
  timeZone: crmTimeZone,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const chartDate = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
});
const weekdayDate = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "UTC",
  weekday: "short",
});

function calendarDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
}

function addCalendarDays(value: string, days: number) {
  const date = calendarDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

export default function CrmDashboard({
  user,
  metrics,
  orders: initialOrders,
  businessLeads,
  daily,
  crews: initialCrews,
  pricing: initialPricing,
  sources,
  integrations,
  integrationConfig,
  today,
}: {
  user: { name: string; email: string; role: string; signOut: string };
  metrics: {
    ordersTotal: number;
    ordersNew: number;
    pipeline: number;
    revenue: number;
    costs: number;
    profit: number;
    avgCheck: number;
  };
  orders: Order[];
  businessLeads: Lead[];
  daily: Daily[];
  crews: Crew[];
  pricing: Pricing[];
  sources: Source[];
  integrations: Integration[];
  integrationConfig: Record<"telegram" | "max" | "email", boolean>;
  today: string;
}) {
  const router = useRouter();
  const [view, setView] = useState<
    "overview" | "orders" | "schedule" | "crews" | "analytics" | "settings"
  >("overview");
  const [orders, setOrders] = useState(initialOrders);
  const [crews, setCrews] = useState(initialCrews);
  const [pricing, setPricing] = useState(initialPricing);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notice, setNotice] = useState("");

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();
    return query
      ? orders.filter((order) =>
          `${order.order_number} ${order.name} ${order.phone} ${serviceLabels[order.service_type] || order.service_type}`
            .toLowerCase()
            .includes(query),
        )
      : orders;
  }, [orders, search]);
  const maxChart = Math.max(
    1,
    ...daily.map((item) => Number(item.pipeline || 0)),
  );
  const maxSource = Math.max(
    1,
    ...sources.map((item) => Number(item.leads || 0)),
  );
  const targetProgress = Math.min(
    100,
    Math.max(0, (metrics.profit / 1000000) * 100),
  );

  async function saveOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedOrder) return;
    const form = new FormData(event.currentTarget);
    const payload = {
      status: form.get("status"),
      finalTotal: Number(form.get("finalTotal") || 0),
      cleanerCost: Number(form.get("cleanerCost") || 0),
      suppliesCost: Number(form.get("suppliesCost") || 0),
      acquisitionCost: Number(form.get("acquisitionCost") || 0),
      otherCost: Number(form.get("otherCost") || 0),
    };
    const response = await fetch(`/api/crm/orders/${selectedOrder.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return setNotice("Не удалось сохранить заказ");
    setOrders((current) =>
      current.map((order) =>
        order.id === selectedOrder.id
          ? {
              ...order,
              status: String(payload.status),
              final_total: payload.finalTotal,
              cleaner_cost: payload.cleanerCost,
              supplies_cost: payload.suppliesCost,
              acquisition_cost: payload.acquisitionCost,
              other_cost: payload.otherCost,
            }
          : order,
      ),
    );
    setSelectedOrder(null);
    setNotice("Заказ обновлён");
    router.refresh();
  }

  async function addCrew(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/crm/crews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const result = (await response.json()) as { crew?: Crew; error?: string };
    if (!response.ok || !result.crew)
      return setNotice(result.error || "Не удалось добавить бригаду");
    setCrews((current) => [...current, result.crew!]);
    event.currentTarget.reset();
    setNotice("Бригада добавлена");
    router.refresh();
  }

  async function savePricing() {
    const response = await fetch("/api/crm/pricing", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rules: pricing }),
    });
    const result = (await response.json()) as { error?: string };
    setNotice(
      response.ok
        ? "Тарифы сохранены"
        : result.error || "Не удалось сохранить тарифы",
    );
    if (response.ok) router.refresh();
  }

  const nav = [
    ["overview", "Обзор", "⌂"],
    ["orders", "Заявки", "↳"],
    ["schedule", "Расписание", "□"],
    ["crews", "Бригады", "◇"],
    ["analytics", "Аналитика", "↗"],
    ["settings", "Настройки", "⚙"],
  ] as const;

  return (
    <div className="crm-shell">
      <aside className="crm-sidebar">
        <Link className="crm-brand" href="/">
          <span>C</span>
          <b>Cleania</b>
          <small>CRM</small>
        </Link>
        <nav>
          {nav.map(([key, label, icon]) => (
            <button
              key={key}
              className={view === key ? "active" : ""}
              onClick={() => setView(key)}
            >
              <i>{icon}</i>
              <span>{label}</span>
              {key === "orders" && metrics.ordersNew > 0 && (
                <em>{metrics.ordersNew}</em>
              )}
            </button>
          ))}
        </nav>
        <div className="crm-user">
          <span>{user.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <b>{user.name}</b>
            <small>{user.role}</small>
          </div>
          <a href={user.signOut} title="Выйти">
            ↗
          </a>
        </div>
      </aside>
      <main className="crm-main">
        <header className="crm-topbar">
          <div>
            <p>Cleania · Новосибирск</p>
            <h1>{nav.find(([key]) => key === view)?.[1]}</h1>
          </div>
          <div className="crm-top-actions">
            <label className="crm-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Заказ, клиент, телефон"
              />
            </label>
            <button className="crm-icon-button" title="Уведомления">
              ◌{metrics.ordersNew > 0 && <i />}
            </button>
          </div>
        </header>
        {notice && (
          <button className="crm-notice" onClick={() => setNotice("")}>
            {notice}
            <span>×</span>
          </button>
        )}

        {view === "overview" && (
          <div className="crm-view">
            <section className="crm-kpis">
              <article>
                <span>Новые заявки</span>
                <strong>{metrics.ordersNew}</strong>
                <small>
                  {metrics.ordersTotal
                    ? `${metrics.ordersTotal} всего`
                    : "Заявок пока нет"}
                </small>
              </article>
              <article>
                <span>В работе, ₽</span>
                <strong>{money.format(metrics.pipeline)}</strong>
                <small>Не признано выручкой</small>
              </article>
              <article>
                <span>Выручка, ₽</span>
                <strong>{money.format(metrics.revenue)}</strong>
                <small>Только завершённые</small>
              </article>
              <article className="accent">
                <span>Чистая прибыль, ₽</span>
                <strong>{money.format(metrics.profit)}</strong>
                <small>Выручка минус внесённые затраты</small>
              </article>
            </section>
            <section className="crm-grid-main">
              <article className="crm-panel crm-chart-panel">
                <div className="crm-panel-head">
                  <div>
                    <span>Заказы и потенциальная выручка</span>
                    <b>Последние 30 дней</b>
                  </div>
                  <em>Не прогноз</em>
                </div>
                {daily.length ? (
                  <div className="crm-bars">
                    {daily.map((item) => (
                      <div
                        key={item.day}
                        className="crm-bar-column"
                        title={`${item.day}: ${money.format(Number(item.pipeline))} ₽`}
                      >
                        <i
                          style={{
                            height: `${Math.max(4, (Number(item.pipeline) / maxChart) * 100)}%`,
                          }}
                        />
                        <span>
                          {chartDate.format(calendarDate(item.day))}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty text="График появится после первых заявок с сайта" />
                )}
              </article>
              <article className="crm-panel target-panel">
                <div className="crm-panel-head">
                  <div>
                    <span>Цель по прибыли</span>
                    <b>1 000 000 ₽ / месяц</b>
                  </div>
                </div>
                <div
                  className="target-ring"
                  style={
                    {
                      "--progress": `${targetProgress * 3.6}deg`,
                    } as React.CSSProperties
                  }
                >
                  <div>
                    <strong>{Math.round(targetProgress)}%</strong>
                    <small>{money.format(metrics.profit)} ₽</small>
                  </div>
                </div>
                <p>
                  {metrics.profit
                    ? "Прогресс считается только по завершённым заказам с заполненными затратами."
                    : "Заполните факт оплаты и затраты завершённых заказов — индикатор станет управленческим, а не декоративным."}
                </p>
              </article>
            </section>
            <section className="crm-grid-bottom">
              <article className="crm-panel">
                <div className="crm-panel-head">
                  <div>
                    <span>Последние заявки</span>
                    <b>
                      {orders.length ? `${orders.length} в выборке` : "Пусто"}
                    </b>
                  </div>
                  <button onClick={() => setView("orders")}>
                    Все заявки →
                  </button>
                </div>
                <OrderTable
                  orders={orders.slice(0, 6)}
                  onOpen={setSelectedOrder}
                  compact
                />
              </article>
              <article className="crm-panel source-panel">
                <div className="crm-panel-head">
                  <div>
                    <span>Источники клиентов</span>
                    <b>По реальным лидам</b>
                  </div>
                </div>
                {sources.length ? (
                  sources.slice(0, 5).map((source) => (
                    <div className="source-row" key={source.source}>
                      <div>
                        <b>{sourceLabels[source.source] || source.source}</b>
                        <span>{source.orders} заказов</span>
                      </div>
                      <i>
                        <span
                          style={{
                            width: `${(Number(source.leads) / maxSource) * 100}%`,
                          }}
                        />
                      </i>
                      <strong>{source.leads}</strong>
                    </div>
                  ))
                ) : (
                  <Empty text="Источники появятся после первых обращений" />
                )}
              </article>
            </section>
          </div>
        )}

        {view === "orders" && (
          <div className="crm-view">
            <div className="crm-section-head">
              <div>
                <h2>Заявки и заказы</h2>
                <p>
                  Единый поток с сайта и B2B-формы. Кликните строку, чтобы
                  внести факт и себестоимость.
                </p>
              </div>
              <button
                className="crm-primary"
                onClick={() => window.open("/#calculator", "_blank")}
              >
                + Новый заказ
              </button>
            </div>
            <section className="crm-panel">
              <OrderTable orders={filteredOrders} onOpen={setSelectedOrder} />
            </section>
            {businessLeads.length > 0 && (
              <section className="crm-panel business-leads">
                <div className="crm-panel-head">
                  <div>
                    <span>B2B-заявки без заказа</span>
                    <b>Требуют квалификации</b>
                  </div>
                </div>
                {businessLeads.map((lead) => (
                  <div className="lead-row" key={lead.id}>
                    <div>
                      <strong>{lead.name}</strong>
                      <span>{lead.phone}</span>
                    </div>
                    <p>{lead.notes}</p>
                    <em>
                      {crmDate.format(new Date(lead.created_at))}
                    </em>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}

        {view === "schedule" && (
          <div className="crm-view">
            <div className="crm-section-head">
              <div>
                <h2>Ближайшие работы</h2>
                <p>Заказы без даты остаются в очереди и не скрываются.</p>
              </div>
            </div>
            <section className="schedule-grid">
              {Array.from({ length: 7 }, (_, index) => {
                const date = addCalendarDays(today, index);
                const key = date.toISOString().slice(0, 10);
                const items = orders.filter(
                  (order) =>
                    order.preferred_date === key &&
                    order.status !== "cancelled",
                );
                return (
                  <article key={key}>
                    <header>
                      <span>
                        {weekdayDate.format(date)}
                      </span>
                      <b>{date.getUTCDate()}</b>
                    </header>
                    {items.length ? (
                      items.map((order) => (
                        <button
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <strong>{order.name}</strong>
                          <span>
                            {serviceLabels[order.service_type]} · {order.area}{" "}
                            м²
                          </span>
                          <small>
                            {order.crew_size} чел. · {order.duration_hours} ч
                          </small>
                        </button>
                      ))
                    ) : (
                      <p>Свободно</p>
                    )}
                  </article>
                );
              })}
            </section>
            <section className="crm-panel undated">
              <div className="crm-panel-head">
                <div>
                  <span>Без назначенной даты</span>
                  <b>
                    {
                      orders.filter(
                        (order) =>
                          !order.preferred_date && order.status !== "cancelled",
                      ).length
                    }{" "}
                    заказов
                  </b>
                </div>
              </div>
              <OrderTable
                orders={orders.filter(
                  (order) =>
                    !order.preferred_date && order.status !== "cancelled",
                )}
                onOpen={setSelectedOrder}
                compact
              />
            </section>
          </div>
        )}

        {view === "crews" && (
          <div className="crm-view">
            <div className="crm-section-head">
              <div>
                <h2>Бригады</h2>
                <p>
                  Мощность команды и ответственные. Фиктивных сотрудников в
                  системе нет.
                </p>
              </div>
            </div>
            <section className="crew-grid">
              {crews.map((crew) => (
                <article key={crew.id}>
                  <div className="crew-avatar">
                    {crew.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`status-pill ${crew.status}`}>
                    {crew.status === "active" ? "Активна" : crew.status}
                  </span>
                  <h3>{crew.name}</h3>
                  <p>{crew.lead_name || "Ответственный не назначен"}</p>
                  <dl>
                    <div>
                      <dt>Мощность</dt>
                      <dd>{crew.capacity_hours} ч/день</dd>
                    </div>
                    <div>
                      <dt>Рейтинг</dt>
                      <dd>{crew.rating.toFixed(1)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
              {!crews.length && (
                <Empty text="Добавьте первую реальную бригаду" />
              )}
            </section>
            <form className="crm-panel add-crew" onSubmit={addCrew}>
              <div>
                <h3>Добавить бригаду</h3>
                <p>
                  Название достаточно; остальные поля можно заполнить позже.
                </p>
              </div>
              <label>
                <span>Название</span>
                <input name="name" required placeholder="Бригада 1" />
              </label>
              <label>
                <span>Ответственный</span>
                <input name="leadName" placeholder="Имя" />
              </label>
              <label>
                <span>Телефон</span>
                <input name="phone" inputMode="tel" placeholder="+7…" />
              </label>
              <label>
                <span>Часов в день</span>
                <input
                  name="capacityHours"
                  type="number"
                  min="1"
                  max="24"
                  defaultValue="8"
                />
              </label>
              <button className="crm-primary">Добавить</button>
            </form>
          </div>
        )}

        {view === "analytics" && (
          <div className="crm-view">
            <div className="crm-section-head">
              <div>
                <h2>Экономика бизнеса</h2>
                <p>
                  Факт по завершённым заказам. Pipeline и заявка не считаются
                  выручкой.
                </p>
              </div>
            </div>
            <section className="analytics-strip">
              <article>
                <span>Выручка</span>
                <b>{money.format(metrics.revenue)} ₽</b>
              </article>
              <i>−</i>
              <article>
                <span>Прямые расходы</span>
                <b>{money.format(metrics.costs)} ₽</b>
              </article>
              <i>=</i>
              <article className="profit">
                <span>Чистая прибыль</span>
                <b>{money.format(metrics.profit)} ₽</b>
              </article>
              <article>
                <span>Маржа</span>
                <b>
                  {metrics.revenue
                    ? Math.round((metrics.profit / metrics.revenue) * 100)
                    : 0}
                  %
                </b>
              </article>
            </section>
            <section className="crm-grid-main">
              <article className="crm-panel">
                <div className="crm-panel-head">
                  <div>
                    <span>Финансовая дисциплина</span>
                    <b>Что нужно для точного P&L</b>
                  </div>
                </div>
                <ol className="finance-check">
                  <li className={metrics.revenue ? "done" : ""}>
                    <span>1</span>
                    <div>
                      <b>Закрывайте заказ фактом</b>
                      <p>
                        Финальная цена признаётся только после статуса
                        «Завершена».
                      </p>
                    </div>
                  </li>
                  <li className={metrics.costs ? "done" : ""}>
                    <span>2</span>
                    <div>
                      <b>Вносите четыре группы затрат</b>
                      <p>
                        Исполнители, средства, привлечение клиента и прочие
                        расходы.
                      </p>
                    </div>
                  </li>
                  <li>
                    <span>3</span>
                    <div>
                      <b>Сверяйте маржу еженедельно</b>
                      <p>
                        Не масштабируйте канал, пока заказ не даёт положительный
                        вклад.
                      </p>
                    </div>
                  </li>
                </ol>
              </article>
              <article className="crm-panel">
                <div className="crm-panel-head">
                  <div>
                    <span>Средний чек</span>
                    <b>Завершённые заказы</b>
                  </div>
                </div>
                <strong className="big-number">
                  {money.format(metrics.avgCheck)} ₽
                </strong>
                <p className="muted-copy">
                  При нулевом значении завершённых заказов ещё нет. CRM
                  намеренно не подменяет факт прогнозом.
                </p>
              </article>
            </section>
          </div>
        )}

        {view === "settings" && (
          <div className="crm-view">
            <div className="crm-section-head">
              <div>
                <h2>Тарифы и интеграции</h2>
                <p>
                  Сохранённые тарифы применяются к новым расчётам на сайте и
                  повторно проверяются сервером.
                </p>
              </div>
              <button className="crm-primary" onClick={savePricing}>
                Сохранить тарифы
              </button>
            </div>
            <section className="pricing-grid">
              {pricing.map((rule, index) => (
                <article className="crm-panel" key={rule.key}>
                  <span>{rule.label}</span>
                  <label>
                    <b>₽ / м²</b>
                    <input
                      type="number"
                      min="1"
                      value={rule.rate}
                      onChange={(event) =>
                        setPricing((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, rate: Number(event.target.value) }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    <b>Минимум</b>
                    <input
                      type="number"
                      min="500"
                      step="50"
                      value={rule.minimum}
                      onChange={(event) =>
                        setPricing((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, minimum: Number(event.target.value) }
                              : item,
                          ),
                        )
                      }
                    />
                  </label>
                </article>
              ))}
            </section>
            <section className="crm-panel integration-panel">
              <div className="crm-panel-head">
                <div>
                  <span>Мгновенные уведомления</span>
                  <b>Секреты хранятся только на сервере</b>
                </div>
              </div>
              <div className="integration-grid">
                {(["telegram", "max", "email"] as const).map((channel) => {
                  const sent = integrations
                    .filter(
                      (item) =>
                        item.channel === channel && item.status === "sent",
                    )
                    .reduce((sum, item) => sum + Number(item.events), 0);
                  const failed = integrations
                    .filter(
                      (item) =>
                        item.channel === channel && item.status === "failed",
                    )
                    .reduce((sum, item) => sum + Number(item.events), 0);
                  return (
                    <article key={channel}>
                      <span className={`integration-icon ${channel}`}>
                        {channel === "telegram"
                          ? "T"
                          : channel === "max"
                            ? "M"
                            : "@"}
                      </span>
                      <div>
                        <h3>
                          {channel === "telegram"
                            ? "Telegram"
                            : channel === "max"
                              ? "MAX"
                              : "Email webhook"}
                        </h3>
                        <p>
                          {integrationConfig[channel]
                            ? "Подключено"
                            : "Нужны переменные окружения"}
                        </p>
                      </div>
                      <em
                        className={
                          integrationConfig[channel] ? "connected" : ""
                        }
                      >
                        {integrationConfig[channel] ? "Вкл." : "Выкл."}
                      </em>
                      <small>
                        {sent} отправлено · {failed} ошибок
                      </small>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
      {selectedOrder && (
        <div
          className="crm-drawer-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setSelectedOrder(null)
          }
        >
          <form className="crm-drawer" onSubmit={saveOrder}>
            <header>
              <div>
                <span>{selectedOrder.order_number}</span>
                <h2>{selectedOrder.name}</h2>
                <p>
                  {selectedOrder.phone} ·{" "}
                  {serviceLabels[selectedOrder.service_type]} ·{" "}
                  {selectedOrder.area} м²
                </p>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)}>
                ×
              </button>
            </header>
            <div className="drawer-fields">
              <label>
                <span>Статус</span>
                <select name="status" defaultValue={selectedOrder.status}>
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option value={key} key={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Финальная сумма, ₽</span>
                <input
                  name="finalTotal"
                  type="number"
                  min="0"
                  defaultValue={
                    selectedOrder.final_total ?? selectedOrder.estimate_total
                  }
                />
              </label>
              <hr />
              <label>
                <span>Оплата исполнителям</span>
                <input
                  name="cleanerCost"
                  type="number"
                  min="0"
                  defaultValue={selectedOrder.cleaner_cost}
                />
              </label>
              <label>
                <span>Средства и расходники</span>
                <input
                  name="suppliesCost"
                  type="number"
                  min="0"
                  defaultValue={selectedOrder.supplies_cost}
                />
              </label>
              <label>
                <span>Стоимость привлечения</span>
                <input
                  name="acquisitionCost"
                  type="number"
                  min="0"
                  defaultValue={selectedOrder.acquisition_cost}
                />
              </label>
              <label>
                <span>Прочие расходы</span>
                <input
                  name="otherCost"
                  type="number"
                  min="0"
                  defaultValue={selectedOrder.other_cost}
                />
              </label>
            </div>
            <div className="drawer-profit">
              <span>Вклад заказа</span>
              <b>
                {money.format(
                  (selectedOrder.final_total ?? selectedOrder.estimate_total) -
                    selectedOrder.cleaner_cost -
                    selectedOrder.supplies_cost -
                    selectedOrder.acquisition_cost -
                    selectedOrder.other_cost,
                )}{" "}
                ₽
              </b>
              <small>Пересчитается после сохранения</small>
            </div>
            {selectedOrder.file_ids && (
              <div className="drawer-files">
                <span>Фото объекта</span>
                <div>
                  {selectedOrder.file_ids.split(",").map((fileId, index) => (
                    <a
                      href={`/api/crm/files/${fileId}`}
                      target="_blank"
                      rel="noreferrer"
                      key={fileId}
                    >
                      Фото {index + 1} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}
            <button className="crm-primary">Сохранить заказ</button>
          </form>
        </div>
      )}
    </div>
  );
}

function OrderTable({
  orders,
  onOpen,
  compact = false,
}: {
  orders: Order[];
  onOpen: (order: Order) => void;
  compact?: boolean;
}) {
  if (!orders.length) return <Empty text="Здесь появятся реальные заявки" />;
  return (
    <div className={`orders-table ${compact ? "compact" : ""}`}>
      <div className="orders-head">
        <span>Заказ</span>
        <span>Клиент</span>
        <span>Услуга</span>
        <span>Дата</span>
        <span>Сумма</span>
        <span>Статус</span>
      </div>
      {orders.map((order) => (
        <button
          className="order-row"
          key={order.id}
          onClick={() => onOpen(order)}
        >
          <span>
            <b>{order.order_number}</b>
            <small>
              {crmDateTime.format(new Date(order.created_at))}
            </small>
          </span>
          <span>
            <b>{order.name}</b>
            <small>{order.phone}</small>
          </span>
          <span>
            <b>{serviceLabels[order.service_type] || order.service_type}</b>
            <small>
              {order.area} м² · {order.files_count || 0} фото
            </small>
          </span>
          <span>
            <b>
              {order.preferred_date
                ? crmDate.format(calendarDate(order.preferred_date))
                : "Уточнить"}
            </b>
            <small>{order.duration_hours} ч</small>
          </span>
          <span>
            <b>{money.format(order.final_total ?? order.estimate_total)} ₽</b>
            <small>
              {order.payment_status === "paid" ? "Оплачено" : "Не оплачено"}
            </small>
          </span>
          <span>
            <em className={`order-status ${order.status}`}>
              {statusLabels[order.status] || order.status}
            </em>
          </span>
        </button>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="crm-empty">
      <span>○</span>
      <p>{text}</p>
    </div>
  );
}
