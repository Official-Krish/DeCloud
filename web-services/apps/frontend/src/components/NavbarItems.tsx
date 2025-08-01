"use client";
import { useState } from "react";
import { Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";

export function NavbarItems({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn(className, "hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-3xl cursor-pointer transition-colors duration-200")}
    >
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="DePIN Services">
          <div className="text-sm grid grid-cols-1 gap-6 px-4 py-1 min-w-[260px]">
            <ProductItem
              title="Host Dashboard"
              href="/depin/host/dashboard"
              src="https://assets.krishdev.xyz/DeCloud/dashboard.png"
              description="Manage your DePIN nodes with ease."
            />
            <ProductItem
              title="Register Node"
              href="/depin/register"
              src="https://assets.krishdev.xyz/DeCloud/registrationForm.png"
              description="Register your DePIN node and start earning."
            />
            <ProductItem
              title="Node Hosting"
              href="/hosting"
              src="https://assets.krishdev.xyz/DeCloud/RegistrationSteps.png"
              description="Host your DePIN node with us."
            />
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}
