import Image from "next/image";

const stages = [
  { image: "agree", title: "Сначала — договоримся", description: "Уточним задачи, посмотрим фото, согласуем состав работ, стоимость и удобное время. Особые поверхности обсудим до выезда.", detail: "Понятная смета до начала работ", alt: "Иллюстрация: клиент и специалист обсуждают уборку по списку задач" },
  { image: "clean", title: "Потом — наведём порядок", description: "Приедем с инвентарём и подходящими средствами. Пройдём по согласованному списку: от рабочих поверхностей до пола.", detail: "Средства и инвентарь с собой", alt: "Иллюстрация: сотрудник аккуратно протирает кухонную столешницу микрофиброй" },
  { image: "check", title: "В конце — проверим вместе", description: "Осмотрим результат по списку работ. Покажите, что требует внимания, — обсудим и устраним замечания в рамках согласованной уборки.", detail: "Приёмка по вашему списку задач", alt: "Иллюстрация: клиент и специалист вместе проверяют чистоту поверхности" },
];

export default function CleaningProcess() {
  return <section className="process-section shell section" id="quality" aria-labelledby="process-title">
    <div className="section-heading home-heading"><div><p className="eyebrow">Спокойно на каждом шаге</p><h2 id="process-title">Хорошая уборка.<br /><span>Простой процесс.</span></h2></div><p>Вы знаете, что будет происходить: от первого сообщения до проверки результата.</p></div>
    <ol className="process-grid">{stages.map((stage) => <li className="process-card" key={stage.image}>
      <div className="process-photo"><Image src={`/images/process/${stage.image}.webp`} alt={stage.alt} width={1448} height={1086} sizes="(max-width: 700px) 93vw, 31vw" /><span>Иллюстрация · ИИ</span></div>
      <div className="process-card-copy"><h3>{stage.title}</h3><p>{stage.description}</p><small>{stage.detail}</small></div>
    </li>)}</ol>
  </section>;
}
