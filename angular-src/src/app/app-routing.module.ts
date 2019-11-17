import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: "product",
    loadChildren: () =>
      import("./product/product.module").then(m => m.ProductModule)
  },
  {
    path: "order",
    loadChildren: () =>
      import("./order/order.module").then(m => m.OrderModule)
  },
  {
    path: "user",
    loadChildren: () =>
      import("./user/user.module").then(m => m.UserModule)
  },
  { path: "**", redirectTo: "/", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
