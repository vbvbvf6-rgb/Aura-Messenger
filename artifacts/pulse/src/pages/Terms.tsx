import { useLocation } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";

export default function Terms() {
  const [, navigate] = useLocation();
  const today = "20 июня 2026 г.";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1 as any)} className="p-2 rounded-xl hover:bg-muted/60 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <FileText size={18} className="text-primary" />
        <h1 className="text-base font-semibold">Пользовательское соглашение</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 text-sm leading-relaxed">
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
          <p className="text-xs text-muted-foreground">Последнее обновление: {today}</p>
          <p className="mt-1 font-medium">Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует использование мессенджера Nova.</p>
        </div>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">1. Принятие условий</h2>
          <p>Регистрируясь в Сервисе, вы подтверждаете, что прочитали, поняли и согласны с настоящим Соглашением и Политикой конфиденциальности. Если вы не согласны с условиями, не используйте Сервис.</p>
          <p className="text-muted-foreground">Минимальный возраст для использования: <strong className="text-foreground">16 лет</strong>. Использование Сервисом лицами младше 16 лет допускается только с согласия законных представителей.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">2. Описание Сервиса</h2>
          <p>Nova — мессенджер для обмена текстовыми и медиасообщениями, проведения звонков, создания групп и каналов. Сервис предоставляется «как есть» без гарантий бесперебойной работы.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">3. Правила использования</h2>
          <p className="font-medium text-destructive">Запрещено использовать Сервис для:</p>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Распространения материалов, запрещённых законодательством РФ.</li>
            <li>Пропаганды экстремизма, терроризма, нацизма.</li>
            <li>Распространения детской порнографии или сексуальной эксплуатации несовершеннолетних.</li>
            <li>Распространения наркотиков, оружия и иных запрещённых товаров.</li>
            <li>Мошенничества, фишинга и иных форм обмана пользователей.</li>
            <li>Спама, массовой рассылки без согласия получателей.</li>
            <li>Нарушения авторских прав и смежных прав.</li>
            <li>Преследования, запугивания или домогательства других пользователей.</li>
            <li>Несанкционированного доступа к данным других пользователей.</li>
            <li>Автоматизированного использования Сервиса без разрешения (боты, парсеры).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">4. Контент пользователей</h2>
          <p>Вы несёте ответственность за весь контент, который публикуете в Сервисе. Размещая контент, вы гарантируете, что имеете право его публиковать и он не нарушает права третьих лиц.</p>
          <p className="text-muted-foreground">Сервис оставляет за собой право удалить контент, нарушающий настоящее Соглашение, без предварительного уведомления.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">5. Аккаунт и безопасность</h2>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Вы несёте ответственность за сохранность пароля и данных входа.</li>
            <li>Не передавайте данные аккаунта третьим лицам.</li>
            <li>Незамедлительно сообщайте о несанкционированном доступе к вашему аккаунту.</li>
            <li>Один человек — один аккаунт (создание массовых аккаунтов запрещено).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">6. Блокировка и удаление аккаунта</h2>
          <p>Сервис вправе заблокировать или удалить аккаунт при нарушении настоящего Соглашения. Вы можете самостоятельно удалить аккаунт в любой момент через раздел настроек.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">7. Интеллектуальная собственность</h2>
          <p>Все права на Сервис, его дизайн и программный код принадлежат разработчику. Вы получаете ограниченную, непередаваемую лицензию на использование Сервиса в личных целях.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">8. Ограничение ответственности</h2>
          <p>Сервис не несёт ответственности за:</p>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Контент, публикуемый пользователями.</li>
            <li>Перебои в работе, вызванные техническими причинами.</li>
            <li>Действия третьих лиц.</li>
            <li>Убытки, возникшие вследствие нарушения вами настоящего Соглашения.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">9. Применимое право</h2>
          <p>Настоящее Соглашение регулируется законодательством Российской Федерации. Все споры подлежат рассмотрению в судах по месту нахождения разработчика.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">10. Изменения Соглашения</h2>
          <p>Мы вправе изменять настоящее Соглашение. Уведомление об изменениях публикуется в приложении за 7 дней до вступления в силу (кроме случаев, требующих немедленных изменений в целях безопасности).</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">11. Контакты</h2>
          <p className="text-muted-foreground">По вопросам соблюдения настоящего Соглашения обращайтесь через раздел «Поддержка» в приложении.</p>
        </section>

        <div className="p-4 bg-muted/40 rounded-2xl text-xs text-muted-foreground">
          Настоящее Соглашение является офертой. Регистрация в Сервисе означает безоговорочное акцептирование всех его условий (ст. 428 ГК РФ).
        </div>
      </div>
    </div>
  );
}
