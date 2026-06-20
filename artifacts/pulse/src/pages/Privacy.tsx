import { useLocation } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";

export default function Privacy() {
  const [, navigate] = useLocation();
  const today = "20 июня 2026 г.";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border/40 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1 as any)} className="p-2 rounded-xl hover:bg-muted/60 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <Shield size={18} className="text-primary" />
        <h1 className="text-base font-semibold">Политика конфиденциальности</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 text-sm leading-relaxed">
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
          <p className="text-xs text-muted-foreground">Последнее обновление: {today}</p>
          <p className="mt-1 font-medium">Настоящая Политика конфиденциальности описывает порядок сбора, хранения, обработки и защиты персональных данных пользователей мессенджера Nova.</p>
        </div>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">1. Оператор персональных данных</h2>
          <p>Мессенджер Nova (далее — «Сервис», «мы») является оператором персональных данных в соответствии с Федеральным законом № 152-ФЗ «О персональных данных» от 27.07.2006.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">2. Какие данные мы собираем</h2>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li><span className="text-foreground font-medium">Данные аккаунта:</span> имя пользователя, отображаемое имя, статус, аватар.</li>
            <li><span className="text-foreground font-medium">Содержимое сообщений:</span> тексты, медиафайлы, передаваемые через Сервис.</li>
            <li><span className="text-foreground font-medium">Технические данные:</span> IP-адрес, User-Agent, время сессий.</li>
            <li><span className="text-foreground font-medium">Данные о действиях:</span> история звонков, отправленные подарки, реакции.</li>
          </ul>
          <p className="text-muted-foreground mt-2">Мы не собираем паспортные данные, СНИЛС, данные банковских карт и иные сведения, позволяющие физически идентифицировать личность.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">3. Цели обработки данных</h2>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Предоставление функционала мессенджера (обмен сообщениями, звонки).</li>
            <li>Аутентификация и обеспечение безопасности аккаунта.</li>
            <li>Защита от мошенничества и нарушений правил.</li>
            <li>Улучшение качества Сервиса.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">4. Хранение данных</h2>
          <p>Данные хранятся на серверах, расположенных в соответствии с требованиями законодательства. Пароли хранятся в виде хеша (bcrypt, 12 раундов). Мы не храним пароли в открытом виде.</p>
          <p className="text-muted-foreground">Срок хранения: данные хранятся до момента удаления аккаунта пользователем или до истечения 3 лет с последней активности.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">5. Передача данных третьим лицам</h2>
          <p>Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством Российской Федерации.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">6. Права пользователей</h2>
          <p>В соответствии со ст. 14–17 ФЗ № 152-ФЗ вы имеете право:</p>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li><span className="text-foreground font-medium">Доступ:</span> запросить копию своих данных (Настройки → Конфиденциальность → Скачать данные).</li>
            <li><span className="text-foreground font-medium">Исправление:</span> изменить неточные данные в профиле.</li>
            <li><span className="text-foreground font-medium">Удаление:</span> полностью удалить аккаунт и все данные (Настройки → Конфиденциальность → Удалить аккаунт).</li>
            <li><span className="text-foreground font-medium">Ограничение:</span> настроить видимость своего профиля.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">7. Безопасность</h2>
          <p>Мы применяем следующие меры защиты:</p>
          <ul className="space-y-1 list-disc list-inside text-muted-foreground">
            <li>Шифрование паролей (bcrypt, SALT_ROUNDS=12).</li>
            <li>JWT-токены с ограниченным сроком действия (30 дней).</li>
            <li>Двухфакторная аутентификация (TOTP/2FA).</li>
            <li>Ограничение попыток входа (блокировка после 10 неудачных попыток).</li>
            <li>Защита от перебора (rate limiting на всех критичных эндпоинтах).</li>
            <li>Заголовки безопасности HTTP (HSTS, CSP, X-Frame-Options).</li>
            <li>Управление активными сессиями.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">8. Cookies и локальное хранилище</h2>
          <p>Сервис использует localStorage браузера для хранения токена авторизации и пользовательских настроек. Мы не используем сторонние трекинговые cookie.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">9. Модерация контента</h2>
          <p>В целях соблюдения законодательства и обеспечения безопасности среды Сервис может проверять публичные публикации на соответствие Правилам использования. Личные сообщения не проверяются автоматически.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">10. Изменения политики</h2>
          <p>Мы вправе изменять настоящую Политику. О существенных изменениях мы уведомим в приложении. Продолжение использования Сервиса означает согласие с обновлённой Политикой.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-semibold text-base">11. Контакты</h2>
          <p className="text-muted-foreground">По вопросам обработки персональных данных обращайтесь через раздел «Поддержка» в приложении.</p>
        </section>

        <div className="p-4 bg-muted/40 rounded-2xl text-xs text-muted-foreground">
          Настоящая Политика конфиденциальности разработана в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных» и иных применимых нормативных актов Российской Федерации.
        </div>
      </div>
    </div>
  );
}
