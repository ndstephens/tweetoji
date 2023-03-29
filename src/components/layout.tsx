import { type PropsWithChildren } from "react";

export default function PageLayout({ children }: PropsWithChildren) {
  return (
    <main className="flex h-screen w-full justify-center">
      <div className="h-full w-full overflow-y-scroll border-x border-x-slate-400 md:max-w-2xl">
        {children}
      </div>
    </main>
  );
}
