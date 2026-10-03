import type { Metadata } from "next";
import { env } from "@/lib/runtime-env";
import { isPreviewDeployment } from "@/lib/deployment";
import { requireCrmUser } from "@/lib/crm-auth";
import { loadWorkspace } from "@/lib/crm-data";
import { chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { hasConfiguredNotificationChannel } from "@/lib/notifications";
import { todayInNovosibirsk } from "@/lib/quote";
import BrandLogo from "@/app/components/BrandLogo";
import CrmWorkspace from "@/app/components/CrmWorkspace";
import "./workspace.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Кабинет · CRM и CMS",robots:{index: false, follow: false}};
function Unavailable({text}:{text:string}){return <main className="desk-access"><BrandLogo/><h1>Рабочий кабинет БлескПРО</h1><p>{text}</p><a href="/">Вернуться на сайт</a></main>;}
export default async function CrmPage(){
  if(isPreviewDeployment || !env.DB)return <Unavailable text="База заявок пока не подключена к этому окружению. Данные клиентов здесь не отображаются."/>;
  const auth=await requireCrmUser("/crm");
  if(!auth.allowed||!auth.user||!["owner","manager"].includes(auth.role||""))return <Unavailable text="Этот аккаунт не добавлен владельцем. Войдите под разрешённой учётной записью."/>;
  const initial=await loadWorkspace().catch(()=>null);
  if(!initial)return <Unavailable text="Не удалось загрузить данные. Обновите страницу через минуту. Сохранённые заявки не удалены."/>;
  return <CrmWorkspace initial={initial} user={{name:auth.user.displayName,role:auth.role!,signOut:chatGPTSignOutPath("/")}} today={todayInNovosibirsk()} notifications={hasConfiguredNotificationChannel()}/>;
}
