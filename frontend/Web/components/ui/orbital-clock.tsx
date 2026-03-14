"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

export function OrbitalClock() {
    const [time, setTime] = useState(new Date())
    const [isHovered, setIsHovered] = useState(false)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
    const [mounted, setMounted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setMounted(true)
        const interval = setInterval(() => setTime(new Date()), 50)
        return () => clearInterval(interval)
    }, [])

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
        setMousePos({ x: x * 6, y: y * 6 })
    }

    const seconds = mounted ? time.getSeconds() + time.getMilliseconds() / 1000 : 0
    const minutes = mounted ? time.getMinutes() + seconds / 60 : 0
    const hours = mounted ? (time.getHours() % 12) + minutes / 60 : 0

    const secondDeg = seconds * 6
    const minuteDeg = minutes * 6
    const hourDeg = hours * 30

    const formatTime = () =>
        mounted ? time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--:--"

    return (
        <div
            ref={containerRef}
            className="relative flex flex-col items-center gap-2 cursor-pointer select-none py-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setMousePos({ x: 0, y: 0 }) }}
            onMouseMove={handleMouseMove}
            style={{ perspective: "500px" }}
        >
            {/* Clock container */}
            <div
                className="relative transition-transform duration-300 ease-out"
                style={{
                    width: 120,
                    height: 120,
                    transform: `rotateX(${-mousePos.y}deg) rotateY(${mousePos.x}deg)`,
                }}
            >
                {/* Outer bezel */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: "radial-gradient(circle at 35% 35%, #2a2a2e, #111114)",
                        boxShadow: isHovered
                            ? "0 0 0 1.5px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(56,189,248,0.15)"
                            : "0 0 0 1.5px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.6)",
                    }}
                />

                {/* Inner face */}
                <div
                    className="absolute rounded-full"
                    style={{
                        inset: 6,
                        background: "radial-gradient(circle at 40% 35%, #1c1c20, #0d0d10)",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.8), inset 0 -1px 1px rgba(255,255,255,0.03)",
                    }}
                >
                    {/* Hour markers */}
                    {Array.from({ length: 12 }).map((_, i) => {
                        const rad = (i * 30 - 90) * (Math.PI / 180)
                        const r = 40
                        const x = 50 + r * Math.cos(rad)
                        const y = 50 + r * Math.sin(rad)
                        const isActive = mounted ? Math.round(hours) % 12 === i : false

                        return (
                            <div
                                key={i}
                                className="absolute rounded-full transition-all duration-300"
                                style={{
                                    width: i % 3 === 0 ? 4 : 3,
                                    height: i % 3 === 0 ? 4 : 3,
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    transform: "translate(-50%, -50%)",
                                    background: isActive ? "#38bdf8" : i % 3 === 0 ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)",
                                    boxShadow: isActive ? "0 0 6px rgba(56,189,248,0.8)" : "none",
                                }}
                            />
                        )
                    })}

                    {/* Hour hand */}
                    <div
                        className="absolute left-1/2 bottom-1/2 origin-bottom rounded-full"
                        style={{
                            width: 2.5,
                            height: "26%",
                            transform: `translateX(-50%) rotate(${hourDeg}deg)`,
                            background: "rgba(255,255,255,0.9)",
                            boxShadow: "0 0 4px rgba(255,255,255,0.3)",
                        }}
                    />

                    {/* Minute hand */}
                    <div
                        className="absolute left-1/2 bottom-1/2 origin-bottom rounded-full"
                        style={{
                            width: 1.5,
                            height: "36%",
                            transform: `translateX(-50%) rotate(${minuteDeg}deg)`,
                            background: "rgba(255,255,255,0.75)",
                            boxShadow: "0 0 3px rgba(255,255,255,0.2)",
                        }}
                    />

                    {/* Second hand */}
                    <div
                        className="absolute left-1/2 bottom-1/2 origin-bottom rounded-full"
                        style={{
                            width: 1,
                            height: "40%",
                            transform: `translateX(-50%) rotate(${secondDeg}deg)`,
                            background: "#38bdf8",
                            boxShadow: "0 0 6px rgba(56,189,248,0.7)",
                        }}
                    />

                    {/* Center dot */}
                    <div
                        className="absolute left-1/2 top-1/2 rounded-full transition-all duration-300"
                        style={{
                            width: 6,
                            height: 6,
                            transform: "translate(-50%, -50%)",
                            background: isHovered ? "#38bdf8" : "rgba(255,255,255,0.85)",
                            boxShadow: isHovered ? "0 0 8px rgba(56,189,248,0.9)" : "0 0 3px rgba(255,255,255,0.3)",
                            zIndex: 10,
                        }}
                    />
                </div>
            </div>

            {/* Digital time */}
            <p
                className="text-[10px] font-mono tracking-widest transition-colors duration-300"
                style={{ color: isHovered ? "#38bdf8" : "rgba(255,255,255,0.3)" }}
            >
                {formatTime()}
            </p>
        </div>
    )
}
