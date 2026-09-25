"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function AwardPopup() {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show on every page load per requirement
    setOpen(true);
  }, []);

  const handleClose = () => setOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      toast.success("Welcome to the community! Thanks for subscribing.");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border"
          >
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 rounded-full p-1 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-muted-foreground transition-colors hover:text-orange-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-bold font-sans text-black dark:text-white">Welcome To Lagos Rhythm</h2>
              <p className="mt-2 text-sm font-semibold text-orange-600">2x Award Winner</p>
              <p className="text-sm text-muted-foreground">African Excellence Awards 2026</p>
              <p className="mt-4 text-lg font-medium text-foreground">The Experience is what matters</p>

{!showForm ? (
                 <div className="mt-6">
                   <Button onClick={() => setShowForm(true)} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                     Join Our community
                   </Button>
                 </div>
               ) : (
                 <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-left">
<Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                   <Input
                     type="email"
                     placeholder="Enter your email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                   />
                   <div className="flex gap-2">
                     <Button type="submit" disabled={loading} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
                       {loading ? "Subscribing..." : "Subscribe"}
                     </Button>
                     <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                       Back
                     </Button>
                   </div>
                 </form>
               )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
