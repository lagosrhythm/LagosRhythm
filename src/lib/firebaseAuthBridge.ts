import { onAuthStateChanged, signInWithCustomToken, signOut, User } from "firebase/auth"
import { auth } from "@/app/config/firebaseClient"

// Signs the visitor in to Firebase Auth using their Clerk session.
export async function syncFirebaseAuth(): Promise<void> {
  const res = await fetch("/api/firebase-token", { method: "POST" })
  if (!res.ok) throw new Error(`firebase-token failed with ${res.status}`)
  const { token } = (await res.json()) as { token: string }
  await signInWithCustomToken(auth, token)
}

export async function clearFirebaseAuth(): Promise<void> {
  if (auth.currentUser) await signOut(auth)
}

// Resolves once Firebase Auth has a signed-in user (or null after the timeout).
export function waitForFirebaseUser(timeoutMs = 10000): Promise<User | null> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser)

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      unsubscribe()
      resolve(null)
    }, timeoutMs)

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        clearTimeout(timer)
        unsubscribe()
        resolve(user)
      }
    })
  })
}
