"use client"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3"
import { exclusiveBookingDataType } from "@/Types/UserDataType"
import { useAppContext } from "@/app/context/AppContext"
import React, { useState, useCallback, useEffect, SetStateAction } from "react"
import { getExclusiveTourPrice } from "@/lib/pricing"
// import CustomConnectButton from "./CustomConnectButton"
// import { useAccount } from "wagmi"
import toast from "react-hot-toast"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: (paidPrice: string) => void
  formData: exclusiveBookingDataType
  setShowCryptoPaymentModal: React.Dispatch<SetStateAction<boolean>>
  isNigeria: boolean
}

export default function PaymentModal({ isOpen, onClose, onPaymentSuccess, formData, isNigeria }: PaymentModalProps) {
  const { selectedTheme, price, setPrice } = useAppContext()
  const flutterwavePublicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_API_KEY
  const [showCurrencyBtns, setShowCurrencyBtns] = useState(false)
  const [paymentCurrency, setPaymentCurrency] = useState<"USD" | "NGN">("USD")
  const [isProcessing, setIsProcessing] = useState(false)
  const [nairaRate, setNairaRate] = useState(0)
  const { currency, price: computedPrice, discountApplied } = getExclusiveTourPrice(isNigeria, formData.discountCode)
  // const account = useAccount()






  // trying to fecth the current NGN Rate here
  useEffect(() => {
    fetch("/api/rates")
      .then((res) => res.json())
      .then((data) => {
        if (data.conversion_rates) {
          setNairaRate(data.conversion_rates.NGN);
        }
      });

  }, [])



  useEffect(() => {
    setPrice(computedPrice)
  }, [computedPrice, setPrice])







  if (!flutterwavePublicKey) {
    console.error("NEXT_PUBLIC_FLUTTERWAVE_API_KEY is not defined")
  }


  const config = {
    public_key: flutterwavePublicKey || "",
    tx_ref: `tx-${Date.now()}`,
    amount: !isNigeria && paymentCurrency === "NGN" ? nairaRate * price : isNigeria && paymentCurrency === "USD" ? (price / nairaRate) : price,
    currency: paymentCurrency,
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: formData.tourists[0].email,
      phone_number: "",
      name: formData.tourists[0].fullName,
    },
    customizations: {
      title: `THEME: ${selectedTheme}`,
      description: "Exclusive E-Rhythm Tour Booking",
      logo: "https://res.cloudinary.com/dwedz2laa/image/upload/v1752824400/logo_ajy1ca.png",
    },
  }



  const handleFlutterPayment = useFlutterwave(config)

  const handleFiatPayment = useCallback((currency: "USD" | "NGN") => {
    if (!flutterwavePublicKey) {
      console.error("Cannot process payment: Flutterwave API key not configured")
      return
    }

    setIsProcessing(true)
    setPaymentCurrency(currency)
  }, [flutterwavePublicKey])


  useEffect(() => {
    if (isProcessing && paymentCurrency) {
      handleFlutterPayment({
        callback: (response) => {
          setIsProcessing(false)
          if (response.status === "completed") {
            onPaymentSuccess(`${response.currency} ${response.amount}`)
            onClose()
          }
          closePaymentModal()
        },
        onClose: () => {
          setIsProcessing(false)
        }
      })
    }
  }, [isProcessing, paymentCurrency, handleFlutterPayment, onPaymentSuccess, onClose])



  {/* <Button
            type="button"
            disabled={!subscriptionType}
            onClick={() => {
              setShowCryptoPaymentModal(true)
              onClose()
            }}
            className="bg-[#EF8F57] hover:bg-[#EF8F57]/90 w-full basis-1/2 cursor-pointer font-merriweather"
            aria-label="Pay with Crypto"
          >
            Pay with Crypto
          </Button> */}


  // useEffect(() => {
  //   if (account.status === "connected" && price > 0) {
  //     setShowCryptoPaymentModal(true)
  //     onClose()
  //   }
  // }, [account, price])


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-6">
      <div className="bg-white rounded-lg p-6 w-full max-w-md flex flex-col items-start gap-1 relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-[#EF8F57]" />
              <p className="mt-3 text-gray-700">Processing payment...</p>
            </div>
          </div>
        )}

        <Button
          type="button"
          onClick={onClose}
          variant="destructive"
          size="icon"
          className="ml-auto cursor-pointer"
          aria-label="Close modal"
        >
          <X />
        </Button>
        <h2 className="text-xl font-bold mx-auto font-merriweather">Complete Your Payment</h2>
        <p className="mb-2 mx-auto font-lato">Please proceed to payment to confirm your booking.</p>

        <h3 className="text-sm text-[#EF8F57] font-bold font-merriweather">THEME: {selectedTheme}</h3>
        <h3 className="text-sm mb-1 text-[#EF8F57] font-bold font-merriweather">PRICE: {price < 1 ? "-" : price} {currency}</h3>
        {discountApplied && (
          <p className="text-xs text-green-600 font-lato">Discount code applied: 20% off</p>
        )}

        <div className="flex flex-col md:flex-row gap-3 w-full items-center justify-center mt-3">


          {/* <CustomConnectButton /> */}

          <Button
            type="button"
            onClick={() => toast("Crypto payment feature  coming soon!")}
            className="bg-[#EF8F57] hover:bg-[#EF8F57]/90 w-full basis-1/2 cursor-pointer font-merriweather"
            aria-label="Pay with Fiat"
          >
            Pay with Crypto
          </Button>






          <Button
            type="button"
            onClick={() => setShowCurrencyBtns((prev) => !prev)}
            className="bg-[#EF8F57] hover:bg-[#EF8F57]/90 w-full basis-1/2 cursor-pointer font-merriweather"
            aria-label="Pay with Fiat"
          >
            Pay with Cash
          </Button>
        </div>

        {showCurrencyBtns && (
          <div className="mx-auto flex flex-col gap-3 items-center mt-3 w-full font-merriweather ">
            <h3 className="font-medium">Select Currency:</h3>
            <div className="flex items-center gap-3 w-full">
              <Button
                onClick={() => handleFiatPayment("NGN")}
                className="cursor-pointer bg-white text-[#EF8F57] border border-[#EF8F57] hover:bg-[#EF8F57] hover:text-white flex-1"
              >
                NGN
              </Button>
              <Button
                onClick={() => handleFiatPayment("USD")}
                className="cursor-pointer bg-white text-[#EF8F57] border border-[#EF8F57] hover:bg-[#EF8F57] hover:text-white flex-1"
              >
                USD
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}