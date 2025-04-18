"use client";

import { useState } from "react";

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignup = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement signup logic here backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {}
  };
}
