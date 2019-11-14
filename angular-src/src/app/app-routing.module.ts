import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrderComponent } from './components/order.component';
import { HomeComponent } from './components/home.component';
import { EditOrderComponent } from './components/edit-order.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'create', component: OrderComponent },
  { path: 'edit', component: EditOrderComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
