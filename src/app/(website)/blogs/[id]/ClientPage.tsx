"use client"

import { useAppContext } from "@/app/context/AppContext"
import ReusableHero from "@/components/ReusableHero"
import { BlogDataType } from "@/Types/blogTypes"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import DOMPurify from "dompurify"
import JsonLd from "@/components/seo/JsonLd"

export default function Page() {
  const { id } = useParams()
  const { blogs } = useAppContext()
  const [currentBlog, setCurrentBlog] = useState<BlogDataType | null>(null)

  useEffect(() => {
    if (blogs && id && blogs.length > 0) {
      const blog = blogs.find((b) => b.id === id)
      setCurrentBlog(blog || null)
    }
  }, [id, blogs])



  // Blog bodies are rich text from the editor; strip scripts/handlers before rendering
  const safeHtml = useMemo(
    () => (currentBlog ? DOMPurify.sanitize(currentBlog.text, { USE_PROFILES: { html: true } }) : ""),
    [currentBlog],
  )

  if (!currentBlog)
    return (
      <div className="text-black" >
        Blog not found
      </div>
    )
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": currentBlog.title,
    "author": {
      "@type": "Person",
      "name": currentBlog.author || "Lagos Rhythm"
    },
    "datePublished": currentBlog.addedAt,
    "publisher": {
      "@type": "Organization",
      "name": "Lagos Rhythm",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.lagosrhythm.com/logos/logo.png"
      }
    },
    "image": currentBlog.image,
    "url": `https://www.lagosrhythm.com/blogs/${currentBlog.id}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.lagosrhythm.com/blogs/${currentBlog.id}`
    }
  }

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <ReusableHero image={currentBlog.image} pageTitle={currentBlog.title} />
      <div className="w-full  text-[#05073C] bg-[#FDF4F1] px-[6%] py-[4%] flex items-start flex-col gap-3 relative  " >
        <h3 className="text-2xl font-bold  font-merriweather " > {currentBlog.title}</h3>
        <div className="font-lato text-justify text-lg font-medium" dangerouslySetInnerHTML={{ __html: safeHtml }} />



      </div>

    </>
  )


}
