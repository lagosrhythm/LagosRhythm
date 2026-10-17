import React, { SetStateAction, useEffect, useState } from "react";
import Button from "./common/Button";
import Input from "./common/Input";
import { X } from "lucide-react";


interface CurrencyConverterProps {
    setHidePrices: React.Dispatch<SetStateAction<boolean>>
}


export default function CurrencyConverter({ setHidePrices }: CurrencyConverterProps) {
    const [amount, setAmount] = useState<number>(1)
    const [fromCurrency, setFromCurrency] = useState<string>("USD")
    const [toCurrency, setToCurrency] = useState<string>("NGN")
    const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
    const [currencies, setCurrencies] = useState<string[]>([])
    const [rates, setRates] = useState<Record<string, number>>({})
    const [showConversionModal, setshowConversionModal] = useState(false)




    useEffect(() => {
        fetch("/api/rates")
            .then((res) => res.json())
            .then((data) => {
                if (data.conversion_rates) {
                    setRates(data.conversion_rates);
                    setCurrencies(Object.keys(data.conversion_rates));
                }
            })
            .catch((err) => console.error("Error loading exchange rates:", err));

    }, [])


    const convertCurrency = () => {
        if (fromCurrency === toCurrency) {
            setConvertedAmount(amount)
            return;
        }

        // rates from /api/rates are USD based, so cross rates are a simple ratio
        const fromRate = rates[fromCurrency]
        const toRate = rates[toCurrency]
        if (!fromRate || !toRate) return

        setConvertedAmount((amount / fromRate) * toRate)
    }




    if (!showConversionModal)
        return (<button
            onClick={() => {
                setshowConversionModal(true)
                setHidePrices(true)
            }}
            className=" bg-[#EF8F57] text-white p-2 rounded-md w-fit ml-auto cursor-pointer flex items-center justify-center " >Convert currency</button>)



    else
        return (
            <div className="mx-auto max-w-md h-fit py-6 px-5 rounded-xl flex flex-col items-center gap-5 bg-[#ffffff] text-black shadow-2xl " >

                <button onClick={() => setshowConversionModal(false)} className="text-red-600 ml-auto cursor-pointer " ><X size={20} /></button>

                <h1 className="text-[#EF8F57] font-semibold font-merriweather text-xl " >Currency Converter</h1>

                <Input
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    type="number"
                    className="  mx-auto flex items-center justify-center p-1 w-fit border-2 border-black   "
                />


                <div className=" w-full flex items-center justify-between gap-5 " >



                    <select
                        value={fromCurrency}
                        onChange={(e) => setFromCurrency(e.target.value)}
                    >
                        <option value="USD">USD</option>
                    </select>


                    <select
                        value={toCurrency}
                        onChange={(e) => setToCurrency(e.target.value)}
                    >
                        {currencies.map((currency) => (
                            <option key={currency} value={currency}  > {currency} </option>
                        ))}
                    </select>
                </div>








                <Button
                    ariaLabel="Convert"
                    label="Convert"
                    type="button"
                    variant="primary"
                    onClick={convertCurrency}
                    className=" !bg-[#EF8F57] w-full " />



                {convertedAmount !== null && (
                    <h3>
                        {amount} {fromCurrency} = {convertedAmount.toFixed(2)} {toCurrency}
                    </h3>
                )}

            </div>
        )
}
