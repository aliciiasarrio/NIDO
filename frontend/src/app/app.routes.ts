import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { LocationsComponent } from './components/locations/locations.component';
import { ShoppingComponent } from './components/shopping/shopping.component';
import { RecipesComponent } from './components/recipes/recipes.component';
import { ClothingComponent } from './components/clothing/clothing.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: '', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'inventory', component: InventoryComponent, canActivate: [authGuard] },
    { path: 'locations', component: LocationsComponent, canActivate: [authGuard] },
    { path: 'shopping', component: ShoppingComponent, canActivate: [authGuard] },
    { path: 'recipes', component: RecipesComponent, canActivate: [authGuard] },
    { path: 'clothing', component: ClothingComponent, canActivate: [authGuard] },
    { path: 'categories', component: CategoriesComponent },
    { path: '**', redirectTo: '' }
];
