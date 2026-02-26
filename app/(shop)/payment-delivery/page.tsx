import { Container, ShopBreadcrumbs } from "@/shared/components/common";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Оплата и доставка",
  description:
    "Способы оплаты и доставки заказов в интернет-магазине H-Sport. Курьер, пункты выдачи, Почта России, самовывоз в Нижнем Новгороде.",
};

const sectionTitle =
  "mb-3 mt-8 text-[20px] font-semibold leading-[130%] max-[576px]:text-[18px] min-[1024px]:text-[22px] first:mt-0";
const paragraph =
  "mb-3 text-[15px] leading-[150%] text-text-primary max-[576px]:text-[14px] min-[1024px]:text-[16px]";
const listItem =
  "mb-1.5 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#EB6081]";

export default function PaymentDeliveryPage() {
  return (
    <div className="shop">
      <Container>
        <ShopBreadcrumbs customLastLabel="Оплата и доставка" />
        <h1 className="mb-6 mt-[60px] text-[28px] font-semibold leading-[120%] max-[576px]:text-[22px] max-[576px]:mb-4 min-[768px]:text-[32px] min-[1024px]:text-[38px] min-[1440px]:mb-10">
          Оплата и доставка
        </h1>

        <div className="space-y-6 pb-12 min-[1440px]:space-y-8">
          <section>
            <h2 className={sectionTitle}>Оплата</h2>
            <p className={paragraph}>
              При оформлении заказа в интернет-магазине H Sport доступны следующие способы оплаты:
            </p>
            <ul className="mb-4 list-none space-y-2">
              <li className={listItem}>Банковские карты</li>
              <li className={listItem}>СБП</li>
              <li className={listItem}>
                Безналичный расчёт для юридических лиц по выставленному счёту.
              </li>
              <li className={listItem}>Оплата долями</li>
            </ul>
            <p className={paragraph}>
              Все операции проводятся через защищённые платёжные шлюзы. Данные банковских карт не
              передаются третьим лицам.
            </p>
          </section>

          <section>
            <h2 className={sectionTitle}>Доставка</h2>
            <p className={paragraph}>Доставка осуществляется по территории Российской Федерации.</p>
            <p className={`${paragraph} font-medium`}>Доступные способы доставки:</p>
            <ul className="mb-4 list-none space-y-2">
              <li className={listItem}>
                Курьерская служба — доставка до двери (сроки уточняются при оформлении заказа).
              </li>
              <li className={listItem}>
                Пункты выдачи заказов партнёрских служб (СДЭК, Boxberry, PickPoint и др.).
              </li>
              <li className={listItem}>
                Почта России — доставка в регионы и населённые пункты, где недоступны курьерские
                службы.
              </li>
              <li className={listItem}>
                Самовывоз из нашего склада/шоурума по адресу: г. Нижний Новгород, ул. Минина, 16а.
              </li>
            </ul>
            <p className={paragraph}>Сроки доставки зависят от региона:</p>
            <ul className="mb-4 list-none space-y-2">
              <li className={listItem}>Москва и Санкт-Петербург — 1–3 рабочих дня.</li>
              <li className={listItem}>Регионы России — 3–10 рабочих дней.</li>
            </ul>
            <p className={paragraph}>
              После отправки заказа покупателю направляется уведомление с номером для отслеживания.
            </p>
          </section>

          <section>
            <h2 className={sectionTitle}>Стоимость доставки</h2>
            <p className={paragraph}>
              Стоимость доставки рассчитывается автоматически при оформлении заказа и зависит от
              региона и выбранного способа доставки.
            </p>
            <p className={paragraph}>
              При заказе на сумму от 10 000 ₽ доставка осуществляется бесплатно (кроме отдалённых и
              труднодоступных регионов, список которых приведён в разделе «Условия доставки»).
            </p>
          </section>

          <section>
            <h2 className={sectionTitle}>Дополнительные условия</h2>
            <p className={paragraph}>
              Интернет-магазин H Sport оставляет за собой право изменять стоимость и сроки доставки
              в зависимости от условий транспортных компаний.
            </p>
            <p className={paragraph}>
              Все условия оплаты и доставки являются неотъемлемой частью Публичной оферты.
            </p>
            <p className={paragraph}>
              Подробную информацию о возврате товара вы можете найти в разделе «Обмен и возврат».
            </p>
          </section>

          <section id="обмен-и-возврат">
            <h2 className={sectionTitle}>Обмен и возврат</h2>
            <p className={paragraph}>
              Мы заботимся о том, чтобы покупки в H Sport были удобными и безопасными. Все условия
              возврата и обмена соответствуют требованиям Закона РФ «О защите прав потребителей».
            </p>
            <h3 className="mb-2 mt-6 text-[17px] font-semibold max-[576px]:text-[16px]">
              1. Возврат товара надлежащего качества
            </h3>
            <p className={paragraph}>
              1.1. Покупатель имеет право вернуть или обменять товар надлежащего качества в течение
              14 календарных дней с момента получения заказа, если сохранены:
            </p>
            <ul className="mb-4 list-none space-y-2">
              <li className={listItem}>товарный вид (упаковка, ярлыки, пломбы);</li>
              <li className={listItem}>
                потребительские свойства (отсутствие следов носки и использования);
              </li>
              <li className={listItem}>
                кассовый или товарный чек, либо иной документ, подтверждающий покупку.
              </li>
            </ul>
            <p className={paragraph}>
              1.2. Возврат осуществляется по адресу: г. Нижний Новгород, ул. Минина, 16а.
            </p>
            <p className={paragraph}>
              1.3. Расходы по пересылке товара при возврате надлежащего качества несёт покупатель.
            </p>

            <h3 className="mb-2 mt-6 text-[17px] font-semibold max-[576px]:text-[16px]">
              2. Возврат товара ненадлежащего качества
            </h3>
            <p className={paragraph}>
              2.1. Если вы получили товар с браком или дефектом, вы имеете право:
            </p>
            <ul className="mb-4 list-none space-y-2">
              <li className={listItem}>на безвозмездное устранение недостатков;</li>
              <li className={listItem}>обмен на аналогичный товар надлежащего качества;</li>
              <li className={listItem}>возврат денежных средств в полном объёме.</li>
            </ul>
            <p className={paragraph}>
              2.2. Расходы по пересылке товара ненадлежащего качества оплачивает H Sport.
            </p>

            <h3 className="mb-2 mt-6 text-[17px] font-semibold max-[576px]:text-[16px]">
              3. Порядок возврата денежных средств
            </h3>
            <p className={paragraph}>
              3.1. Денежные средства возвращаются тем же способом, которым была произведена оплата:
              при оплате картой — возврат на банковскую карту; при оплате наличными — возврат
              наличными или переводом на счёт.
            </p>
            <p className={paragraph}>
              3.2. Срок возврата денежных средств составляет до 10 рабочих дней с момента получения
              товара на склад и подтверждения условий возврата.
            </p>

            <h3 className="mb-2 mt-6 text-[17px] font-semibold max-[576px]:text-[16px]">
              4. Товары, не подлежащие возврату
            </h3>
            <p className={paragraph}>
              Согласно Постановлению Правительства РФ № 55 от 19.01.1998, не подлежат возврату:
            </p>
            <ul className="mb-4 list-none space-y-2">
              <li className={listItem}>нижнее бельё и спортивное бельё;</li>
              <li className={listItem}>носочно-чулочные изделия;</li>
              <li className={listItem}>товары, бывшие в употреблении и утратившие товарный вид.</li>
            </ul>

            <h3 className="mb-2 mt-6 text-[17px] font-semibold max-[576px]:text-[16px]">
              5. Контактная информация
            </h3>
            <p className={paragraph}>
              Для оформления возврата или обмена свяжитесь с нами через раздел «Контакты» на сайте
              или по контактным данным, указанным в подвале страницы.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
