export interface Order{
  order_id?: string,
  email: string,
  order_date: string,
  orderDetails: OrderDetail[]
}

export interface OrderDetail{
  order_detail_id?: string,
  order_id?: string,
  product: Product,
  quantity: number
}

export interface Product{
  product_id?: string,
  description: string,
  image_url?: string
}