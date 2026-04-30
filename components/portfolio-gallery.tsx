// "use client"

// import Image from "next/image"
// import { useState, useEffect } from "react"

// export interface PortfolioImage {
//   id: string
//   src: string
//   alt: string
//   title?: string
//   category?: "campaign" | "community" | "event" | "speech" | "charity"
//   date?: string
//   description?: string
// }

// const PORTFOLIO_IMAGES: PortfolioImage[] = [
//   {
//     id: "1",
//     src: "/portfolio/WhatsApp Image 2025-11-23 at 11.58.07.jpeg",
//     alt: "Campaign rally",
//   },
//   {
//     id: "2",
//     src: "/portfolio/WhatsApp Image 2025-11-23 at 11.58.08 (2).jpeg",
//     alt: "Speaking engagement",
//   },
//   {
//     id: "3",
//     src: "/pics/WhatsApp Image 2025-12-30 at 06.55.18 (1).jpeg",
//     alt: "Community engagement",
//   },
//   {
//     id: "5",
//     src: "/pics/WhatsApp Image 2025-12-30 at 06.55.14.jpeg",
//     alt: "Campaign speech",
//   },
//   {
//     id: "6",
//     src: "/pics/WhatsApp Image 2025-12-28 at 18.15.13 (1).jpeg",
//     alt: "Campaign speech",
//   },
//   {
//     id: "7",
//     src: "/pics/WhatsApp Image 2025-12-30 at 06.55.19 (1).jpeg",
//     alt: "Campaign speech",
//   },
//   {
//     id: "8",
//     src: "/pics/WhatsApp Image 2025-12-30 at 06.55.19.jpeg",
//     alt: "Campaign speech",
//   },
//   {
//     id: "9",
//     src: "/pics/WhatsApp Image 2025-12-30 at 06.55.24.jpeg",
//     alt: "Campaign speech",
//   },
//   {
//     id: "10",
//     src: "/pics/WhatsApp Image 2025-12-30 at 06.55.26.jpeg",
//     alt: "Campaign speech",
//   },
//   {
//     id: "11",
//     src: "/pics/WhatsApp Image 2025-12-30 at 06.55.27 (1).jpeg",
//     alt: "Campaign speech",
//   },
//   {
//     id: "12",
//     src: "/pics/WhatsApp Image 2025-12-30 at 06.55.27.jpeg",
//     alt: "Campaign speech",
//   },
//   {
//     id: "13",
//     src: "/pics/WhatsApp Image 2025-12-30 at 06.55.28.jpeg",
//     alt: "Campaign speech",
//   },
//   {
//     id: "14",
//     src: "/pics/WhatsApp Image 2025-12-30 at 13.03.04.jpeg",
//     alt: "Campaign speech",
//   },
//   {
//     id: "15",
//     src: "/WhatsApp Unknown 2026-01-02 at 08.05.53/WhatsApp Image 2025-12-30 at 13.03.04.jpeg",
//     alt: "Campaign speech",
//   },
//   {
//     id: "16",
//     src: "/WhatsApp Unknown 2026-01-02 at 08.05.53/WhatsApp Image 2025-12-30 at 13.03.05 (1).jpeg",
//     alt: "Campaign speech",
//   },
//   {
//     id: "17",
//     src: "/WhatsApp Unknown 2026-01-02 at 08.05.53/WhatsApp Image 2025-12-30 at 13.03.05.jpeg",
//     alt: "Campaign speech",
//   },
//   {
//     id: "18",
//     src: "/WhatsApp Unknown 2026-01-02 at 08.05.53/WhatsApp Image 2025-12-30 at 13.03.06.jpeg",
//     alt: "Campaign speech",
//   },
  
// ]

// export function PortfolioGallery() {
//   const [shuffledImages, setShuffledImages] = useState<PortfolioImage[]>([])

//   useEffect(() => {
//     const shuffled = [...PORTFOLIO_IMAGES].sort(() => Math.random() - 0.5)
//     setShuffledImages(shuffled)
//   }, [])

//   return (
//     <div className="w-full max-w-7xl mx-auto px-4 py-16">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {shuffledImages.map((image) => (
//           <div
//             key={image.id}
//             className="overflow-hidden rounded-lg bg-muted aspect-square hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
//           >
//             <Image
//               src={image.src || "/placeholder.svg"}
//               alt={image.alt}
//               width={400}
//               height={120}
//               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }






"use client"

import Image from "next/image"

export interface PortfolioImage {
  id: string
  src: string
  alt: string
  title?: string
  category?: "campaign" | "community" | "event" | "speech" | "charity"
  date?: string
  description?: string
}

const PORTFOLIO_IMAGES: PortfolioImage[] = [
  {
    id: "1",
    src: "/portfolio/WhatsApp Image 2025-11-23 at 11.58.07.jpeg",
    alt: "Campaign rally",
  },
  {
    id: "2",
    src: "/portfolio/WhatsApp Image 2025-11-23 at 11.58.08 (2).jpeg",
    alt: "Speaking engagement",
  },
  {
    id: "3",
    src: "/pics/WhatsApp Image 2025-12-30 at 06.55.18 (1).jpeg",
    alt: "Community engagement",
  },
  {
    id: "5",
    src: "/pics/WhatsApp Image 2025-12-30 at 06.55.14.jpeg",
    alt: "Campaign speech",
  },
  {
    id: "6",
    src: "/pics/WhatsApp Image 2025-12-28 at 18.15.13 (1).jpeg",
    alt: "Campaign speech",
  },
  {
    id: "7",
    src: "/pics/WhatsApp Image 2025-12-30 at 06.55.19 (1).jpeg",
    alt: "Campaign speech",
  },
  {
    id: "8",
    src: "/pics/WhatsApp Image 2025-12-30 at 06.55.19.jpeg",
    alt: "Campaign speech",
  },
  {
    id: "9",
    src: "/pics/WhatsApp Image 2025-12-30 at 06.55.24.jpeg",
    alt: "Campaign speech",
  },
  {
    id: "10",
    src: "/pics/WhatsApp Image 2025-12-30 at 06.55.26.jpeg",
    alt: "Campaign speech",
  },
  {
    id: "11",
    src: "/pics/WhatsApp Image 2025-12-30 at 06.55.27 (1).jpeg",
    alt: "Campaign speech",
  },
  {
    id: "12",
    src: "/pics/WhatsApp Image 2025-12-30 at 06.55.27.jpeg",
    alt: "Campaign speech",
  },
  {
    id: "13",
    src: "/pics/WhatsApp Image 2025-12-30 at 06.55.28.jpeg",
    alt: "Campaign speech",
  },
  // {
  //   id: "14",
  //   src: "/pics/WhatsApp Image 2025-12-30 at 13.03.04.jpeg",
  //   alt: "Campaign speech",
  // },
  // {
  //   id: "15",
  //   src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.16.jpeg",
  //   alt: "Campaign speech",
  // },
  {
    id: "16",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.17 (1).jpeg",
    alt: "Campaign speech",
  },
  {
    id: "17",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.17 (2).jpeg",
    alt: "Campaign speech",
  },
  // {
  //   id: "18",
  //   src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.18 (1).jpeg",
  //   alt: "Campaign speech",
  // },
  {
    id: "19",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.18.jpeg",
    alt: "Campaign speech",
  },
  {
    id: "20",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.19 (2).jpeg",
    alt: "Campaign speech",
  },
  // {
  //   id: "21",
  //   src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.19.jpeg",
  //   alt: "Campaign speech",
  // },
  // {
  //   id: "22",
  //   src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.21 (1).jpeg",
  //   alt: "Campaign speech",
  // },
  {
    id: "23",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.21 (2).jpeg",
    alt: "Campaign speech",
  },
  {
    id: "24",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.21.jpeg",
    alt: "Campaign speech",
  },
  {
    id: "25",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.22 (1).jpeg",
    alt: "Campaign speech",
  },
  {
    id: "26",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.22.jpeg",
    alt: "Campaign speech",
  },
  {
    id: "27",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.23 (2).jpeg",
    alt: "Campaign speech",
  },
  {
    id: "28",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.23.jpeg",
    alt: "Campaign speech",
  },
  {
    id: "29",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.24 (1).jpeg",
    alt: "Campaign speech",
  },
  {
    id: "30",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.21.jpeg",
    alt: "Campaign speech",
  },
  {
    id: "31",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.27.jpeg",
    alt: "Campaign speech",
  },
  {
    id: "32",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.28 (1).jpeg",
    alt: "Campaign speech",
  },
  {
    id: "33",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.28.jpeg",
    alt: "Campaign speech",
  },
  {
    id: "34",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.29 (1).jpeg",
    alt: "Campaign speech",
  },
  {
    id: "35",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.30.jpeg",
    alt: "Campaign speech",
  },
  {
    id: "36",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.31 (1).jpeg",
    alt: "Campaign speech",
  },
  {
    id: "37",
    src: "/campaign/WhatsApp Image 2026-01-29 at 13.02.31.jpeg",
    alt: "Campaign speech",
  },
]

export function PortfolioGallery() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PORTFOLIO_IMAGES.map((image) => (
          <div
            key={image.id}
            className="overflow-hidden rounded-lg bg-muted aspect-square hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
          >
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              width={400}
              height={400}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
