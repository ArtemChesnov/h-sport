import { Container, ShopBreadcrumbs } from "@/shared/components/common";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Правила продажи",
  description:
    "Правила продажи товаров в интернет-магазине H-Sport. Оформление заказа, оплата, доставка, возврат.",
};

const sectionTitle =
  "mb-3 mt-8 text-[20px] font-semibold leading-[130%] max-[576px]:text-[18px] min-[1024px]:text-[22px] first:mt-0";
const paragraph =
  "mb-3 text-[15px] leading-[150%] text-text-primary max-[576px]:text-[14px] min-[1024px]:text-[16px]";
const listItem =
  "mb-1.5 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#EB6081]";

export default function SalesRulesPage() {
  return (
    <div className="shop">
      <Container>
        <ShopBreadcrumbs customLastLabel="Правила продажи" />
        <h1 className="mb-6 mt-15 text-[28px] font-semibold leading-[120%] max-[576px]:text-[22px] max-[576px]:mb-4 min-[768px]:text-[32px] min-[1024px]:text-[38px] min-[1440px]:mb-10">
          Правила продажи товаров в интернет-магазине H-Sport
        </h1>
        <p className={`${paragraph} mb-8`}>
          Настоящие правила регулируют отношения между интернет-магазином H Sport (далее —
          «Продавец») и пользователями сайта (далее — «Покупатель») при оформлении и приобретении
          товаров через сайт.
        </p>

        <div className="space-y-6 pb-12 min-[1440px]:space-y-8">
          <section>
            <h2 className={sectionTitle}>1. Общие положения</h2>
            <p className={paragraph}>
              1.1. Интернет-магазин H Sport осуществляет дистанционную продажу спортивной одежды и
              аксессуаров в соответствии с Гражданским кодексом РФ, Законом «О защите прав
              потребителей» и Постановлением Правительства РФ № 2463 от 31.12.2020.
            </p>
            <p className={paragraph}>
              1.2. Размещение заказа на сайте означает согласие Покупателя с настоящими правилами и
              заключение договора купли-продажи в форме публичной оферты.
            </p>
            <p className={paragraph}>
              1.3. Продавец оставляет за собой право изменять правила без предварительного
              уведомления.
            </p>
          </section>

          <section>
            <h2 className={sectionTitle}>2. Оформление заказа</h2>
            <p className={paragraph}>
              2.1. Заказ оформляется на сайте путём выбора товара и заполнения формы оформления
              заказа.
            </p>
            <p className={paragraph}>
              2.2. После размещения заказа Покупатель получает электронное или SMS-уведомление о
              подтверждении.
            </p>
            <p className={paragraph}>
              2.3. Продавец вправе уточнить детали заказа и аннулировать его в случае отсутствия
              товара.
            </p>
          </section>

          <section>
            <h2 className={sectionTitle}>3. Оплата</h2>
            <p className={paragraph}>3.1. Доступные способы оплаты:</p>
            <ul className="mb-4 list-none space-y-2">
              <li className={listItem}>банковские карты (Visa, MasterCard, Мир);</li>
              <li className={listItem}>оплата долями;</li>
              <li className={listItem}>безналичный расчёт (для юрлиц);</li>
              <li className={listItem}>
                наличными или картой при получении (если доступно в регионе).
              </li>
            </ul>
            <p className={paragraph}>
              3.2. Цены на товары указываются на сайте и могут быть изменены Продавцом в
              одностороннем порядке до момента оформления заказа.
            </p>
          </section>

          <section>
            <h2 className={sectionTitle}>4. Доставка</h2>
            <p className={paragraph}>
              4.1. Доставка осуществляется по всей территории Российской Федерации курьерскими
              службами, через пункты выдачи или Почтой России.
            </p>
            <p className={paragraph}>
              4.2. Сроки и стоимость доставки указываются при оформлении заказа.
            </p>
            <p className={paragraph}>
              4.3. При получении заказа Покупатель обязан проверить комплектность и отсутствие
              повреждений.
            </p>
          </section>

          <section>
            <h2 className={sectionTitle}>5. Возврат и обмен</h2>
            <p className={paragraph}>
              5.1. Возврат товара надлежащего качества возможен в течение 14 календарных дней с
              момента получения заказа, если сохранены товарный вид и ярлыки.
            </p>
            <p className={paragraph}>
              5.2. Возврат товара ненадлежащего качества осуществляется за счёт Продавца.
            </p>
            <p className={paragraph}>
              5.3. Подробные условия возврата указаны в разделе «Обмен и возврат».
            </p>
          </section>

          <section>
            <h2 className={sectionTitle}>6. Ответственность сторон</h2>
            <p className={paragraph}>6.1. Продавец не несёт ответственности за:</p>
            <ul className="mb-4 list-none space-y-2">
              <li className={listItem}>
                некорректные данные, указанные Покупателем при оформлении заказа;
              </li>
              <li className={listItem}>задержки в доставке по вине транспортных компаний.</li>
            </ul>
            <p className={paragraph}>
              6.2. Покупатель обязуется использовать товар в соответствии с его назначением.
            </p>
          </section>

          <section>
            <h2 className={sectionTitle}>7. Персональные данные</h2>
            <p className={paragraph}>
              7.1. Все персональные данные обрабатываются в соответствии с Федеральным законом
              №152-ФЗ «О персональных данных».
            </p>
            <p className={paragraph}>
              7.2. Продавец обязуется не передавать данные третьим лицам, за исключением случаев,
              предусмотренных законодательством РФ.
            </p>
          </section>

          <section>
            <h2 className={sectionTitle}>8. Заключительные положения</h2>
            <p className={paragraph}>8.1. Настоящие правила являются публичной офертой.</p>
            <p className={paragraph}>8.2. Факт оформления заказа считается акцептом оферты.</p>
            <p className={paragraph}>
              8.3. Во всех остальных случаях, не урегулированных настоящими правилами, стороны
              руководствуются действующим законодательством РФ.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
