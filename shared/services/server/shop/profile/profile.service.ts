/** Профиль пользователя: get/update, адрес по умолчанию. */

import { prisma } from "@/prisma/prisma-client";
import { isValidEmail } from "@/shared/lib";
import type { DTO } from "@/shared/services";

/** Результат получения профиля */
export type GetProfileResult =
  | { ok: true; profile: DTO.UserProfileDto }
  | { ok: false; status: number; message: string };

/** Результат обновления профиля */
export type UpdateProfileResult = GetProfileResult;

/** Select для пользователя */
const USER_SELECT = {
  id: true,
  email: true,
  phone: true,
  name: true,
  secondName: true,
  birthDate: true,
  role: true,
} as const;

/** Select для адреса */
const ADDRESS_SELECT = {
  country: true,
  city: true,
  street: true,
  zip: true,
} as const;

type AddressData = {
  country: string | null;
  city: string;
  street: string;
  zip: string | null;
};

/** Профиль по userId или ошибка. */
export async function getUserProfile(userId: string): Promise<GetProfileResult> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...USER_SELECT,
      addresses: {
        where: { isDefault: true },
        take: 1,
        select: ADDRESS_SELECT,
      },
    },
  });

  if (!dbUser) {
    return { ok: false, status: 404, message: "Пользователь не найден" };
  }

  // Берем адрес по умолчанию или первый адрес
  let address: AddressData | null = dbUser.addresses[0] ?? null;
  if (!address) {
    const firstAddress = await prisma.address.findFirst({
      where: { userId },
      select: ADDRESS_SELECT,
    });
    address = firstAddress ?? null;
  }

  return {
    ok: true,
    profile: mapUserToProfileDto(dbUser, address),
  };
}

/** Обновление профиля и адреса по умолчанию. */
export async function updateUserProfile(
  userId: string,
  data: DTO.UserProfileUpdateDto,
): Promise<UpdateProfileResult> {
  // Валидация email
  if (data.email !== undefined) {
    const emailValidation = await validateEmailUpdate(data.email, userId);
    if (!emailValidation.ok) {
      return emailValidation;
    }
  }

  // Формируем данные для обновления пользователя
  const userUpdateData: {
    email?: string;
    phone?: string | null;
    name?: string | null;
    secondName?: string | null;
    birthDate?: Date | null;
  } = {};

  if (data.email !== undefined) {
    userUpdateData.email = data.email.trim();
  }
  if (data.phone !== undefined) {
    userUpdateData.phone = data.phone?.trim() || null;
  }
  if (data.name !== undefined) {
    userUpdateData.name = data.name?.trim() || null;
  }
  if (data.secondName !== undefined) {
    userUpdateData.secondName = data.secondName?.trim() || null;
  }
  if (data.birthDate !== undefined) {
    // birthDate приходит как ISO-строка YYYY-MM-DD или null
    userUpdateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
  }

  // Обновляем пользователя
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: userUpdateData,
    select: USER_SELECT,
  });

  // Обновляем или создаём адрес
  const address = await upsertDefaultAddress(userId, data.address);

  return {
    ok: true,
    profile: mapUserToProfileDto(updatedUser, address),
  };
}

/**
 * Валидирует email при обновлении
 */
async function validateEmailUpdate(
  email: string,
  userId: string,
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  if (!email.trim()) {
    return { ok: false, status: 400, message: "E-mail не может быть пустым" };
  }

  if (!isValidEmail(email)) {
    return { ok: false, status: 400, message: "Некорректный формат e-mail" };
  }

  // Проверка уникальности
  const existingUser = await prisma.user.findFirst({
    where: {
      email,
      id: { not: userId },
    },
  });

  if (existingUser) {
    return { ok: false, status: 400, message: "Пользователь с таким e-mail уже существует" };
  }

  return { ok: true };
}

/**
 * Обновляет или создаёт адрес по умолчанию
 */
async function upsertDefaultAddress(
  userId: string,
  addressData: DTO.UserProfileUpdateDto["address"],
): Promise<AddressData | null> {
  if (addressData === undefined) {
    // Возвращаем текущий адрес
    return prisma.address.findFirst({
      where: { userId, isDefault: true },
      select: ADDRESS_SELECT,
    });
  }

  const defaultAddress = await prisma.address.findFirst({
    where: { userId, isDefault: true },
  });

  if (defaultAddress) {
    // Обновляем существующий
    const updateData: Partial<AddressData> = {};

    if (addressData?.country !== undefined) {
      updateData.country = addressData.country?.trim() || null;
    }
    if (addressData?.city !== undefined) {
      updateData.city = addressData.city.trim() || "";
    }
    if (addressData?.street !== undefined) {
      updateData.street = addressData.street.trim() || "";
    }
    if (addressData?.zip !== undefined) {
      updateData.zip = addressData.zip?.trim() || null;
    }

    return prisma.address.update({
      where: { id: defaultAddress.id },
      data: updateData,
      select: ADDRESS_SELECT,
    });
  }

  // Создаём новый адрес
  return prisma.address.create({
    data: {
      userId,
      country: addressData?.country?.trim() || null,
      city: addressData?.city?.trim() || "",
      street: addressData?.street?.trim() || "",
      zip: addressData?.zip?.trim() || null,
      isDefault: true,
    },
    select: ADDRESS_SELECT,
  });
}

/**
 * Маппинг пользователя в ProfileDto
 */
function mapUserToProfileDto(
  user: {
    id: string;
    email: string;
    phone: string | null;
    name: string | null;
    secondName: string | null;
    birthDate: Date | null;
    role: string;
  },
  address: AddressData | null,
): DTO.UserProfileDto {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    secondName: user.secondName,
    // Преобразуем Date в ISO-строку YYYY-MM-DD для клиента
    birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : null,
    role: user.role as "USER" | "ADMIN",
    address: address
      ? {
          country: address.country,
          city: address.city,
          street: address.street,
          zip: address.zip,
        }
      : null,
  };
}
