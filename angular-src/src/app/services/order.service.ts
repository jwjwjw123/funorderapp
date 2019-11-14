import { Injectable } from "@angular/core";
import { Order } from "../models";
import { HttpHeaders, HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class OrderService {
  constructor(private http: HttpClient) {}

  createOrder(order: Order) {
    console.log(">>order from services: ", order);
    return new Promise((resolve, reject) => {
      this.http
        .post("/api/order/create", order, {
          headers: new HttpHeaders({ "Content-Type": "application/json" })
        })
        .toPromise()
        .then(result => {
          console.log(result);
          resolve();
        })
        .catch(error => {
          console.log(error);
          reject(error);
        });
    });
  }

  getOrderById(id: number) {
    console.log(id);
    return new Promise((resolve, reject) => {
      this.http
        .get(`api/order/${id}`)
        .toPromise()
        .then(result => {
          console.log('>>result', result);
          resolve(result);
        })
        .catch(error => {
          console.log('error>>', error);
          reject(error);
        });
    });
  }
}
