import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ResponseFormatInterceptor } from "./interceptors/response-format.interceptor";
import { CatchExceptionFilter } from "./interceptors/catch-exceptions.filter";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as CookiesParser from "cookie-parser";

async function bootstrap() {
  const appOptions = {
    cors: true,
  };
  const app = await NestFactory.create(AppModule, appOptions);

  // declare global middleware, filter, interceptor
  app.use(CookiesParser());
  app.useGlobalInterceptors(new ResponseFormatInterceptor());
  app.useGlobalFilters(new CatchExceptionFilter());

  app.setGlobalPrefix("api", {
    exclude: [],
  });

  // config swagger document
  const documentOptions = new DocumentBuilder()
    .setTitle("Learning Project")
    .setDescription("The learning project API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = () => SwaggerModule.createDocument(app, documentOptions);
  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT ?? 9999);
}
bootstrap();
