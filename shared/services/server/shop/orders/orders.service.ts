/** Заказы: список пользователя, деталка, отмена, оплата; репозиторий + маппинг в DTO. */

import {
    OrdersRepository,
    type OrderDetailSelectResult,
    type OrderShortSelectResult,
} from "@/shared/repositories/orders.repository";
import { DTO } from "@/shared/services";

const CANCELABLE_STATUSES: readonly string[] = ["NEW", "PENDING_PAYMENT"];
const PAYABLE_STATUSES: readonly string[] = ["NEW", "PENDING_PAYMENT"];

export class OrdersService {
  /** Список заказов пользователя с пагинацией. */
  static async getUserOrders(
    userId: string,
    page: number = 1,
    perPage: number = 10,
  ): Promise<DTO.OrdersListResponseDto> {
    const { orders, total } = await OrdersRepository.findByUserId(
      userId,
      page,
      perPage,
    );
    return this.mapToListResponse(orders, total, page, perPage);
  }

  /** Деталка заказа по uid (опционально с проверкой userId). */
  static async getOrderDetail(
    uid: string,
    userId?: string,
  ): Promise<DTO.OrderDetailDto | null> {
    const order = await OrdersRepository.findByUid(uid, userId);
    if (!order) return null;
    return this.mapToDetailDto(order);
  }

  /** Заказ по idempotency key или null. */
  static async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<DTO.OrderCreateResponseDto | null> {
    const order = await OrdersRepository.findByIdempotencyKey(idempotencyKey);
    if (!order) return null;

    return {
      id: order.id,
      uid: order.uid,
      status: order.status as DTO.OrderStatusDto,
      total: order.total,
      totalItems: order.totalItems,
      createdAt: order.createdAt.toISOString(),
    };
  }

  /** Отмена заказа пользователем. Возвращает DTO или объект с ошибкой. */
  static async cancelOrder(
    uid: string,
    userId: string,
  ): Promise<{ ok: true; data: DTO.OrderCancelResponseDto } | { ok: false; status: number; message: string }> {
    const order = await OrdersRepository.findForCancel(uid, userId);
    if (!order) return { ok: false, status: 404, message: "Заказ не найден" };

    if (!CANCELABLE_STATUSES.includes(order.status)) {
      return { ok: false, status: 400, message: "Этот заказ нельзя отменить" };
    }

    const updated = await OrdersRepository.updateStatus(order.id, "CANCELED" as never);
    return {
      ok: true,
      data: {
        id: updated.id,
        uid: updated.uid,
        status: updated.status as DTO.OrderStatusDto,
      },
    };
  }

  /** Находит заказ для оплаты. Возвращает данные или объект с ошибкой. */
  static async getPayableOrder(
    uid: string,
    userId: string,
  ): Promise<
    | { ok: true; data: { id: number; total: number; email: string } }
    | { ok: false; status: number; message: string }
  > {
    const order = await OrdersRepository.findForPayment(uid, userId);
    if (!order) return { ok: false, status: 404, message: "Заказ не найден" };

    if (!PAYABLE_STATUSES.includes(order.status)) {
      return { ok: false, status: 400, message: "Заказ уже оплачен или отменён" };
    }

    return { ok: true, data: { id: order.id, total: order.total, email: order.email } };
  }

  private static mapToListResponse(
    orders: OrderShortSelectResult[],
    total: number,
    page: number,
    perPage: number,
  ): DTO.OrdersListResponseDto {
    const pages = Math.max(Math.ceil(total / perPage), 1);
    const safePage = Math.min(page, pages);

    const items: DTO.OrderShortDto[] = orders.map((order) => {
      const delivery = order.delivery;
      const deliveryAddress = delivery
        ? [delivery.city, delivery.address].filter(Boolean).join(", ") || null
        : null;

      const itemImageUrls = order.items
        .map((i) => i.productImageUrl)
        .filter((url): url is string => Boolean(url));

      return {
        id: order.id,
        uid: order.uid,
        status: order.status as DTO.OrderStatusDto,
        createdAt: order.createdAt.toISOString(),
        total: order.total,
        totalItems: order.totalItems,
        itemsCount: order.items.length,
        firstItemName: order.items[0]?.productName ?? "Заказ без товаров",
        deliveryMethod:
          (delivery?.method as DTO.DeliveryMethodDto) ?? null,
        deliveryAddress,
        trackingCode: delivery?.trackingCode ?? null,
        itemImageUrls,
      };
    });

    return {
      items,
      meta: {
        page: safePage,
        perPage,
        total,
        pages,
        hasNext: safePage < pages,
        hasPrev: safePage > 1,
      },
    };
  }

  private static mapToDetailDto(order: OrderDetailSelectResult): DTO.OrderDetailDto {
    return {
      id: order.id,
      uid: order.uid,
      status: order.status as DTO.OrderStatusDto,
      createdAt: order.createdAt.toISOString(),
      total: order.total,
      totalItems: order.totalItems,
      subtotal: order.subtotal,
      discount: order.discount,
      deliveryFee: order.deliveryFee,
      email: order.email,
      phone: order.phone,
      fullName: order.fullName,
      promoCode: order.promoCodeCode,
      delivery: order.delivery
        ? {
            method: order.delivery.method as DTO.DeliveryMethodDto,
            city: order.delivery.city,
            address: order.delivery.address,
            trackingCode: order.delivery.trackingCode,
            price: order.deliveryFee, // используем deliveryFee из заказа
          }
        : null,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImageUrl: item.productImageUrl,
        sku: item.sku,
        color: item.color,
        size: item.size as DTO.SizeDto | null,
        qty: item.qty,
        price: item.price,
        total: item.total,
      })),
    };
  }
}
