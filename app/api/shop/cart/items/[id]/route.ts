import { cartUpdateItemSchema } from "@/shared/lib/api/request-body-schemas";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { createErrorResponse } from "@/shared/lib/api/error-response";
import { validateRequestBody } from "@/shared/lib/api/validate-request-body";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import type { DTO } from "@/shared/services";
import {
  CART_COOKIE_NAME,
  findCartItem,
  getCartByToken,
  loadCartWithRelations,
  mapCartToDto,
  recalculateCartAggregates,
  runCartTransaction,
} from "@/shared/services/server";
import type { ErrorResponse, RouteParams } from "@/shared/dto";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = RouteParams<{ id: string }>;

type CartRecord = NonNullable<Awaited<ReturnType<typeof getCartByToken>>>;
type CartItemRecord = NonNullable<Awaited<ReturnType<typeof findCartItem>>>;

async function resolveCartAndItem(
  request: NextRequest,
  rawId: string
): Promise<
  | { type: "ok"; cart: CartRecord; item: CartItemRecord }
  | { type: "error"; response: NextResponse<ErrorResponse> }
> {
  // Приводим id из params (string) к числу
  const cartItemId = Number(rawId);

  if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
    return {
      type: "error",
      response: createErrorResponse("Некорректный идентификатор позиции корзины", 400),
    };
  }

  const cartToken = request.cookies.get(CART_COOKIE_NAME)?.value;

  const cart = await getCartByToken(cartToken);

  if (!cart) {
    return {
      type: "error",
      response: createErrorResponse("Корзина не найдена", 404),
    };
  }

  const existingItem = await findCartItem(cart.id, cartItemId);

  if (!existingItem) {
    return {
      type: "error",
      response: createErrorResponse("Позиция корзины не найдена", 404),
    };
  }

  return { type: "ok", cart, item: existingItem };
}

/**
 * Обновление количества позиции в корзине.
 *
 * URL: PATCH /api/shop/cart/items/:id
 * Rate limit: 60 req/min (cart preset)
 *
 * Body: DTO.CartUpdateItemDto
 * {
 *   qty: number; // >= 1
 * }
 *
 * Я обновляю только записи в рамках текущей корзины пользователя,
 * которая определяется по cookie CART_COOKIE_NAME.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<DTO.CartDto | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const rateLimitResponse = await applyRateLimit(req, "cart");
      if (rateLimitResponse) return rateLimitResponse;

      const { id } = await context.params;
      const bodyResult = await validateRequestBody(req, cartUpdateItemSchema);
      if ("error" in bodyResult) return bodyResult.error;
      const body = bodyResult.data;

      const resolved = await resolveCartAndItem(req, id);
      if (resolved.type === "error") return resolved.response;

      const { cart, item } = resolved;
      await runCartTransaction(async (tx) => {
        await tx.cartItem.update({
          where: { id: item.id },
          data: { qty: body.qty },
        });
        await recalculateCartAggregates(cart.id, tx);
      });

      const fullCart = await loadCartWithRelations(cart.id);
      const dto = mapCartToDto(fullCart);
      return NextResponse.json<DTO.CartDto>(dto, { status: 200 });
    },
    request,
    "PATCH /api/shop/cart/items/[id]"
  );
}

/**
 * Удаление позиции из корзины.
 *
 * URL: DELETE /api/shop/cart/items/:id
 * Rate limit: 60 req/min (cart preset)
 *
 * Я удаляю только те позиции, которые принадлежат
 * корзине текущего пользователя (по cartToken).
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<DTO.CartDto | ErrorResponse>> {
  return withErrorHandling(
    async (req) => {
      const rateLimitResponse = await applyRateLimit(req, "cart");
      if (rateLimitResponse) return rateLimitResponse;

      const { id } = await context.params;
      const resolved = await resolveCartAndItem(req, id);
      if (resolved.type === "error") return resolved.response;

      const { cart, item } = resolved;
      await runCartTransaction(async (tx) => {
        await tx.cartItem.delete({ where: { id: item.id } });
        await recalculateCartAggregates(cart.id, tx);
      });

      const fullCart = await loadCartWithRelations(cart.id);
      const dto = mapCartToDto(fullCart);
      return NextResponse.json<DTO.CartDto>(dto, { status: 200 });
    },
    request,
    "DELETE /api/shop/cart/items/[id]"
  );
}
