"use client";

import Navbar from "@/components/Navbar";
import Live from "@/components/Live";

export default function Page() {
  return (
    <main className='h-screen overflow-hidden'>
      <Navbar />
      <section className='flex h-full flex-row'>
        <Live />
      </section>
    </main>
  );
}
