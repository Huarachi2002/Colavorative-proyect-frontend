"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { APP_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  ImportIcon,
  LogOut,
  Menu,
  Plus,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
};

const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    href: APP_ROUTES.DASHBOARD.ROOT,
    icon: Home,
    description: "Ver todos tus proyectos",
  },
  {
    name: "Crear Proyecto",
    href: APP_ROUTES.DASHBOARD.CREATE_PROJECT,
    icon: Plus,
    description: "Iniciar un nuevo proyecto colaborativo",
  },
  {
    name: "Perfil",
    href: APP_ROUTES.DASHBOARD.PROFILE,
    icon: User,
    description: "Gestiona tu información personal",
  },
  {
    name: "Importar Proyecto",
    href: APP_ROUTES.DASHBOARD.PROJECT.IMPORT,
    icon: ImportIcon,
    description: "Importar un proyecto existente",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSiderbarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isActive = (path: string) => {
    return pathname && (pathname === path || pathname.startsWith(`${path}/`));
  };

  const NavItem = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Icon
          className={cn(
            "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
            active
              ? "text-primary-blue"
              : "text-gray-400 group-hover:text-gray-500"
          )}
          aria-hidden='true'
        />
        {isSiderbarOpen && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Barra lateral para desktop - Con transición y toggle */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex flex-col transition-all duration-300 ease-in-out",
          isSiderbarOpen ? "md:w-64" : "md:w-20"
        )}
      >
        <div className='flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white'>
          <div className='flex h-16 flex-shrink-0 items-center px-4'>
            {isSiderbarOpen ? (
              <h1 className='text-xl font-bold text-primary-blue'>
                IUXC Platform
              </h1>
            ) : (
              <h1 className='text-xl font-bold text-primary-blue'>IUXC</h1>
            )}
          </div>

          <div className='flex flex-1 flex-col overflow-y-auto'>
            <nav className='flex-1 space-y-1 px-2 py-4'>
              {navigationItems.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </div>

          <div className='flex flex-shrink-0 border-t border-gray-200 p-4'>
            <div className='group block w-full flex-shrink-0'>
              <div className='flex items-center'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-primary-blue text-lg font-medium text-white'>
                  {user?.name?.charAt(0) || "U"}
                </div>
                {isSiderbarOpen && (
                  <div className='ml-3'>
                    <p className='max-w-[140px] truncate text-sm font-medium text-gray-700'>
                      {user?.name || "Usuario"}
                    </p>
                    <p className='max-w-[140px] truncate text-xs text-gray-500'>
                      {user?.email || ""}
                    </p>
                  </div>
                )}
              </div>
              {isSiderbarOpen && (
                <button
                  onClick={logout}
                  className='mt-3 flex w-full items-center rounded-md px-2 py-1 text-sm text-red-500 hover:bg-red-50 hover:text-red-700'
                >
                  <LogOut className='mr-2 h-4 w-4' /> Cerrar sesión
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Botón para expandir/colapsar la barra lateral */}
        <button
          onClick={() => setIsSidebarOpen(!isSiderbarOpen)}
          className='absolute -right-4 top-20 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50'
          aria-label={
            isSiderbarOpen ? "Colapsar barra lateral" : "Expandir barra lateral"
          }
        >
          {isSiderbarOpen ? (
            <ChevronLeft className='h-4 w-4 text-gray-600' />
          ) : (
            <ChevronRight className='h-4 w-4 text-gray-600' />
          )}
        </button>
      </div>

      {/* Barra superior mobile */}
      <div className='md:hidden'>
        {/* <div className='flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2'>
          <h1 className='text-lg font-bold'>IUXC Platform</h1>
          <button
            type='button'
            className='text-gray-500 hover:text-gray-600'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className='h-6 w-6' aria-hidden='true' />
            ) : (
              <Menu className='h-6 w-6' aria-hidden='true' />
            )}
          </button>
        </div> */}

        {/* Menú móvil */}
        {/* {isMobileMenuOpen && (
          <div className='absolute inset-x-0 top-[53px] z-10 border-b border-gray-200 bg-white shadow-lg'>
            <div className='space-y-1 px-2 py-3'>
              {navigationItems.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
              <button
                onClick={logout}
                className='flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-700'
              >
                <LogOut className='mr-3 h-5 w-5 flex-shrink-0' />
                Cerrar sesión
              </button>
            </div>
          </div>
        )} */}
      </div>

      {/* Contenido principal - Ajustado para tener en cuenta el ancho de la barra lateral */}
      <main
        className={cn(
          "transition-all duration-300 ease-in-out",
          isSiderbarOpen ? "md:pl-64" : "md:pl-20"
        )}
      >
        <div className='mt-3 h-full w-full'>
          <div className='mx-auto max-w-full'>{children}</div>
        </div>
      </main>
    </div>
  );
}
