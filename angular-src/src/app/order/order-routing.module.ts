import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CreateOrderComponent } from "./create-order/create-order.component";
import { EditOrderComponent } from "./edit-order/edit-order.component";
import { MenuComponent } from "../components/menu/menu.component";

const routes: Routes = [
  { path: "", component: MenuComponent, data: { title: "Order" } },
  { path: "create", component: CreateOrderComponent },
  { path: "edit", component: EditOrderComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderRoutingModule {}
