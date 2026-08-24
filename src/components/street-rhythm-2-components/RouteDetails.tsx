"use client"

import { useAppContext } from "@/app/context/AppContext"
import { useState } from "react"
import VideoTab from "../direction-feature-components/VideoTab"
import TextTab from "../direction-feature-components/TextTab"
import RecordingTab from "../direction-feature-components/RecordingTab"
import ImageTab from "../direction-feature-components/Imagetab"
import AIDirectionTab from "../direction-feature-components/AI_Direction"
import RouteTrafficCard from "./RouteTrafficCard"
import RouteMapTraffic from "./RouteMapTraffic"
import RouteArrivalNotifications from "./RouteArrivalNotifications"

export default function RouteDetails() {
    const {
        selectedRoute,
        from,
        to,
        videoResults,
        textResults,
        soundResults,
        imageResults,
        AIResults
    } = useAppContext()

    const routeResources = selectedRoute?.resources ?? []
    const routeTags = (selectedRoute?.tags ?? []).filter((tag) => {
        const t = tag.toLowerCase()
        return t !== "bus" && t !== "bike"
    })
    const languages = selectedRoute?.languages ?? []

    const sections = [
        {
            id: "overview",
            label: "Overview",
            content: <TextTab data={textResults} />
        },
        {
            id: "landmarks",
            label: "Landmarks",
            content: <ImageTab data={imageResults} />
        },
        {
            id: "watch-route",
            label: "Watch Route",
            content: <VideoTab data={videoResults} fromStop={from} toStop={to} />
        },
        {
            id: "audio-guide",
            label: "Audio Guide",
            content: <RecordingTab data={soundResults} />
        }
    ]

    const [activeTab, setActiveTab] = useState<string>("overview")

    return (
        <section id="route" className="w-full py-24 px-[5%] max-w-7xl mx-auto flex flex-col items-center gap-16 text-black">
            <div className="flex flex-col items-center gap-3 text-center">
                <h4 className="text-[#D4422C] font-bold text-sm uppercase tracking-wider">
                    Route Details
                </h4>
                <h2 className="text-2xl md:text-4xl font-black">
                    {from} to {to}
                </h2>
            </div>

            <div className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 md:p-8 text-white">
                    <div className="mb-6">
                        <span className="block text-2xl md:text-3xl font-black">
                            {from}
                        </span>
                        <span className="block text-yellow-400 text-xl my-1">-&gt;</span>
                        <span className="block text-2xl md:text-3xl font-black">
                            {to}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="rounded-xl bg-white/10 p-4">
                            <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Route Key</p>
                            <p className="font-semibold">{selectedRoute?.routeKey ?? "Pending route key"}</p>
                        </div>
                        <div className="rounded-xl bg-white/10 p-4">
                            <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Languages</p>
                            <p className="font-semibold">
                                {languages.length > 0 ? languages.join(", ") : "Not yet defined"}
                            </p>
                        </div>
                        <div className="rounded-xl bg-white/10 p-4">
                            <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Assets</p>
                            <p className="font-semibold">
                                {routeResources.length} resource{routeResources.length === 1 ? "" : "s"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-12">
                    <div className="rounded-2xl border border-gray-200 bg-[#F8FAFC] p-5 md:p-6">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-xl font-black text-[#05073C]">Route Snapshot</h3>
                            </div>

                            {routeTags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {routeTags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-semibold text-[#05073C]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveTab(section.id)}
                                        className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${activeTab === section.id ? 'bg-[#05073C] text-white border-[#05073C]' : 'text-[#05073C] border-[#05073C] hover:bg-[#05073C] hover:text-white'}`}
                                    >
                                        {section.label}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setActiveTab('route-map')}
                                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'route-map' ? 'bg-[#05073C] text-white border-[#05073C]' : 'text-[#05073C] border-[#05073C] hover:bg-[#05073C] hover:text-white'}`}
                                >
                                    Route Map
                                </button>

                                <button
                                    onClick={() => setActiveTab('arrival-notifications')}
                                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'arrival-notifications' ? 'bg-[#05073C] text-white border-[#05073C]' : 'text-[#05073C] border-[#05073C] hover:bg-[#05073C] hover:text-white'}`}
                                >
                                    Arrival Alerts
                                </button>

                                {AIResults && AIResults.length > 0 && (
                                    <button
                                        onClick={() => setActiveTab('ai-direction')}
                                        className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'ai-direction' ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                                    >
                                        AI Direction
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Render only the active section */}
                    {sections.map((section) => (
                        activeTab === section.id ? (
                            <section key={section.id} id={section.id} className="border-t pt-10">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-black text-[#05073C]">{section.label}</h3>
                                </div>
                                {section.content}
                            </section>
                        ) : null
                    ))}

                    {/* Route Map */}
                    {activeTab === 'route-map' && (
                        <section id="route-map" className="border-t pt-10">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-[#05073C]">Traffic & Travel Time</h3>
                                <p className="text-sm text-gray-600 mt-2">
                                    Live estimate comparing normal route duration and current traffic duration.
                                </p>
                            </div>
                            <RouteTrafficCard from={from} to={to} />

                            <div className="mb-6 mt-10">
                                <h3 className="text-2xl font-black text-[#05073C]">Google Maps & Traffic Layer</h3>
                                <p className="text-sm text-gray-600 mt-2">
                                    Route path with live road conditions rendered directly on Google Maps.
                                </p>
                            </div>
                            <RouteMapTraffic from={from} to={to} />
                        </section>
                    )}

                    {/* Arrival Notifications */}
                    {activeTab === 'arrival-notifications' && (
                        <section id="arrival-notifications" className="border-t pt-10">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-[#05073C]">Arrival Notifications</h3>
                                <p className="text-sm text-gray-600 mt-2">
                                    Browser alerts at 5 km, 1 km, and 500 m from destination.
                                </p>
                            </div>
                            <RouteArrivalNotifications destination={to} />
                        </section>
                    )}

                    {activeTab === 'ai-direction' && AIResults && AIResults.length > 0 && (
                        <section id="ai-direction" className="border-t pt-10">
                            <div className="mb-6">
                                <h3 className="text-2xl font-black text-[#05073C]">AI Direction</h3>
                                <p className="text-sm text-gray-600 mt-2">
                                    Additional route intelligence generated from the same route resource set.
                                </p>
                            </div>
                            <AIDirectionTab data={AIResults} />
                        </section>
                    )}
                </div>
            </div>
        </section>
    )
}
