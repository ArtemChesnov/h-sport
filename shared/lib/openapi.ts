import * as path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';

/**
 * Конфигурация для генерации OpenAPI спецификации
 */
const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'H-Sport API',
      version: '1.0.0',
      description: 'API интернет-магазина спортивной одежды H-Sport',
    },
    servers: [
      {
        url: '/api',
        description: 'Основной сервер API',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'JWT токен в cookie "session"',
        },
      },
    },
  },
  apis: [
    // Путь к YAML файлам спецификаций
    path.join(process.cwd(), 'docs/api/*.yaml'),
  ],
};

/**
 * Тип для OpenAPI спецификации
 */
interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, unknown>;
  components: {
    schemas: Record<string, unknown>;
    securitySchemes: Record<string, unknown>;
  };
}

/**
 * Генерирует OpenAPI спецификацию из YAML файлов
 */
export function generateOpenAPISpec(): OpenAPISpec {
  try {
    const spec = swaggerJSDoc(swaggerOptions);
    return spec as OpenAPISpec;
  } catch (error) {
    // Используем console.error здесь, так как logger может быть недоступен на этапе инициализации
    // Это допустимо, так как это утилита, а не production-код
    console.error('Ошибка генерации OpenAPI спецификации:', error);
    throw error;
  }
}

/**
 * Кэшированная спецификация (для production)
 */
let cachedSpec: OpenAPISpec | null = null;

/**
 * Получить OpenAPI спецификацию с кешированием
 */
export function getOpenAPISpec(): OpenAPISpec {
  if (process.env.NODE_ENV === 'production' && cachedSpec) {
    return cachedSpec;
  }

  cachedSpec = generateOpenAPISpec();
  return cachedSpec;
}
