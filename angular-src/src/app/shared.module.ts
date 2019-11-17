import { NgModule } from "@angular/core";
import { MenuComponent } from "./components/menu/menu.component";
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [MenuComponent],
  imports: [RouterModule],
  exports: []
})
export class SharedModule {}
