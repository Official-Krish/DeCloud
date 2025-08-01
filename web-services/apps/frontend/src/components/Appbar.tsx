import {
  Navbar,
  NavBody,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  NavItems,
} from "@/components/ui/Resizable-Appbar";
import { useState } from "react";
import { ModeToggle } from "./toggle-theme";
import { useWallet } from "@solana/wallet-adapter-react";
import UserProfileDropdown from "./user-dropdown";
import '@solana/wallet-adapter-react-ui/styles.css';
import { Button } from "./ui/button";

export default function Appbar() {
  const { wallet } = useWallet();
  const navItems = [
    {
      name: "Dashboard",
      link: "/dashboard",
    },
    {
      name: "Rent VM",
      link: "/rent",
    },
    {
      name: "Deploy Image",
      link: "/depin/deploy",
    },
  ];

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <div className="w-full border-b border-neutral-200 dark:border-neutral-800">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems}/>
          <div className="flex items-center"> 
            {/* <NavbarButton variant="secondary"><ModeToggle/></NavbarButton> */}
            {(localStorage.getItem("token") && wallet?.adapter.connected) ? (
              <NavbarButton className="flex items-center gap-1 cursor-pointer" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                <img
                  src={wallet.adapter.icon || ""}
                  alt="Wallet Address"
                  className="h-8 w-8 rounded-full"
                />
                <span className="ml-2 text-sm text-neutral-800">
                  {wallet?.adapter.publicKey?.toString().slice(0,10).concat("...") || ""}
                </span>
              </NavbarButton>
            ) : (
              <Button className="cursor-pointer" onClick={() => window.location.href="/signin"}>SignIn</Button>
            )}
          </div>
        </NavBody>
        <UserProfileDropdown
          isOpen={userDropdownOpen}
          onClose={() => setUserDropdownOpen(false)}
        />
        

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full cursor-pointer"
              >
                <ModeToggle />
              </NavbarButton>
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Profile
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}