"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface FadeInProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    distance?: number;
}

export function FadeIn({ children, className = "", delay = 0, distance = 14 }: FadeInProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-12% 0px" });
    const reduceMotion = useReducedMotion();
    const yOffset = reduceMotion ? 0 : distance;
    const duration = reduceMotion ? 0.2 : 0.36;

    return (
        <motion.div
            ref={ref}
            className={`sp-section-transition ${className}`}
            initial={{ opacity: 0, y: yOffset }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
            transition={{
                duration,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    );
}
