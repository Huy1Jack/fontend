'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
    image: string
    title: string
    subtitle: string
    link: string
}

interface ImageSliderProps {
    slides: Slide[]
}

const ImageSlider: React.FC<ImageSliderProps> = ({ slides }) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0
        const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1
        setCurrentIndex(newIndex)
    }

    const goToNext = useCallback(() => {
        const isLastSlide = currentIndex === slides.length - 1
        const newIndex = isLastSlide ? 0 : currentIndex + 1
        setCurrentIndex(newIndex)
    }, [currentIndex, slides])

    useEffect(() => {
        const timer = setTimeout(goToNext, 5000) // Change slide every 5 seconds
        return () => clearTimeout(timer)
    }, [goToNext])

    return (
        <div className="h-[60vh] w-full m-auto relative group">
            <div className="relative w-full h-full">
                <Image
                    src={slides[currentIndex].image}
                    alt={slides[currentIndex].title}
                    fill
                    className="object-cover duration-500"
                />
                <div className="absolute inset-0 bg-black/60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
                        {slides[currentIndex].title}
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-gray-200 drop-shadow-md">
                        {slides[currentIndex].subtitle}
                    </p>
                    <div className="mt-6">
                        <Link href={slides[currentIndex].link}>
                            <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                                Khám Phá Ngay
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Previous Button */}
            <div
                onClick={goToPrevious}
                className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition-colors"
            >
                <ChevronLeft size={30} />
            </div>

            {/* Next Button */}
            <div
                onClick={goToNext}
                className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/40 transition-colors"
            >
                <ChevronRight size={30} />
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {slides.map((slide, slideIndex) => (
                    <div
                        key={slideIndex}
                        onClick={() => setCurrentIndex(slideIndex)}
                        className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${slideIndex === currentIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}

export default ImageSlider