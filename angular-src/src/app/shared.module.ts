import { NgModule } from "@angular/core";
import { MenuComponent } from "./components/menu/menu.component";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "./material.module";

@NgModule({
  declarations: [MenuComponent],
  imports: [RouterModule, MaterialModule],
  exports: []
})
export class SharedModule {}
