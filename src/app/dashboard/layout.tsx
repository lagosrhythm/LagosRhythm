"use client"

import Button from "@/components/common/Button";
import Loader from "@/components/common/Loader";
import Header from "@/components/dashboard/Header";
import SideNav from "@/components/dashboard/SideNav";
import { useMobile } from "@/hooks/use-mobile";
import { isAdminEmail } from "@/lib/admin";

import { useUser } from "@clerk/nextjs"
import Link from "next/link";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { waitForFirebaseUser } from "@/lib/firebaseAuthBridge"




export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading: mobileLoading, isMobile } = useMobile()
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const isAdmin = isAdminEmail(user?.primaryEmailAddress?.emailAddress)
  const [firebaseReady, setFirebaseReady] = useState(false)


  useEffect(() => {
    if (!isLoaded) return

    if (!isAdmin) {
      router.replace("/")
    }
  }, [isLoaded, isAdmin, router])

  // Firestore rules need the Firebase session (admin claim) before any dashboard query runs
  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    waitForFirebaseUser().then(() => {
      if (!cancelled) setFirebaseReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [isAdmin])


  // Never render dashboard UI until we know the visitor is an admin
  if (mobileLoading || !isLoaded || !isAdmin || !firebaseReady) {
    return (
      <div className="flex h-screen items-center justify-center w-full">
        <Loader />
      </div>
    )
  }



  if (isMobile) {
    return (
      <div className="flex h-screen items-center justify-center w-full flex-col gap-4 p-4 ">
        <h1 className="text-2xl text-[#EF8F57] font-bold font-merriweather">Mobile view is not supported.</h1>
        <p className="text-sm text-[#1e1e1e]  font-lato ">Please switch to a desktop for better experience</p>
        <div className="w-fit flex items-center gap-5" >
          <Button onClick={router.back} label="Go back" ariaLabel="go back" type="button" className="!bg-[#EF8F57] " variant="primary" />
          <Link href={"/"}><Button label="Home" ariaLabel="Home" type="button" className="!bg-[#EF8F57] " variant="primary" /></Link>
        </div>
      </div>
    );
  }




  return (
    <div className=" bg-[#FAFBFC] w-full h-full relative flex items-start text-black " >
      <SideNav />
      <main className="h-screen overflow-y-auto  w-full relative flex flex-col items-start  " >
        <Header />
        <div className="w-full h-fit" >
          {children}
        </div>
      </main>
    </div>
  );
}
