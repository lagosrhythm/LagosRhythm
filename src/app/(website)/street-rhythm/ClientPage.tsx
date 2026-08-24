"use client"

import { useAppContext } from "@/app/context/AppContext"
import EssentialKnowledge from "@/components/street-rhythm-2-components/EssentialKnowledge"
import HeroSection from "@/components/street-rhythm-2-components/HeroSection"
import HowItWorks from "@/components/street-rhythm-2-components/HowItWorks"
import ReadyToNavigate from "@/components/street-rhythm-2-components/ReadyToNavigate"
import RouteDetails from "@/components/street-rhythm-2-components/RouteDetails"
import WhyStreetRhythm from "@/components/street-rhythm-2-components/WhyStreetRhythm"
import RouteCommunityChat from "@/components/street-rhythm-2-components/RouteCommunityChat"
import StreetRhythmVideoSchema from "@/components/seo/StreetRhythmVideoSchema"

export default function Page() {
  const { results, hasSearched, selectedRoute, from, to, videoResults } = useAppContext()
  const hasResults = Boolean(results?.length)

  return (
    <div className="font-merienda">

      <StreetRhythmVideoSchema
        videos={videoResults}
        routeKey={selectedRoute?.routeKey}
      />

      <HeroSection />

      {/* If results exist */}
      {hasResults && (
        <>
          <RouteDetails />
          <section className="w-full py-16 px-[5%] max-w-7xl mx-auto">
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-[#05073C]">Community Chat</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Real-time commuter updates from people currently using this route.
                </p>
              </div>
              <RouteCommunityChat routeKey={selectedRoute?.routeKey} from={from} to={to} />
            </div>
          </section>
        </>
      )}

      {/* If searched but no results */}
      {hasSearched && !hasResults && (
        <section id="no-route-found" className="w-full py-24 px-[5%] max-w-7xl mx-auto flex flex-col items-center text-center scroll-mt-24">
            <div className="w-full max-w-3xl bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-12 shadow-sm">
            <div className="text-5xl mb-4">🚫</div>
            <h3 className="text-2xl font-bold mb-3">No Route Found</h3>
            <p className="text-gray-600 text-sm">
              We couldn’t find a route matching your selection.
              Please try different locations.
            </p>
          </div>
        </section>
      )}

      <EssentialKnowledge />
      <HowItWorks />
      <WhyStreetRhythm />
      <ReadyToNavigate />

    </div>
  )
}
