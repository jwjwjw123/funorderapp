export interface Order{
  email: string,
  order_date: string,
  orderDetails: OrderDetail[]
}

export interface OrderDetail{
  description: string,
  quantity: number
}