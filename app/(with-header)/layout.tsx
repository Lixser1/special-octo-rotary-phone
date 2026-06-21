
import { type ReactNode } from "react";
import { Header } from "@/components/layout/Header";

export default function WithHeaderLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}