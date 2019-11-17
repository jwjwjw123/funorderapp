import { Component, OnInit } from '@angular/core';
import { ShopService } from 'src/app/services/shop.service';
import { Order } from 'src/app/models';

@Component({
  selector: 'app-edit-order',
  templateUrl: './edit-order.component.html',
  styleUrls: ['./edit-order.component.css']
})
export class EditOrderComponent implements OnInit {
  orders: Order[];

  constructor(private shopService: ShopService) { }

  ngOnInit() {
    this.shopService.getOrders().then((result) => {
      this.orders = result;
    })
  }

}
