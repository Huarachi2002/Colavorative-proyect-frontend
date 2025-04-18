"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Home, ImportIcon, LogOut, Menu, Plus, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Crear Proyecto", href: "/dashboard/create-project", icon: Plus },
    { name: "Perfil", href: "/dashboard/profile", icon: User },
    {
      name: "Importar Proyecto",
      href: "/dashboard/project/import",
      icon: ImportIcon,
    },
  ];

  const isActive = (path: string) => {
    return pathname && (pathname === path || pathname.startsWith(`${path}/`));
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Barra lateral ppara desktop */}

      <div className='hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col'>
        <div className='flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white'>
          <div className='flex flex-1 flex-col overflow-y-auto pb-4 pt-5'>
            <div className='flex flex-shrink-0 items-center px-4'>
              <h1 className='text-xl font-bold'>IUXC Platform</h1>
            </div>

            <nav className='mt-5 flex-1 space-y-1 bg-white px-2'>
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive(item.href)
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } group flex items-center rounded-md px-2 py-2 text-sm font-medium`}
                  >
                    <Icon
                      className={`${
                        isActive(item.href)
                          ? "text-gray-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      } mr-3 h-5 w-5 flex-shrink-0`}
                      aria-hidden='true'
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className='flex flex-shrink-0 border-t border-gray-200 p-4'>
            <div className='group block flex w-full flex-shrink-0 items-center'>
              <div>
                <div className='flex items-center'>
                  <div className='flex h-9 w-9 items-center justify-center rounded-full bg-gray-300 text-lg font-medium text-white'>
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm font-medium text-gray-700'>
                      {user?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className='mt-2 flex w-full items-center text-sm text-red-500 hover:text-red-700'
                >
                  <LogOut className='mr-1 h-4 w-4' /> Cerra sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra superior mobile */}
      <div className='md:hidden'>
        <div className='flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2'>
          <h1 className='text-lg font-bold'>IUXC Plataform</h1>
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
        </div>

        {/* Menu Movil */}
        {isMobileMenuOpen && (
          <div className='border-b border-gray-200 bg-white'>
            <div className='space-y-1 px-2 py-3'>
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive(item.href)
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } group flex items-center rounded-md px-2 py-2 text-base font-medium`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon
                      className={`${
                        isActive(item.href)
                          ? "text-gray-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      } mr-3 h-5 w-5 flex-shrink-0`}
                      aria-hidden='true'
                    />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className='flex w-full items-center rounded-md px-2 py-2 text-base font-medium text-red-500 hover:bg-gray-50 hover:text-red-700'
              >
                <LogOut className='mr-3 h-6 w-6 flex-shrink-0' />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <main className='md:pl-64'>
        <div className='py-6'>{children}</div>
      </main>
    </div>
  );
}
