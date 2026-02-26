
import {
  DeliveryMethod,
  OrderStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  PrismaClient,
} from "@prisma/client";

/**
 * Хелпер для расчёта суммы по позициям.
 */
function calcSubtotal(items: { price: number; qty: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/**
 * Удобный хелпер: "N дней назад" от текущего момента.
 */
function daysAgo(days: number): Date {
  const now = new Date();
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * Сидинг нескольких тестовых заказов.
 *
 * Цели:
 * - покрыть разные статусы заказов;
 * - разбросать заказы по датам (1, 3, 5, 10, 20, 45, 80 дней назад),
 *   чтобы дашборд по периодам 7d / 30d / 90d всегда имел данные;
 * - создать кейсы с разными скидками и доставкой.
 */
export async function seedOrders(prisma: PrismaClient) {
  // Если заказы уже есть — не дублируем
  const existingCount = await prisma.order.count();
  if (existingCount > 0) {
    console.log(
        `[seedOrders] В БД уже есть ${existingCount} заказ(ов), сидинг пропущен.`,
    );
    return;
  }

  // Берём больше товарных позиций для разнообразия
  const productItems = await prisma.productItem.findMany({
    take: 50,
    include: {
      product: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  // Получаем промокоды для привязки к заказам
  const promoCodeByCode = new Map(
    (await prisma.promoCode.findMany()).map((pc) => [pc.code, pc])
  );

  if (productItems.length < 3) {
    console.warn(
        `[seedOrders] Недостаточно ProductItem (нашли ${productItems.length}). ` +
        `Сначала запусти seedProducts.`,
    );
    return;
  }

  // Фолбэк для картинки, если у ProductItem нет imageUrls
  const getImageUrl = (pi: (typeof productItems)[number]): string =>
      pi.imageUrls?.[0] || "/assets/images/fitness.webp";

  /**
   * Удобный хелпер для создания заказа.
   *
   * @param params объект с настройками заказа
   */
  // Получаем пользователей для привязки к заказам
  const users = await prisma.user.findMany({
    take: 10,
  });
  const userByEmail = new Map(users.map(u => [u.email, u]));

  async function createOrder(params: {
    daysAgo: number;
    status: OrderStatus;
    email: string;
    fullName: string;
    phone: string;
    userId?: string | null; // Опционально привязать к пользователю
    delivery: {
      method: DeliveryMethod;
      city: string;
      address: string;
      trackingCode?: string | null;
      deliveryFee: number;
    };
    /**
     * itemsConfig: массив с описанием позиций:
     * index — индекс ProductItem в массиве productItems
     * qty   — количество единиц
     */
    itemsConfig: {
      index: number;
      qty: number;
    }[];
    discountRub?: number; // если нужен фиксированный дисконт, рубли
    promoCode?: string; // код промокода для привязки
    payment?: {
      status: PaymentStatus;
      method: PaymentMethod;
      amount?: number; // если отличается от total
    } | null; // null = не создавать платеж
    events?: Array<{
      type: string;
      daysAgoOffset?: number; // смещение от daysAgo в минутах
      payload?: Record<string, unknown>;
    }>; // события заказа
  }) {
    const createdAt = daysAgo(params.daysAgo);

    // Собираем массив OrderItem на основе productItems
    const items = params.itemsConfig
        .map((cfg) => {
          const pi = productItems[cfg.index];
          if (!pi) return null;

          const qty = cfg.qty;
          return {
            productId: pi.productId,
            productName: pi.product.name,
            sku: pi.sku ?? null,
            color: pi.color,
            size: pi.size.toString(),
            qty,
            price: pi.price,
            total: pi.price * qty,
            productImageUrl: getImageUrl(pi),
          };
        })
        .filter(Boolean) as {
      productId: number;
      productName: string;
      sku: string | null;
      color: string;
      size: string;
      qty: number;
      price: number;
      total: number;
      productImageUrl: string;
    }[];

    if (items.length === 0) {
      console.warn("[seedOrders] Не удалось собрать позиции заказа, пропускаю.");
      return;
    }

    const subtotal = calcSubtotal(items);
    const totalItems = items.reduce((sum, i) => sum + i.qty, 0);

    // Рассчитываем скидку: либо фиксированная, либо по промокоду
    let discount = 0;
    let promoCodeId: number | null = null;
    let promoCodeCode: string | null = null;

    if (params.promoCode) {
      const promo = promoCodeByCode.get(params.promoCode);
      if (promo && promo.isActive) {
        promoCodeId = promo.id;
        promoCodeCode = promo.code;

        // Проверяем минимальную сумму заказа
        if (!promo.minOrder || subtotal >= promo.minOrder) {
          if (promo.type === "PERCENT") {
            discount = Math.floor((subtotal * promo.value) / 100);
          } else {
            // AMOUNT
            discount = Math.min(subtotal, promo.value);
          }
        }
      }
    } else if (typeof params.discountRub === "number") {
      discount = Math.min(subtotal, params.discountRub * 100); // в копейках
    }

    const deliveryFee = params.delivery.deliveryFee;
    const total = subtotal - discount + deliveryFee;

    // Определяем userId по email, если не указан явно
    const userId = params.userId ?? userByEmail.get(params.email)?.id ?? null;

    const order = await prisma.order.create({
      data: {
        status: params.status,
        email: params.email,
        phone: params.phone,
        fullName: params.fullName,
        userId,

        totalItems,
        subtotal,
        discount,
        deliveryFee,
        total,

        promoCodeId,
        promoCodeCode,

        createdAt,

        delivery: {
          create: {
            method: params.delivery.method,
            city: params.delivery.city,
            address: params.delivery.address,
            trackingCode: params.delivery.trackingCode ?? null,
            price: deliveryFee,
          },
        },

        items: {
          create: items,
        },
      },
    });

    // Обновляем usedCount промокода, если он использован
    if (promoCodeId) {
      await prisma.promoCode.update({
        where: { id: promoCodeId },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    // Создаём события заказа
    if (params.events && params.events.length > 0) {
      for (const event of params.events) {
        const eventDate = new Date(
          createdAt.getTime() + (event.daysAgoOffset ?? 0) * 60 * 1000
        );
        await prisma.orderEvent.create({
          data: {
            orderId: order.id,
            type: event.type,
            payload: (event.payload ?? {
              status: params.status,
              userId,
              email: params.email,
            }) as object,
            createdAt: eventDate,
          },
        });
      }
    } else {
      // По умолчанию создаём событие создания заказа
      await prisma.orderEvent.create({
        data: {
          orderId: order.id,
          type: "ORDER_CREATED",
          payload: {
            status: params.status,
            userId,
            email: params.email,
          },
          createdAt,
        },
      });

      // Если заказ оплачен, создаём событие оплаты
      if (params.status === OrderStatus.PAID || params.status === OrderStatus.PROCESSING) {
        const paidAt = new Date(createdAt.getTime() + 5 * 60 * 1000); // через 5 минут
        await prisma.orderEvent.create({
          data: {
            orderId: order.id,
            type: "PAYMENT_PAID",
            payload: {
              amount: total,
              method: params.payment?.method ?? "CARD",
            },
            createdAt: paidAt,
          },
        });
      }

      // Если статус изменился, создаём событие изменения
      if (params.status !== OrderStatus.NEW && params.status !== OrderStatus.PENDING_PAYMENT) {
        const changedAt = new Date(createdAt.getTime() + 10 * 60 * 1000);
        await prisma.orderEvent.create({
          data: {
            orderId: order.id,
            type: "STATUS_CHANGED",
            payload: {
              from: OrderStatus.PENDING_PAYMENT,
              to: params.status,
            },
            createdAt: changedAt,
          },
        });
      }
    }

    // Создаём платеж, если указан
    if (params.payment !== null && params.payment !== undefined) {
      const paymentAmount = params.payment.amount ?? total;
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: PaymentProvider.ROBOKASSA,
          method: params.payment.method,
          amount: paymentAmount,
          currency: "RUB",
          status: params.payment.status,
          externalId: `ROBOKASSA-${order.id}-${Date.now()}`,
          createdAt,
          updatedAt: params.payment.status === PaymentStatus.PAID ? new Date(createdAt.getTime() + 60000) : createdAt,
        },
      });
    }
  }

  // ---------- Заказы в последние 7 дней (видно в 7d / 30d / 90d) ----------

  // #1 — позавчера, статус PAID, доставка CDEK_PVZ, без скидки
  await createOrder({
    daysAgo: 1,
    status: OrderStatus.PAID,
    email: "ivan@example.com",
    phone: "+7 900 234-56-78",
    fullName: "Иван Иванов",
    delivery: {
      method: DeliveryMethod.CDEK_PVZ,
      city: "Москва",
      address: "ПВЗ CDEK, м. Тверская, ул. Тверская, д. 10",
      trackingCode: "CDEK-12345678",
      deliveryFee: 300_00,
    },
    itemsConfig: [
      { index: 0, qty: 1 },
      { index: 1, qty: 2 },
    ],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.CARD,
    },
  });

  // #2 — 3 дня назад, статус PROCESSING, доставка CDEK_COURIER, без скидки
  await createOrder({
    daysAgo: 3,
    status: OrderStatus.PROCESSING,
    email: "maria@example.com",
    phone: "+7 900 345-67-89",
    fullName: "Мария Петрова",
    delivery: {
      method: DeliveryMethod.CDEK_COURIER,
      city: "Санкт-Петербург",
      address: "Лиговский проспект, д. 10, кв. 25",
      trackingCode: "CDEK-87654321",
      deliveryFee: 350_00,
    },
    itemsConfig: [{ index: 2, qty: 1 }],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.SBP,
    },
  });

  // #3 — 5 дней назад, статус SHIPPED, бесплатная доставка, промокод WELCOME10
  await createOrder({
    daysAgo: 5,
    status: OrderStatus.SHIPPED,
    email: "alex@example.com",
    phone: "+7 900 456-78-90",
    fullName: "Алексей Сидоров",
    delivery: {
      method: DeliveryMethod.POCHTA_PVZ,
      city: "Нижний Новгород",
      address: "Почта России, отделение 603000, ул. Покровка, д. 5",
      trackingCode: "POCHTA-12345678",
      deliveryFee: 0,
    },
    itemsConfig: [
      { index: 3, qty: 2 },
      { index: 4, qty: 1 },
    ],
    promoCode: "WELCOME10",
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.CARD,
    },
  });

  // ---------- Заказы 10–20 дней назад (видны на 30d / 90d, не видны на 7d) ----------

  // #4 — 10 дней назад, статус DELIVERED, платная доставка
  await createOrder({
    daysAgo: 10,
    status: OrderStatus.DELIVERED,
    email: "elena@example.com",
    phone: "+7 900 567-89-01",
    fullName: "Елена Козлова",
    delivery: {
      method: DeliveryMethod.POCHTA_COURIER,
      city: "Екатеринбург",
      address: "ул. Спортивная, д. 7, кв. 12",
      trackingCode: "POCHTA-87654321",
      deliveryFee: 250_00,
    },
    itemsConfig: [{ index: 5, qty: 1 }],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.SBP,
    },
  });

  // #5 — 20 дней назад, статус CANCELED (не попадает в метрики дашборда)
  await createOrder({
    daysAgo: 20,
    status: OrderStatus.CANCELED,
    email: "dmitry@example.com",
    phone: "+7 900 678-90-12",
    fullName: "Дмитрий",
    delivery: {
      method: DeliveryMethod.CDEK_PVZ,
      city: "Казань",
      address: "ПВЗ CDEK, ул. Центральная, д. 5",
      trackingCode: "CDEK-CANCELED-001",
      deliveryFee: 300_00,
    },
    itemsConfig: [{ index: 6, qty: 1 }],
    discountRub: 300,
    payment: {
      status: PaymentStatus.CANCELED,
      method: PaymentMethod.CARD,
    },
  });

  // ---------- Заказы 45–80 дней назад (видны только в 90d) ----------

  // #6 — 45 дней назад, статус PENDING_PAYMENT
  await createOrder({
    daysAgo: 45,
    status: OrderStatus.PENDING_PAYMENT,
    email: "anna@example.com",
    phone: "+7 900 789-01-23",
    fullName: "Анна Смирнова",
    delivery: {
      method: DeliveryMethod.CDEK_COURIER,
      city: "Самара",
      address: "ул. Набережная, д. 12, кв. 8",
      trackingCode: null,
      deliveryFee: 350_00,
    },
    itemsConfig: [{ index: 7, qty: 1 }],
    payment: {
      status: PaymentStatus.PENDING,
      method: PaymentMethod.AUTO,
    },
  });

  // #7 — 80 дней назад, статус PAID, бесплатная доставка
  await createOrder({
    daysAgo: 80,
    status: OrderStatus.PAID,
    email: "user@test.ru",
    phone: "+7 900 111-11-11",
    fullName: "User Test",
    delivery: {
      method: DeliveryMethod.PICKUP_SHOWROOM,
      city: "Нижний Новгород",
      address: "Шоурум h-sport, ул. Спортивная, д. 7",
      trackingCode: "PICKUP-2025-0001",
      deliveryFee: 0,
    },
    itemsConfig: [
      { index: 1, qty: 1 },
      { index: 2, qty: 1 },
    ],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.CARD,
    },
  });

  // Добавляем ещё несколько заказов для разнообразия
  await createOrder({
    daysAgo: 2,
    status: OrderStatus.PAID,
    email: "ivan@example.com",
    phone: "+7 900 234-56-78",
    fullName: "Иван Иванов",
    delivery: {
      method: DeliveryMethod.CDEK_PVZ,
      city: "Москва",
      address: "ПВЗ CDEK, м. Автозаводская",
      trackingCode: "CDEK-11223344",
      deliveryFee: 300_00,
    },
    itemsConfig: [{ index: 8, qty: 2 }],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.SBP,
    },
  });

  await createOrder({
    daysAgo: 4,
    status: OrderStatus.SHIPPED,
    email: "maria@example.com",
    phone: "+7 900 345-67-89",
    fullName: "Мария Петрова",
    delivery: {
      method: DeliveryMethod.CDEK_COURIER,
      city: "Санкт-Петербург",
      address: "Невский проспект, д. 28, кв. 15",
      trackingCode: "CDEK-55667788",
      deliveryFee: 350_00,
    },
    itemsConfig: [
      { index: 9, qty: 1 },
      { index: 0, qty: 1 },
    ],
    promoCode: "SALE500", // Промокод 500₽ от 3000₽
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.CARD,
    },
  });

  await createOrder({
    daysAgo: 15,
    status: OrderStatus.DELIVERED,
    email: "elena@example.com",
    phone: "+7 900 567-89-01",
    fullName: "Елена Козлова",
    delivery: {
      method: DeliveryMethod.POCHTA_PVZ,
      city: "Екатеринбург",
      address: "Почта России, отделение 620000",
      trackingCode: "POCHTA-99887766",
      deliveryFee: 0,
    },
    itemsConfig: [{ index: 1, qty: 3 }],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.SBP,
    },
  });

  // Добавляем больше заказов для графиков (последние 7 дней)
  await createOrder({
    daysAgo: 0.5, // сегодня утром
    status: OrderStatus.PAID,
    email: "ivan@example.com",
    phone: "+7 900 234-56-78",
    fullName: "Иван Иванов",
    delivery: {
      method: DeliveryMethod.CDEK_PVZ,
      city: "Москва",
      address: "ПВЗ CDEK, м. Красные Ворота",
      trackingCode: "CDEK-TODAY-001",
      deliveryFee: 300_00,
    },
    itemsConfig: [{ index: 10, qty: 1 }],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.SBP,
    },
  });

  await createOrder({
    daysAgo: 1.5,
    status: OrderStatus.PROCESSING,
    email: "elena@example.com",
    phone: "+7 900 567-89-01",
    fullName: "Елена Козлова",
    delivery: {
      method: DeliveryMethod.POCHTA_PVZ,
      city: "Екатеринбург",
      address: "Почта России, отделение 620001",
      trackingCode: "POCHTA-2025-001",
      deliveryFee: 0,
    },
    itemsConfig: [
      { index: 11, qty: 2 },
      { index: 12, qty: 1 },
    ],
    promoCode: "LIMITED20",
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.CARD,
    },
  });

  await createOrder({
    daysAgo: 2.5,
    status: OrderStatus.PAID,
    email: "alex@example.com",
    phone: "+7 900 456-78-90",
    fullName: "Алексей Сидоров",
    delivery: {
      method: DeliveryMethod.CDEK_COURIER,
      city: "Нижний Новгород",
      address: "ул. Ленина, д. 50, кв. 30",
      trackingCode: "CDEK-NN-001",
      deliveryFee: 350_00,
    },
    itemsConfig: [{ index: 13, qty: 3 }],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.SBP,
    },
  });

  await createOrder({
    daysAgo: 4.5,
    status: OrderStatus.SHIPPED,
    email: "maria@example.com",
    phone: "+7 900 345-67-89",
    fullName: "Мария Петрова",
    delivery: {
      method: DeliveryMethod.PICKUP_SHOWROOM,
      city: "Санкт-Петербург",
      address: "Шоурум h-sport, Невский проспект, д. 50",
      trackingCode: "PICKUP-SPB-001",
      deliveryFee: 0,
    },
    itemsConfig: [{ index: 14, qty: 1 }],
    promoCode: "WELCOME10",
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.CARD,
    },
  });

  await createOrder({
    daysAgo: 6,
    status: OrderStatus.DELIVERED,
    email: "ivan@example.com",
    phone: "+7 900 234-56-78",
    fullName: "Иван Иванов",
    delivery: {
      method: DeliveryMethod.CDEK_PVZ,
      city: "Москва",
      address: "ПВЗ CDEK, м. Сокольники",
      trackingCode: "CDEK-DELIVERED-001",
      deliveryFee: 300_00,
    },
    itemsConfig: [
      { index: 15, qty: 1 },
      { index: 16, qty: 1 },
    ],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.CARD,
    },
  });

  // Заказы 8-30 дней назад (для периода 30d)
  await createOrder({
    daysAgo: 8,
    status: OrderStatus.DELIVERED,
    email: "user@test.ru",
    phone: "+7 900 111-11-11",
    fullName: "User Test",
    delivery: {
      method: DeliveryMethod.POCHTA_COURIER,
      city: "Нижний Новгород",
      address: "ул. Минина, д. 15, кв. 5",
      trackingCode: "POCHTA-30D-001",
      deliveryFee: 250_00,
    },
    itemsConfig: [{ index: 17, qty: 2 }],
    promoCode: "WELCOME10",
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.SBP,
    },
  });

  await createOrder({
    daysAgo: 12,
    status: OrderStatus.DELIVERED,
    email: "elena@example.com",
    phone: "+7 900 567-89-01",
    fullName: "Елена Козлова",
    delivery: {
      method: DeliveryMethod.CDEK_PVZ,
      city: "Екатеринбург",
      address: "ПВЗ CDEK, ул. Ленина, д. 10",
      trackingCode: "CDEK-30D-001",
      deliveryFee: 300_00,
    },
    itemsConfig: [{ index: 18, qty: 1 }],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.CARD,
    },
  });

  await createOrder({
    daysAgo: 18,
    status: OrderStatus.DELIVERED,
    email: "alex@example.com",
    phone: "+7 900 456-78-90",
    fullName: "Алексей Сидоров",
    delivery: {
      method: DeliveryMethod.POCHTA_PVZ,
      city: "Нижний Новгород",
      address: "Почта России, отделение 603000",
      trackingCode: "POCHTA-30D-002",
      deliveryFee: 0,
    },
    itemsConfig: [
      { index: 19, qty: 2 },
      { index: 20, qty: 1 },
    ],
    promoCode: "SALE500",
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.CARD,
    },
  });

  await createOrder({
    daysAgo: 25,
    status: OrderStatus.DELIVERED,
    email: "maria@example.com",
    phone: "+7 900 345-67-89",
    fullName: "Мария Петрова",
    delivery: {
      method: DeliveryMethod.CDEK_COURIER,
      city: "Санкт-Петербург",
      address: "Лиговский проспект, д. 20, кв. 10",
      trackingCode: "CDEK-30D-002",
      deliveryFee: 350_00,
    },
    itemsConfig: [{ index: 21, qty: 1 }],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.SBP,
    },
  });

  // Заказы 30-90 дней назад (для периода 90d)
  await createOrder({
    daysAgo: 35,
    status: OrderStatus.DELIVERED,
    email: "ivan@example.com",
    phone: "+7 900 234-56-78",
    fullName: "Иван Иванов",
    delivery: {
      method: DeliveryMethod.PICKUP_SHOWROOM,
      city: "Москва",
      address: "Шоурум h-sport, ул. Тверская, д. 10",
      trackingCode: "PICKUP-90D-001",
      deliveryFee: 0,
    },
    itemsConfig: [{ index: 22, qty: 2 }],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.CARD,
    },
  });

  await createOrder({
    daysAgo: 50,
    status: OrderStatus.DELIVERED,
    email: "elena@example.com",
    phone: "+7 900 567-89-01",
    fullName: "Елена Козлова",
    delivery: {
      method: DeliveryMethod.POCHTA_PVZ,
      city: "Екатеринбург",
      address: "Почта России, отделение 620000",
      trackingCode: "POCHTA-90D-001",
      deliveryFee: 0,
    },
    itemsConfig: [
      { index: 23, qty: 1 },
      { index: 24, qty: 1 },
    ],
    promoCode: "WELCOME10",
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.SBP,
    },
  });

  await createOrder({
    daysAgo: 65,
    status: OrderStatus.DELIVERED,
    email: "alex@example.com",
    phone: "+7 900 456-78-90",
    fullName: "Алексей Сидоров",
    delivery: {
      method: DeliveryMethod.CDEK_PVZ,
      city: "Нижний Новгород",
      address: "ПВЗ CDEK, м. Горьковская",
      trackingCode: "CDEK-90D-001",
      deliveryFee: 300_00,
    },
    itemsConfig: [{ index: 25, qty: 3 }],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.CARD,
    },
  });

  await createOrder({
    daysAgo: 85,
    status: OrderStatus.DELIVERED,
    email: "maria@example.com",
    phone: "+7 900 345-67-89",
    fullName: "Мария Петрова",
    delivery: {
      method: DeliveryMethod.POCHTA_COURIER,
      city: "Санкт-Петербург",
      address: "Невский проспект, д. 30, кв. 20",
      trackingCode: "POCHTA-90D-002",
      deliveryFee: 250_00,
    },
    itemsConfig: [{ index: 26, qty: 1 }],
    promoCode: "SALE500",
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.SBP,
    },
  });

  console.log("[seedOrders] Сидинг заказов завершён.");
}
