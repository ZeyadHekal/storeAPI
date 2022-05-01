# API Usecase
A company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart page.

## API Endpoints
#### Products
- Index :   [GET]       '/products'  optional args: {category: string}
- Show  :   [GET]       '/products/:id'
- Create:   [POST]      '/products'         [only admin] args: {name: string, price: string, category: string}
- Delete:   [DELETE]    '/products/:id'     [only admin]

#### Users
- Index :   [GET]       '/users'            [only admin]
- Show  :   [GET]       '/users/:id'        [owner or admin]
- Create:   [POST]      '/users'     args: {firstName: string, lastName: string, password: string}
- Delete:   [DELETE]    '/users/:id'        [owner or admin]
- Authenticate:
            [POST]      '/users/:id/authenticate' {password: string}

#### Orders
- Index :   (get all system orders for admin or user's orders otherwise)
            [GET]       '/orders'               [owner or admin] 
- Show  :   [GET]       '/orders/:id/           [owner or admin]
- Create:   [POST]      '/orders/'              [logged in]
- Delete:   [DELETE]    '/orders/:id'           [owner or admin]
- Index order products:
            [GET]       '/orders/:order_id/products'                [owner or admin]
- Show order products:
            [POST]      '/orders/:order_id/products/:product_id'    [owner or admin]
- Create order products:
            [POST]      '/orders/:order_id/products' args: {product_id: number, quantity: number}    [owner or admin, only if order is not completed]
- Delete order products:
            [DELETE]    '/orders/:order_id/products'      [owner or admin, only if order is not completed]
- Set order as completed:
            [POST]      '/orders/:order_id/complete'                [owner or admin]

## Services
- Top 5 most popular products:
Returns the most 5 most purchased products data (id, name, price, category)
and their total quantity purchased
IMPORTANT: Considers products only from completed orders
            [GET]       '/services/popular_products'

## Data Shapes
#### Product
-  id
- name
- price
- category

Table: products (
    id: SERIAL PRIMARY KEY,
    name: VARCHAR(150),
    price: bigint,
    category: VARCHAR(100)
)

#### User
- id number
- username string
- firstName string
- lastName string
- password_hash string
- isAdmin boolean

Table: users (
    id: SERIAL PRIMARY KEY,
    firstName: VARCHAR(30),
    lastName: VARCHAR(30),
    password_hash: VARCHAR(200),
    isAdmin: BOOLEAN
)

#### Orders
- id
- status of order (active or complete)
- user_id
(orders_products)
- id of each product in the order
- quantity of each product in the order

Table: orders (
    id: SERIAL PRIMARY KEY,
    status: string,
    user_id: number [Forein key to users table, referencing users.id],
)

Table: orders_products (
    id: SERIAL PRIMARY KEY,
    product_id: number [Foreign key to products table, referencing products.id],
    order_id: number [Foreign key to orders table, referencing orders.id],
    quantity: bigint
)