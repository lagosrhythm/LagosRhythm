"use client";

import { useAppContext } from "@/app/context/AppContext";
import StepFour from "@/components/inperson_tour_form_steps/StepFour";
import { StepOne } from "@/components/inperson_tour_form_steps/StepOne";
import { StepThree } from "@/components/inperson_tour_form_steps/StepThree";
import { StepTwo } from "@/components/inperson_tour_form_steps/StepTwo";
import { themeJourneys } from "@/data/data";
import { inpersonFormUserData } from "@/Types/inpersonFormDataType";
import { ThemeJourneyType } from "@/Types/ThemeJourneyType";
import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";

export default function Page() {
    const { inpersonTourPackage, selectedInpersonTheme } = useAppContext();
    const [packageDetails, setPackageDetails] = useState<ThemeJourneyType | null>(null)

    const [formValues, setFormValues] = useState<inpersonFormUserData>({
        fullName: "",
        emailAddress: "",
        country: "",
        arrivalDate: null,
        discountCode: "",
        howDidYouHear: "",
        isAdult: "",
        joiningAs: "",
        otherMessage: "",
        paymentType: "",
        phoneNumber: "",
        preferredFood: "",
        otherPreferredFood: "",
        reasonForTour: "",
        otherReasonForTour: "",
        fitForTravel: "",
        specialRequest: "",
        price: null,
        duration: ""
    });


    const [currentStep, setCurrentStep] = useState<"StepOne" | "StepTwo" | "StepThree" | "StepFour">("StepOne");


    const setStepOne = () => {
        setCurrentStep("StepOne")
    }

    const setStepTwo = () => {
        setCurrentStep("StepTwo")
    }


    const setStepThree = () => {
        setCurrentStep("StepThree")
    }

    const setStepFour = () => {
        setCurrentStep("StepFour")
    }





    // retrieving the tour package details
    useEffect(() => {
        const details = themeJourneys.find((packageDetail) => packageDetail.title === selectedInpersonTheme)
        if (details) {
            setPackageDetails(details)
        }
    }, [selectedInpersonTheme])


    //Persist values to localStorage whenever formValues change
    useEffect(() => {
        const hasValue = Object.values(formValues).some(
            (v) => typeof v === "string" && v.trim() !== ""
        );

        if (hasValue) {
            localStorage.setItem("form_details", JSON.stringify(formValues));
        }
    }, [formValues]);



    // Retrieve from localStorage on first load
    useEffect(() => {
        const saved = localStorage.getItem("form_details");
        if (!saved) return;

        const parsed = JSON.parse(saved);

        // Restore all fields + fix Date type
        setFormValues({
            ...parsed,
        });
    }, []);



    useEffect(() => {
        const selectedThemeTest = themeJourneys.find(t => t.title === selectedInpersonTheme);

        if (!selectedThemeTest) return;

        const group = selectedThemeTest.minorPackages?.find(p => p.title === inpersonTourPackage) || selectedThemeTest.majorPackages?.find(p => p.title === inpersonTourPackage);
        const option = group?.options.find(o => o.duration === formValues.duration);

        setFormValues((prev) => ({
            ...prev,
            price: option?.price && prev.paymentType === "Deposit (50%)" ? option?.price / 2 : option?.price ?? 0
        }))
    }, [formValues.duration, formValues.paymentType, selectedInpersonTheme, inpersonTourPackage]);



    const saveToDatabase = async (transactionId: string) => {
        try {
            const res = await fetch("/api/inperson-booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    transactionId,
                    form: formValues,
                    theme: selectedInpersonTheme,
                    packageTitle: inpersonTourPackage,
                }),
            });

            if (!res.ok) {
                const { error } = await res.json().catch(() => ({ error: "" }));
                throw new Error(error || "Booking could not be saved");
            }

            setFormValues({
                fullName: "",
                emailAddress: "",
                country: "",
                arrivalDate: null,
                discountCode: "",
                howDidYouHear: "",
                isAdult: "",
                joiningAs: "",
                otherMessage: "",
                paymentType: "",
                phoneNumber: "",
                preferredFood: "",
                otherPreferredFood: "",
                reasonForTour: "",
                otherReasonForTour: "",
                fitForTravel: "",
                specialRequest: "",
                price: null,
                duration: ""
            });

            localStorage.removeItem("form_details");
            toast.success("Form Submitted Successfully!");

            return true;
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Booking could not be saved. Please contact support.");
            return false;
        }
    };




    const renderStep = () => {
        switch (currentStep) {
            case "StepOne":
                return <StepOne formValues={formValues} setFormValues={setFormValues} setStepTwo={setStepTwo} />;

            case "StepTwo":
                return <StepTwo formValues={formValues} setFormValues={setFormValues} setStepOne={setStepOne} setStepThree={setStepThree} />;

            case "StepThree":
                return <StepThree formValues={formValues} setFormValues={setFormValues} setStepTwo={setStepTwo} setStepFour={setStepFour} />;

            case "StepFour":
                return <StepFour formValues={formValues} setFormValues={setFormValues} packageDetails={packageDetails} setStepThree={setStepThree} onSuccessfulPayment={saveToDatabase} />;

            default:
                return <StepOne formValues={formValues} setFormValues={setFormValues} setStepTwo={setStepTwo} />;
        }
    };


    return (
        <div
            className="w-full h-full text-black flex items-center justify-center bg-cover bg-center bg-no-repeat relative font-merienda py-32 px-[4%] "
            style={{ backgroundImage: "url('/in-person/inperson-form-bg.jpg')" }}
        >
            <div className="inset-0 bg-black/55 absolute h-full w-full" />

            <form className="w-full h-full flex items-center justify-center z-10">
                {renderStep()}
            </form>
        </div>
    );
}
