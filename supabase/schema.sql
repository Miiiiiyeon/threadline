-- Threadline e-commerce project — database schema + sample data
-- HOW TO USE: In your Supabase project dashboard, go to "SQL Editor" -> "New query",
-- paste this whole file, and click "Run". That's it — no local database install needed.

-- Clean slate (safe to re-run while you're building the project)
drop table if exists order_items;
drop table if exists orders;
drop table if exists products;

create table products (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text not null,
  sizes text not null default 'S,M,L,XL',
  image_url text not null,
  stock int not null default 100,
  created_at timestamptz not null default now()
);

create table orders (
  id bigint generated always as identity primary key,
  customer_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  total_amount numeric(10,2) not null,
  transaction_uuid text not null unique,
  payment_status text not null default 'PENDING', -- PENDING | COMPLETE | FAILED
  payment_ref text,
  created_at timestamptz not null default now()
);

create table order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders(id) on delete cascade,
  product_id bigint references products(id),
  product_name text not null,
  size text not null,
  quantity int not null,
  price numeric(10,2) not null
);

-- Row Level Security: the app only ever talks to Supabase from the server
-- using the service_role key (which bypasses RLS), so we keep RLS enabled
-- with no public policies. This means the anon/public key, if it were ever
-- exposed, could not read or write anything — a safer default for a
-- student project than leaving RLS off.
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Sample clothing catalog (10 products across a few categories)
insert into products (name, description, price, category, sizes, image_url, stock) values
('Essential Crewneck Tee', 'Heavyweight 100% cotton tee with a boxy fit. Everyday basic.', 1200, 'T-Shirts', 'S,M,L,XL', 'https://picsum.photos/seed/threadline-01/600/800', 150),
('Oversized Graphic Tee', 'Relaxed fit tee with a minimal front print.', 1450, 'T-Shirts', 'S,M,L,XL', 'https://picsum.photos/seed/threadline-02/600/800', 120),
('Classic Denim Jacket', 'Mid-wash denim jacket with button front and chest pockets.', 4200, 'Jackets', 'S,M,L,XL', 'https://picsum.photos/seed/threadline-03/600/800', 60),
('Corduroy Overshirt', 'Lightweight corduroy shirt-jacket, wear buttoned or open.', 3600, 'Jackets', 'M,L,XL', 'https://picsum.photos/seed/threadline-04/600/800', 45),
('Straight Fit Jeans', 'Rigid cotton denim, straight leg, mid rise.', 2800, 'Jeans', '28,30,32,34,36', 'https://picsum.photos/seed/threadline-05/600/800', 90),
('Relaxed Cargo Pants', 'Six-pocket cargo pants in washed cotton twill.', 3100, 'Jeans', '28,30,32,34,36', 'https://picsum.photos/seed/threadline-06/600/800', 70),
('Fleece Pullover Hoodie', 'Brushed-back fleece hoodie with kangaroo pocket.', 2600, 'Hoodies', 'S,M,L,XL', 'https://picsum.photos/seed/threadline-07/600/800', 100),
('Zip-Up Hoodie', 'Midweight zip hoodie, ribbed cuffs and hem.', 2900, 'Hoodies', 'S,M,L,XL', 'https://picsum.photos/seed/threadline-08/600/800', 80),
('Midi Wrap Dress', 'Soft jersey wrap dress with tie waist.', 3400, 'Dresses', 'XS,S,M,L', 'https://picsum.photos/seed/threadline-09/600/800', 55),
('Canvas Low-Top Sneakers', 'Classic canvas sneakers with rubber sole.', 2500, 'Footwear', '38,39,40,41,42,43', 'https://picsum.photos/seed/threadline-10/600/800', 75);
