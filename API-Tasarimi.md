# API Tasarımı - OpenAPI Specification Örneği

Bu doküman, OpenAPI Specification (OAS) 3.0 standardına göre hazırlanmış örnek bir API tasarımını içermektedir.

## OpenAPI Nedir?

**OpenAPI** (eski adıyla Swagger), RESTful API'lerin tasarımı, dokümantasyonu ve kullanımı için kullanılan açık bir spesifikasyondur. OpenAPI, API'lerin yapısını, endpoint'lerini, parametrelerini, request/response formatlarını ve güvenlik gereksinimlerini standart bir formatta tanımlamanıza olanak sağlar.

### Temel Özellikler:

- **Standart Format**: YAML veya JSON formatında API'yi tanımlar
- **Otomatik Dokümantasyon**: Swagger UI gibi araçlarla interaktif dokümantasyon oluşturur
- **Kod Üretimi**: Client ve server kodlarını otomatik olarak üretebilir
- **Test Kolaylığı**: API'leri doğrudan dokümantasyondan test edebilirsiniz
- **Takım İşbirliği**: Frontend ve backend ekipleri arasında net bir sözleşme sağlar

### Neden Kullanılır?

1. **Tutarlılık**: Tüm API'ler aynı standartta dokümante edilir
2. **Zaman Tasarrufu**: Otomatik dokümantasyon ve kod üretimi
3. **Hata Azaltma**: API tasarımı kodlamadan önce netleşir
4. **Kolay Entegrasyon**: Farklı ekipler ve sistemler arasında entegrasyon kolaylaşır

## Genel Bakış

Bu örnek, bir e-ticaret platformu için kullanıcı ve ürün yönetimi API'sini göstermektedir.

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: E-Ticaret API
  description: |
    E-ticaret platformu için RESTful API.
    
    ## Özellikler
    - Kullanıcı yönetimi
    - Ürün katalog yönetimi
    - Sipariş işlemleri
    - JWT tabanlı kimlik doğrulama
  version: 1.0.0
  contact:
    name: API Destek Ekibi
    email: api-support@yazmuh.com
    url: https://api.yazmuh.com/support
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.yazmuh.com/v1
    description: Production server
  - url: https://staging-api.yazmuh.com/v1
    description: Staging server
  - url: http://localhost:3000/v1
    description: Development server

tags:
  - name: users
    description: Kullanıcı yönetimi işlemleri
  - name: products
    description: Ürün katalog işlemleri
  - name: orders
    description: Sipariş işlemleri
  - name: auth
    description: Kimlik doğrulama işlemleri

paths:
  /auth/register:
    post:
      tags:
        - auth
      summary: Yeni kullanıcı kaydı
      description: Sisteme yeni bir kullanıcı kaydeder
      operationId: registerUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserRegistration'
            examples:
              example1:
                summary: Örnek kullanıcı kaydı
                value:
                  email: kullanici@example.com
                  password: Guvenli123!
                  firstName: Ahmet
                  lastName: Yılmaz
      responses:
        '201':
          description: Kullanıcı başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/BadRequest'
        '409':
          description: Email adresi zaten kullanımda
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/login:
    post:
      tags:
        - auth
      summary: Kullanıcı girişi
      description: Email ve şifre ile giriş yapar, JWT token döner
      operationId: loginUser
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginCredentials'
      responses:
        '200':
          description: Giriş başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthToken'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /users:
    get:
      tags:
        - users
      summary: Kullanıcı listesi
      description: Sistemdeki tüm kullanıcıları listeler (sayfalama ile)
      operationId: listUsers
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
        - name: role
          in: query
          description: Kullanıcı rolüne göre filtrele
          schema:
            type: string
            enum: [admin, user, guest]
      responses:
        '200':
          description: Başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserList'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /users/{userId}:
    get:
      tags:
        - users
      summary: Kullanıcı detayı
      description: Belirli bir kullanıcının detay bilgilerini getirir
      operationId: getUserById
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UserIdParam'
      responses:
        '200':
          description: Başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'
    
    put:
      tags:
        - users
      summary: Kullanıcı güncelle
      description: Kullanıcı bilgilerini günceller
      operationId: updateUser
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UserIdParam'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserUpdate'
      responses:
        '200':
          description: Kullanıcı başarıyla güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'
    
    delete:
      tags:
        - users
      summary: Kullanıcı sil
      description: Kullanıcıyı sistemden siler
      operationId: deleteUser
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/UserIdParam'
      responses:
        '204':
          description: Kullanıcı başarıyla silindi
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'

  /products:
    get:
      tags:
        - products
      summary: Ürün listesi
      description: Tüm ürünleri listeler
      operationId: listProducts
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
        - name: category
          in: query
          description: Kategoriye göre filtrele
          schema:
            type: string
        - name: minPrice
          in: query
          description: Minimum fiyat
          schema:
            type: number
            format: float
        - name: maxPrice
          in: query
          description: Maximum fiyat
          schema:
            type: number
            format: float
      responses:
        '200':
          description: Başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ProductList'
    
    post:
      tags:
        - products
      summary: Yeni ürün ekle
      description: Sisteme yeni bir ürün ekler
      operationId: createProduct
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProductCreate'
      responses:
        '201':
          description: Ürün başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '400':
          $ref: '#/components/responses/BadRequest'

  /products/{productId}:
    get:
      tags:
        - products
      summary: Ürün detayı
      description: Belirli bir ürünün detay bilgilerini getirir
      operationId: getProductById
      parameters:
        - $ref: '#/components/parameters/ProductIdParam'
      responses:
        '200':
          description: Başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '404':
          $ref: '#/components/responses/NotFound'

  /orders:
    get:
      tags:
        - orders
      summary: Sipariş listesi
      description: Kullanıcının siparişlerini listeler
      operationId: listOrders
      security:
        - bearerAuth: []
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
      responses:
        '200':
          description: Başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderList'
    
    post:
      tags:
        - orders
      summary: Yeni sipariş oluştur
      description: Yeni bir sipariş oluşturur
      operationId: createOrder
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrderCreate'
      responses:
        '201':
          description: Sipariş başarıyla oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token ile kimlik doğrulama

  parameters:
    UserIdParam:
      name: userId
      in: path
      required: true
      description: Kullanıcı ID'si
      schema:
        type: string
        format: uuid
    
    ProductIdParam:
      name: productId
      in: path
      required: true
      description: Ürün ID'si
      schema:
        type: string
        format: uuid
    
    PageParam:
      name: page
      in: query
      description: Sayfa numarası
      schema:
        type: integer
        minimum: 1
        default: 1
    
    LimitParam:
      name: limit
      in: query
      description: Sayfa başına kayıt sayısı
      schema:
        type: integer
        minimum: 1
        maximum: 100
        default: 20

  schemas:
    User:
      type: object
      required:
        - id
        - email
        - firstName
        - lastName
        - role
        - createdAt
      properties:
        id:
          type: string
          format: uuid
          description: Kullanıcı benzersiz kimliği
          example: "123e4567-e89b-12d3-a456-426614174000"
        email:
          type: string
          format: email
          description: Kullanıcı email adresi
          example: "kullanici@example.com"
        firstName:
          type: string
          description: Ad
          example: "Ahmet"
        lastName:
          type: string
          description: Soyad
          example: "Yılmaz"
        role:
          type: string
          enum: [admin, user, guest]
          description: Kullanıcı rolü
          example: "user"
        createdAt:
          type: string
          format: date-time
          description: Oluşturulma tarihi
          example: "2024-01-15T10:30:00Z"
        updatedAt:
          type: string
          format: date-time
          description: Güncellenme tarihi
          example: "2024-01-20T14:45:00Z"
        phone:
          type: string
          description: Telefon numarası
          example: "+905551234567"

    UserRegistration:
      type: object
      required:
        - email
        - password
        - firstName
        - lastName
      properties:
        email:
          type: string
          format: email
          example: "kullanici@example.com"
        password:
          type: string
          format: password
          minLength: 8
          example: "Guvenli123!"
        firstName:
          type: string
          minLength: 2
          example: "Ahmet"
        lastName:
          type: string
          minLength: 2
          example: "Yılmaz"

    UserUpdate:
      type: object
      properties:
        firstName:
          type: string
          minLength: 2
          example: "Ahmet"
        lastName:
          type: string
          minLength: 2
          example: "Yılmaz"
        email:
          type: string
          format: email
          example: "yeniemail@example.com"
        phone:
          type: string
          description: Telefon numarası
          example: "+905551234567"

    LoginCredentials:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
          example: "kullanici@example.com"
        password:
          type: string
          format: password
          example: "Guvenli123!"

    AuthToken:
      type: object
      required:
        - token
        - expiresIn
        - user
      properties:
        token:
          type: string
          description: JWT access token
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        expiresIn:
          type: integer
          description: Token geçerlilik süresi (saniye)
          example: 3600
        user:
          $ref: '#/components/schemas/User'

    Product:
      type: object
      required:
        - id
        - name
        - price
        - category
        - stock
      properties:
        id:
          type: string
          format: uuid
          example: "987e6543-e21b-12d3-a456-426614174000"
        name:
          type: string
          description: Ürün adı
          example: "Laptop"
        description:
          type: string
          description: Ürün açıklaması
          example: "15.6 inç, 16GB RAM, 512GB SSD"
        price:
          type: number
          format: float
          description: Ürün fiyatı (TL)
          example: 25999.99
        category:
          type: string
          description: Ürün kategorisi
          example: "Elektronik"
        stock:
          type: integer
          description: Stok miktarı
          example: 50
        imageUrl:
          type: string
          format: uri
          description: Ürün görseli URL'i
          example: "https://example.com/images/laptop.jpg"
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    ProductCreate:
      type: object
      required:
        - name
        - price
        - category
        - stock
      properties:
        name:
          type: string
          minLength: 3
        description:
          type: string
        price:
          type: number
          format: float
          minimum: 0
        category:
          type: string
        stock:
          type: integer
          minimum: 0
        imageUrl:
          type: string
          format: uri

    Order:
      type: object
      required:
        - id
        - userId
        - items
        - totalAmount
        - status
        - createdAt
      properties:
        id:
          type: string
          format: uuid
        userId:
          type: string
          format: uuid
        items:
          type: array
          items:
            $ref: '#/components/schemas/OrderItem'
        totalAmount:
          type: number
          format: float
          description: Toplam tutar (TL)
        status:
          type: string
          enum: [pending, processing, shipped, delivered, cancelled]
          description: Sipariş durumu
        shippingAddress:
          $ref: '#/components/schemas/Address'
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    OrderCreate:
      type: object
      required:
        - items
        - shippingAddress
      properties:
        items:
          type: array
          minItems: 1
          items:
            type: object
            required:
              - productId
              - quantity
            properties:
              productId:
                type: string
                format: uuid
              quantity:
                type: integer
                minimum: 1
        shippingAddress:
          $ref: '#/components/schemas/Address'

    OrderItem:
      type: object
      properties:
        productId:
          type: string
          format: uuid
        productName:
          type: string
        quantity:
          type: integer
        unitPrice:
          type: number
          format: float
        totalPrice:
          type: number
          format: float

    Address:
      type: object
      required:
        - street
        - city
        - postalCode
        - country
      properties:
        street:
          type: string
          example: "Atatürk Caddesi No:123"
        city:
          type: string
          example: "İstanbul"
        postalCode:
          type: string
          example: "34000"
        country:
          type: string
          example: "Türkiye"

    UserList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/User'
        pagination:
          $ref: '#/components/schemas/Pagination'

    ProductList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Product'
        pagination:
          $ref: '#/components/schemas/Pagination'

    OrderList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Order'
        pagination:
          $ref: '#/components/schemas/Pagination'

    Pagination:
      type: object
      properties:
        page:
          type: integer
          description: Mevcut sayfa
          example: 1
        limit:
          type: integer
          description: Sayfa başına kayıt
          example: 20
        totalPages:
          type: integer
          description: Toplam sayfa sayısı
          example: 5
        totalItems:
          type: integer
          description: Toplam kayıt sayısı
          example: 95

    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
          description: Hata kodu
          example: "VALIDATION_ERROR"
        message:
          type: string
          description: Hata mesajı
          example: "Geçersiz email adresi"
        details:
          type: array
          description: Detaylı hata bilgileri
          items:
            type: object
            properties:
              field:
                type: string
                example: "email"
              message:
                type: string
                example: "Email formatı geçersiz"

  responses:
    BadRequest:
      description: Geçersiz istek
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "BAD_REQUEST"
            message: "İstek parametreleri geçersiz"
    
    Unauthorized:
      description: Yetkisiz erişim
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "UNAUTHORIZED"
            message: "Kimlik doğrulama başarısız"
    
    NotFound:
      description: Kaynak bulunamadı
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "NOT_FOUND"
            message: "İstenen kaynak bulunamadı"
    
    Forbidden:
      description: Erişim reddedildi
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "FORBIDDEN"
            message: "Bu işlem için yetkiniz bulunmamaktadır"
```

## API Tasarım Prensipleri

### 1. RESTful Yaklaşım
- **Kaynak odaklı URL'ler**: `/users`, `/products`, `/orders`
- **HTTP metodları**: GET (okuma), POST (oluşturma), PUT (güncelleme), DELETE (silme)
- **Durum kodları**: 200 (başarılı), 201 (oluşturuldu), 404 (bulunamadı), vb.

### 2. Versiyonlama
- URL tabanlı versiyonlama: `/v1/users`
- Geriye dönük uyumluluk için önemli

### 3. Güvenlik
- **JWT Authentication**: Bearer token ile kimlik doğrulama
- **HTTPS**: Tüm endpoint'ler için zorunlu
- **Rate Limiting**: API kötüye kullanımını önleme

### 4. Sayfalama
- `page` ve `limit` parametreleri
- Response'da pagination metadata

### 5. Filtreleme ve Sıralama
- Query parametreleri ile filtreleme
- Örnek: `?category=Elektronik&minPrice=1000`

### 6. Hata Yönetimi
- Standart hata formatı
- Anlamlı hata kodları ve mesajları
- Detaylı hata bilgileri (field-level validation)

### 7. Dokümantasyon
- OpenAPI Specification ile otomatik dokümantasyon
- Swagger UI ile interaktif API testi
- Örnek request/response'lar

## Kullanım Örnekleri

### Kullanıcı Kaydı
```bash
curl -X POST https://api.yazmuh.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kullanici@example.com",
    "password": "Guvenli123!",
    "firstName": "Ahmet",
    "lastName": "Yılmaz"
  }'
```

### Giriş Yapma
```bash
curl -X POST https://api.yazmuh.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kullanici@example.com",
    "password": "Guvenli123!"
  }'
```

### Ürün Listesi (Filtreleme ile)
```bash
curl -X GET "https://api.yazmuh.com/v1/products?category=Elektronik&minPrice=1000&page=1&limit=20"
```

### Yeni Sipariş Oluşturma
```bash
curl -X POST https://api.yazmuh.com/v1/orders \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "987e6543-e21b-12d3-a456-426614174000",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "street": "Atatürk Caddesi No:123",
      "city": "İstanbul",
      "postalCode": "34000",
      "country": "Türkiye"
    }
  }'
```

## Araçlar ve Kaynaklar

### OpenAPI Editörleri
- [Swagger Editor](https://editor.swagger.io/) - Online OpenAPI editörü
- [VS Code OpenAPI Extension](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi)

### Dokümantasyon Araçları
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - İnteraktif API dokümantasyonu
- [Postman](https://www.postman.com/) - API testş

### Validasyon
- [OpenAPI Validator](https://apitools.dev/swagger-parser/online/) - Spec doğrulama
- [Spectral](https://stoplight.io/open-source/spectral) - API linting
