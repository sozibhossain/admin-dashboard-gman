"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Tag,
  Package,
  Heart,
  DollarSign,
  Upload,
  FileText,
  Users,
  UserCheck,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Request Product", href: "/request-product", icon: Package },
  { name: "Donations", href: "/donations", icon: Heart },
  { name: "Revenue from Seller", href: "/revenue", icon: DollarSign },
  { name: "Upload Banner Ads", href: "/banner-ads", icon: Upload },
  { name: "Blog management", href: "/blog-management", icon: FileText },
  { name: "Seller Profile", href: "/seller-profile", icon: Users },
  { name: "Seller Profile Request", href: "/seller-requests", icon: UserCheck },
  { name: "Buyer Profile", href: "/buyer-profile", icon: User },
  { name: "Setting", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to log out");
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen md:w-[250px] lg:w-[300px] bg-[#014A14] text-white">
      {/* Logo */}
      <div className="flex items-center gap-2 p-4 pl-6 border-b border-[#014A14]">
        <Link href="#" className="flex items-center gap-2">
          <Image
            src="/assets/logo.png"
            width={40}
            height={53}
            alt="Table Fresh Logo"
            className="h-[53px] w-[40px]"
            priority
          />
          <div className="flex flex-col">
            <p className="text-[16px] font-semibold text-white">TABLE</p>
            <p className="text-[16px] font-normal text-[#039B06]">FRESH</p>
            <span className="text-[6px] font-medium leading-[120%] text-[#8F8F8F]">
              Fresh & Healthy
            </span>
          </div>
        </Link>
      </div>

      {/* Scrollable Nav */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 h-[50px] rounded text-[18px] font-medium transition-colors",
                isActive
                  ? "bg-[#038C05] text-white"
                  : "text-green-100 hover:bg-[#038C05]/80 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Pinned Logout Button */}
      <div className="p-4 border-t border-green-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-green-100 hover:bg-green-700 hover:text-white w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  );
}
