import { CACHE_CONTROL_API_DOCS } from "@/shared/constants";
import { withErrorHandling } from "@/shared/lib/api/error-handler";
import { applyRateLimit } from "@/shared/lib/api/rate-limit-middleware";
import { getOpenAPISpec } from "@/shared/lib/openapi";
import { NextRequest, NextResponse } from "next/server";

async function getHandler(request: NextRequest) {
  const rateLimitResponse = await applyRateLimit(request, "public");
  if (rateLimitResponse) return rateLimitResponse;

  const spec = getOpenAPISpec();

  const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>H-Sport API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.7.2/swagger-ui.css" />
    <style>
        body {
            margin: 0;
            padding: 0;
        }
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #EB6081; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.7.2/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.7.2/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                spec: ${JSON.stringify(spec)},
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                tryItOutEnabled: true,
                requestInterceptor: (req) => {
                    req.credentials = 'include';
                    return req;
                }
            });
        };
    </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": CACHE_CONTROL_API_DOCS,
    },
  });
}

export async function GET(request: NextRequest) {
  return withErrorHandling(getHandler, request, "GET /api/docs");
}
