// components/Layout.tsx
import { ReactNode } from "react";
import { Header } from "@/components/Header";
import { useConnection } from "@/hooks/useConnection";

interface LayoutProps {
  children: ReactNode;
  isDark: boolean;
  onThemeToggle: () => void;
}

export function Layout({ children, isDark, onThemeToggle }: LayoutProps) {
  const { isConnected } = useConnection();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Header */}
      <Header
        isOnline={isConnected}
        isDark={isDark}
        onThemeToggle={onThemeToggle}
      />

      {/* Main Content - растягиваем на всю доступную высоту */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>Level GUN v3.0 • Real-time WebSocket connection</p>
        </div>
      </footer>
    </div>
  );
}
