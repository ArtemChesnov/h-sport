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
 * Сидинг тестовых заказов только для тестового пользователя (test@gmail.com).
 * Заказы тестового пользователя не учитываются в метриках дашборда (см. getExcludeTestUserOrderWhere).
 * Перед созданием заказов все существующие заказы удаляются, чтобы в БД оставались только эти 4.
 */
export async function seedOrders(prisma: PrismaClient) {
  // Всегда очищаем заказы и создаём только 4 заказа тестового пользователя
  await prisma.orderEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

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
  const promoCodeByCode = new Map((await prisma.promoCode.findMany()).map((pc) => [pc.code, pc]));

  if (productItems.length < 3) {
    console.warn(
      `[seedOrders] Недостаточно ProductItem (нашли ${productItems.length}). ` +
        `Сначала запусти seedProducts.`
    );
    return;
  }

  // Фолбэк для картинки, если у ProductItem нет imageUrls
  const getImageUrl = (pi: (typeof productItems)[number]): string =>
    pi.imageUrls?.[0] || "/assets/images/sport-types/fitness.webp";

  /**
   * Удобный хелпер для создания заказа.
   *
   * @param params объект с настройками заказа
   */
  // Получаем пользователей для привязки к заказам (ожидаем только admin + test)
  const users = await prisma.user.findMany({ take: 10 });
  const userByEmail = new Map(users.map((u) => [u.email, u]));

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
        const eventDate = new Date(createdAt.getTime() + (event.daysAgoOffset ?? 0) * 60 * 1000);
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
          updatedAt:
            params.payment.status === PaymentStatus.PAID
              ? new Date(createdAt.getTime() + 60000)
              : createdAt,
        },
      });
    }
  }

  // ---------- Заказы только тестового пользователя (test@gmail.com, пароль test1234) для ЛК ----------
  await createOrder({
    daysAgo: 2,
    status: OrderStatus.PAID,
    email: "test@gmail.com",
    phone: "+7 900 000-00-00",
    fullName: "Тестовый Пользователь",
    delivery: {
      method: DeliveryMethod.CDEK_PVZ,
      city: "Москва",
      address: "ПВЗ CDEK, ул. Тверская, д. 10",
      trackingCode: "CDEK-TEST-001",
      deliveryFee: 300_00,
    },
    itemsConfig: [
      { index: 0, qty: 1 },
      { index: 1, qty: 2 },
      { index: 5, qty: 1 },
    ],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.CARD,
    },
  });

  await createOrder({
    daysAgo: 5,
    status: OrderStatus.SHIPPED,
    email: "test@gmail.com",
    phone: "+7 900 000-00-00",
    fullName: "Тестовый Пользователь",
    delivery: {
      method: DeliveryMethod.CDEK_COURIER,
      city: "Москва",
      address: "ул. Ленина, д. 5, кв. 12",
      trackingCode: "CDEK-TEST-002",
      deliveryFee: 350_00,
    },
    itemsConfig: [
      { index: 8, qty: 1 },
      { index: 9, qty: 1 },
      { index: 10, qty: 2 },
    ],
    promoCode: "WELCOME10",
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.SBP,
    },
  });

  await createOrder({
    daysAgo: 12,
    status: OrderStatus.DELIVERED,
    email: "test@gmail.com",
    phone: "+7 900 000-00-00",
    fullName: "Тестовый Пользователь",
    delivery: {
      method: DeliveryMethod.POCHTA_PVZ,
      city: "Москва",
      address: "Почта России, отделение 101000",
      trackingCode: "POCHTA-TEST-001",
      deliveryFee: 0,
    },
    itemsConfig: [
      { index: 15, qty: 1 },
      { index: 16, qty: 1 },
      { index: 20, qty: 2 },
    ],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.CARD,
    },
  });

  await createOrder({
    daysAgo: 1,
    status: OrderStatus.PROCESSING,
    email: "test@gmail.com",
    phone: "+7 900 000-00-00",
    fullName: "Тестовый Пользователь",
    delivery: {
      method: DeliveryMethod.PICKUP_SHOWROOM,
      city: "Москва",
      address: "Шоурум h-sport, ул. Спортивная, д. 7",
      trackingCode: null,
      deliveryFee: 0,
    },
    itemsConfig: [
      { index: 3, qty: 2 },
      { index: 4, qty: 1 },
      { index: 7, qty: 1 },
    ],
    payment: {
      status: PaymentStatus.PAID,
      method: PaymentMethod.SBP,
    },
  });

  console.log("[seedOrders] Сидинг заказов завершён.");
}
