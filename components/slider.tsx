"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";


const carouselItems= [
  {
    image: "/john/WhatsApp Image 2026-02-20 at 06.43.57.jpeg",
    // title: "Unite for Change",
    // subtitle: "Join the movement and make your voice heard in shaping our shared future.",
  },
  {
    image: "/john/WhatsApp Image 2026-02-20 at 06.47.23.jpeg",
    // title: "Empower Your Vote",
    // subtitle: "Your ballot is your power. Educate yourself and choose the leaders who represent you.",
  },
  {
    image: "/video-clips/hero-4.jpg",
    // title: "Lead with Vision",
    // subtitle: "Together, we can build a better society with policies that serve everyone.",
  },
  {
    image: "/video-clips/WhatsApp Image 2025-09-07 at 22.05.47_7db2f64f.jpg",
    // title: "Lead with Vision",
    // subtitle: "Together, we can build a better society with policies that serve everyone.",
  },
];

export default function CustomCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev:any) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev:any) => (prev - 1 + carouselItems.length) % carouselItems.length
    );
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[260px] md:h-screen bg-yellow-300 rounded-l-lg overflow-hidden">
      <div className="absolute inset-0">
        {carouselItems.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={item.image}
              alt={`Slide ${index + 1}`}
              className="object-contain md:object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-purple-900/50" />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-end p-6 text-white">
        {/* <h2 className="text-3xl font-bold mb-2">
          {carouselItems[currentSlide].title}
        </h2> */}
        {/* <p className="text-xl mb-8">{carouselItems[currentSlide].subtitle}</p> */}
        <div className="flex space-x-2 mb-4">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? "bg-white w-4" : "bg-white/50"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/75 hover:text-white transition-colors "
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/75 hover:text-white transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  );
}
