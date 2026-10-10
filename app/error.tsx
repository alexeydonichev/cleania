"use client";

export default function ErrorPage({reset}:{reset:()=>void}) {
  return <main style={{maxWidth:640,margin:"64px auto",padding:24}}>
    <p>БлескПРО</p><h1>Не удалось загрузить страницу</h1>
    <p>Попробуйте ещё раз. Если вы заполняли заявку, её отправка здесь не подтверждена — не нужно считать её принятой.</p>
    <button onClick={reset}>Попробовать ещё раз</button>
    <p>Обсудить уборку напрямую: <a href="tel:+79833216224">+7 (983) 321-62-24</a>.</p>
  </main>;
}
