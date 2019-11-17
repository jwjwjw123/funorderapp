import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ShopService } from "src/app/services/shop.service";
import { Product } from "src/app/models";

@Component({
  selector: "app-create-product",
  templateUrl: "./create-product.component.html",
  styleUrls: ["./create-product.component.css"]
})
export class CreateProductComponent implements OnInit {
  createProductForm: FormGroup;

  @ViewChild("imageFile", { static: false })
  imageFile: ElementRef;

  constructor(private fb: FormBuilder, private shopService: ShopService) {}

  ngOnInit() {
    this.createProductForm = this.fb.group({
      description: ["", [Validators.required]]
    });
  }

  processForm() {
    if (this.createProductForm.valid) {
      console.log(">>> form valid");
      const product: Product = {
        description: this.createProductForm.value.description
      };
      this.shopService.createProduct(product, this.imageFile).then(
        () => {
          console.log("Product created");
          this.createProductForm.reset();
        },
        error => {
          console.log(error);
        }
      );
    }
  }
}
