import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { Order, OrderDetail } from "../models";
import { OrderService } from "../services/order.service";
import * as moment from 'moment';

@Component({
  selector: "app-order",
  templateUrl: "./order.component.html",
  styleUrls: ["./order.component.css"]
})
export class OrderComponent implements OnInit {
  orderForm: FormGroup;
  orderDetails: FormArray;

  constructor(private fb: FormBuilder, private orderService: OrderService) {}

  ngOnInit() {
    this.orderForm = this.createOrderForm();
    this.orderDetails = this.orderForm.get("orderDetails") as FormArray;
  }

  checkout() {
    const values = this.orderForm.value;
    const order: Order = {
      order_date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
      email: values.email,
      orderDetails: []
    };
    for (let i = 0; i < this.orderDetails.length; i++) {
      const orderDetails: OrderDetail = {
        description: this.orderDetails.controls[i].value.description,
        quantity: this.orderDetails.controls[i].value.quantity
      };
      order.orderDetails.push(orderDetails);
    }
    console.log(order);
    this.orderService
      .createOrder(order)
      .then(result => {
        console.log(result);
      })
      .catch(error => {
        console.log(error);
      });
  }

  addOrderDetails() {
    this.orderDetails.push(this.createOrderDetails());
  }

  removeOrderDetails(idx: number) {
    this.orderDetails.removeAt(idx);
  }

  createOrderDetails(): FormGroup {
    return this.fb.group({
      description: ["", Validators.required],
      quantity: ["1", Validators.required]
    });
  }

  createOrderForm(): FormGroup {
    return this.fb.group({
      email: ["", Validators.required],
      orderDetails: this.fb.array([])
    });
  }
}
