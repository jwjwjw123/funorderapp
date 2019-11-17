drop database if exists valueshop;

create database valueshop;

use valueshop;

create table users (
	user_id varchar(36) not null,
	email varchar(256) not null,
	name varchar(256) not null,

	primary key(user_id),
    key(email),
	key(name)
);

create table orders (
	order_id varchar(36) not null,
	order_date datetime not null,
	user_id varchar(36) not null,
	last_update timestamp default current_timestamp
		on update current_timestamp,

	primary key(order_id),

	constraint fk_users_orders_user_id 
		foreign key(user_id)
		references users(user_id)
);

create table products(
	product_id varchar(36) not null,
    description varchar(256) not null,
    image_url text not null,
    
    primary key(product_id)
);

create table order_details (
	order_detail_id varchar(36) not null,
	product_id varchar(36) not null,
	quantity int not null,
	order_id varchar(36) not null,

	primary key(order_detail_id),

	constraint fk_orders_order_details_order_id
		foreign key(order_id)
		references orders(order_id),
	constraint fk_products_order_details_product_id 
		foreign key(product_id) 
        references products(product_id)
);



insert into users(user_id, email, name) values
	('6219d553-ef46-4d21-b932-38a1c05963dc', 'fred@gmail.com', 'fred'),
	('7e4daecb-3699-4691-848f-fa91f77bcb3f', 'barney@gmail.com', 'barney'),
	('e21a618a-5a08-4538-a9ba-e06ba03aa121', 'wilma@gmail.com', 'wilma'),
	('61fa7678-24c9-42d6-8581-b78988cdba77', 'betty@gmail.com', 'betty');