import { SectionShell } from "@/components/ui/SectionShell";

const FOOTER_LINKS = [
    { label: "Docs", href: "#" },
    { label: "GitHub", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Contact", href: "#" },
] as const;

export function Footer() {
    return (
        <footer className="border-t border-sp-border" role="contentinfo">
            <SectionShell className="py-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <span className="text-sm font-bold tracking-tight text-sp-text">
                        SmartPay
                    </span>

                    <nav aria-label="Footer navigation">
                        <ul className="flex items-center gap-6">
                            {FOOTER_LINKS.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="sp-link-interactive text-sm text-sp-text-tertiary hover:text-sp-text transition-colors duration-200"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <span className="text-xs text-sp-text-tertiary">
                        © {new Date().getFullYear()} SmartPay
                    </span>
                </div>
            </SectionShell>
        </footer>
    );
}
