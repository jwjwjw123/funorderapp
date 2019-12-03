import { Injectable, ElementRef } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Product, Order } from "../models";

@Injectable({
  providedIn: "root"
})
export class ShopService {
  constructor(private http: HttpClient) {}

  createProduct(product: Product, imageRef: ElementRef): Promise<any> {
    const formData = new FormData();
    formData.set("description", product.description);
    formData.set("image-file", imageRef.nativeElement.files[0]);
    return this.http.post("/api/product/create", formData).toPromise();
  }

  updateProduct(product: Product) {
    return this.http.post("/api/product/update", product).toPromise();
  }

  getProducts(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      return this.http
        .get<Product[]>("/api/product/all")
        .toPromise()
        .then(
          result => {
            console.log(result);
            resolve(result["payload"]);
          },
          error => {
            reject(error);
          }
        );
    });
  }

  createOrder(order: Order) {
    console.log(">>order from services: ", order);
    return new Promise((resolve, reject) => {
      this.http
        .post("/api/order/create", order, {
          headers: new HttpHeaders({ "Content-Type": "application/json" })
        })
        .toPromise()
        .then(
          result => {
            resolve(result);
          },
          error => {
            reject(error);
          }
        );
    });
  }

  getOrders(): Promise<Order[]> {
    return this.http.get<Order[]>("/api/order/all").toPromise();
  }

  getOrderById(id: number) {
    console.log(id);
    return new Promise((resolve, reject) => {
      this.http
        .get(`/api/order/${id}`)
        .toPromise()
        .then(result => {
          console.log(">>result", result);
          resolve(result);
        })
        .catch(error => {
          console.log("error>>", error);
          reject(error);
        });
    });
  }

  signInUser(email: string, password: string) {
    const params = new HttpParams()
      .set("email", email)
      .set("password", password);
    const headers = new HttpHeaders().set(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );
    return this.http
      .post("/api/user/authenticate", params.toString(), {
        headers
      })
      .toPromise();
  }
}
