"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { clearFirebaseAuth, syncFirebaseAuth } from "@/lib/firebaseAuthBridge"

// Keeps the Firebase Auth session in step with the Clerk session.
export default function FirebaseAuthBridge() {
  const { isLoaded, isSignedIn, user } = useUser()

  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn) {
      syncFirebaseAuth().catch((err) => console.error("Firebase sign-in failed:", err))
    } else {
      clearFirebaseAuth().catch((err) => console.error("Firebase sign-out failed:", err))
    }
  }, [isLoaded, isSignedIn, user?.id])

  return null
}
