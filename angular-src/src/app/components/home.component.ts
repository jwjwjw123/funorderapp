import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrderService } from '../services/order.service';

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  searchForm: FormGroup;

  constructor(private fb: FormBuilder, private orderService: OrderService) {}

  ngOnInit() {
    this.searchForm = this.fb.group({
      order_id: ["", Validators.required]
    });
  }

  processForm() {
    this.orderService.getOrderById(this.searchForm.value.order_id);
  }
}
