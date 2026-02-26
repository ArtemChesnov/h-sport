

// Один вариант товара (цвет + размер).

import { SizeDto } from "../base.dto";


// Используется и в детальной карточке товара, и при добавлении в корзину.
export type ProductItemDto = {
  id: number;
  color: string;  // цвет варианта
  size: SizeDto;  // размер
  price: number;  // цена за единицу в КОПЕЙКАХ
  isAvailable: boolean; // можно ли купить сейчас
  imageUrls: string[]; // фото конкретно для этого варианта
};
