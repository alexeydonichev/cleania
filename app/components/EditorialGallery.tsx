import Image from "next/image";
const photos = [
  ["kitchen", "Кухня, к которой приятно вернуться", "Протирание кухонной столешницы микрофиброй"],
  ["windows", "Больше света в доме", "Мойка окна с безопасным доступом изнутри"],
  ["floor", "Внимание к вашему покрытию", "Влажная уборка деревянного пола плоской шваброй"],
  ["bathroom", "Детали, которые заметны каждый день", "Очистка хромированного смесителя мягкой салфеткой"],
  ["equipment", "Всё необходимое — с собой", "Микрофибра, щётка и ёмкости для уборки"],
  ["interior", "Место для отдыха, а не для забот", "Светлая гостиная с чистым полом и аккуратными поверхностями"],
];
export default function EditorialGallery() {
  return <section className="section shell" aria-labelledby="gallery-heading"><div className="section-heading home-heading compact-heading"><div><p className="eyebrow">Забота о вашем пространстве</p><h2 id="gallery-heading">Чистота <span>в деталях.</span></h2></div><p>От столешницы до пола: разные поверхности требуют разного подхода.</p></div><div className="editorial-gallery">{photos.map(([name, title, alt]) => <figure key={name}><Image src={`/images/editorial/${name}.webp`} alt={alt} width={1440} height={960} sizes="(max-width:750px) 93vw, 31vw" /><figcaption>{title}</figcaption></figure>)}</div></section>;
}
