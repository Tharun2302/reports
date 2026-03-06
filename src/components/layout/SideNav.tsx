"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cloud, Users, FileText, LayoutDashboard } from "lucide-react";
import Styles from "./Components.module.css";
import CFLogo from "@/asserts/CF_LOGO_WHITE.svg";

const iconSize = 24;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/Dashboard",
    icon: <LayoutDashboard className={Styles.navLinkIcon} size={iconSize} />,
  },
  {
    label: "Jobs",
    href: "/Jobs",
    icon: <FileText className={Styles.navLinkIcon} size={iconSize} />,
  },
];

const SideNav = () => {
  const pathname = usePathname();

  return (
    <aside className={Styles.sideNav}>
      <div className={Styles.sideNavLogo}>
        <Image
          src={CFLogo}
          alt="CloudFuze"
          width={56}
          height={31}
          priority
          unoptimized
        />
      </div>
      <nav className={Styles.sideNavNav}>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${Styles.navLink} ${isActive ? Styles.navLinkActive : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default SideNav;
