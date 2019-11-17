import {
  Component,
  OnInit
} from "@angular/core";
import { ShopService } from "src/app/services/shop.service";
import { Product } from "src/app/models";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-edit-product",
  templateUrl: "./edit-product.component.html",
  styleUrls: ["./edit-product.component.css"]
})
export class EditProductComponent implements OnInit {
  products: FormGroup[] = [];

  constructor(private shopService: ShopService, private fb: FormBuilder) {}

  ngOnInit() {
    this.shopService.getProducts().then(results => {
      results.forEach(element => {
        this.products.push(this.createForm(element));
      });
    });
  }

  createForm(product: Product): FormGroup {
    return this.fb.group({
      product_id: [product.product_id],
      description: [product.description],
      image_url: [product.image_url]
    });
  }

  processForm(index: number){
    const product: FormGroup = this.products[index];
    const updatedProduct: Product = {
      product_id: product.value.product_id,
      description: product.value.description
      // image_url: product.value.image_url
    }
    console.log(updatedProduct);
    this.shopService.updateProduct(updatedProduct).then(() => {
      console.log("product updated");
    });
  }
}
