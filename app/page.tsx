"use client";

import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// import dynamic from "next/dynamic";

// const App = dynamic(() => import("./App"), { ssr: false });

// export default App;

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <Loader />
    </div>
  );
}
