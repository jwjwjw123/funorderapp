import { Component, OnInit } from "@angular/core";
import { FormGroup, FormArray, FormBuilder, Validators } from "@angular/forms";
import { ShopService } from "src/app/services/shop.service";
import { Product, Order, OrderDetail } from "src/app/models";
import * as moment from "moment";

@Component({
  selector: "app-create-order",
  templateUrl: "./create-order.component.html",
  styleUrls: ["./create-order.component.css"]
})
export class CreateOrderComponent implements OnInit {
  orderForm: FormGroup;
  orderDetails: FormArray;
  products: Product[];

  constructor(private fb: FormBuilder, private shopService: ShopService) {}

  ngOnInit() {
    this.getProducts();

    this.orderDetails = this.fb.array([]);
    this.orderForm = this.createForm(this.orderDetails);
  }

  checkout() {
    if (this.orderForm.valid) {
      const order: Order = {
        email: this.orderForm.value["email"],
        order_date: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        orderDetails: []
      };
      this.orderDetails.controls.forEach(element => {
        const orderDetail: OrderDetail = {
          product: {
            product_id: element.value.product_id,
            description: element.value.description
          },
          quantity: element.value.quantity
        };
        order.orderDetails.push(orderDetail);
      });
      console.log(order);
      this.shopService.createOrder(order).then(
        result => {
          console.log("Order created", result);
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  addOrderDetails() {
    this.orderDetails.push(this.createOrderDetails());
  }

  createOrderDetails(): FormGroup {
    return this.fb.group({
      product_id: ["", [Validators.required]],
      quantity: ["", [Validators.required, Validators.min(1)]]
    });
  }

  createForm(orderDetails: FormArray = this.fb.array([])): FormGroup {
    return this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      orderDetails: orderDetails
    });
  }

  getProducts() {
    this.shopService.getProducts().then(
      products => {
        this.products = products;
      },
      error => {
        console.log(error);
      }
    );
  }
}
