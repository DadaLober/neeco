'use client'

// React core imports
import { useEffect, useState } from "react";

const agmaImages = ["/agma.jpg", "/coop.jpg", "/fire.jpg", "/sustain.jpg", "/women.jpg"]

export default function Carousel() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % agmaImages.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#E8FE05] to-[#008033]">
            {agmaImages.map((src, index) => (
                <div
                    key={src}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${index === currentImageIndex ? "opacity-30" : "opacity-0"
                        }`}
                    style={{ backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center" }}
                />
            ))}
        </div>
    )
}