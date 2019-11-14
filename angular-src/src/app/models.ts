export interface Order{
  order_id?: number,
  email: string,
  order_date: string,
  orderDetails: OrderDetail[]
}

export interface OrderDetail{
  item_id?: number,
  order_id?: number,
  description: string,
  quantity: number
}