import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MenuComponent } from "../components/menu/menu.component";
import { CreateUserComponent } from "./create-user/create-user.component";
import { EditUserComponent } from "./edit-user/edit-user.component";

const routes: Routes = [
  { path: "", component: MenuComponent, data: { title: "User" } },
  { path: "create", component: CreateUserComponent },
  { path: "edit", component: EditUserComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
