import type { ReactNode } from "react";

interface SectionShellProps {
    children: ReactNode;
    className?: string;
    id?: string;
}

export function SectionShell({ children, className = "", id }: SectionShellProps) {
    return (
        <section id={id} className={`w-full px-4 sm:px-6 md:px-8 ${className}`}>
            <div className="mx-auto max-w-7xl px-4 lg:px-1">
                {children}
            </div>
        </section>
    );
}
