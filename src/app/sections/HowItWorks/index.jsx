import React from "react";
import Image from "next/image";
import works from "@/app/asset/svg/works.svg";
import worksImg from "@/app/asset/svg/works2.svg";
import vector from "@/app/asset/svg/workVector.svg";

const HowItWorks = () => {
  const steps = [
    {
      title: "STEP 1",
      heading: "Send Bot to Your Meeting",
      description:
        "Simply provide your Google Meet link and our AI bot joins automatically. No downloads, no setup – just send the meeting URL and we handle the rest.",
    },
    {
      title: "STEP 2",
      heading: "Real-Time Transcription",
      description:
        "Watch as AI transcribes everything in real-time with speaker identification. Supports 99+ languages with instant translation capabilities.",
    },
    {
      title: "STEP 3",
      heading: "Get Actionable Notes",
      description:
        "Receive structured meeting notes, action items, and key insights automatically. Access via API or dashboard – your meeting data, your way.",
    },
  ];

  return (
    <section className="container mx-auto flex flex-col items-center md:py-10" id="HowItWorks">
     
      <div className="flex items-center w-full justify-center mb-8">
      <div className=" flex items-center">
        <div className="h-[1px] w-[50px] md:w-[198px] bg-white opacity-50"></div>
        <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <h2 className="mx-4 text-center">Here is how it works</h2>
        <div className=" flex items-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        <div className="h-[1px] w-[50px] md:w-[198px] bg-white opacity-50"></div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-16 justify-center lg:justify-between">
        

        <div className="flex flex-col items-center mx-2 px-6 lg:px-0">
          <Image src={worksImg} alt="How it works visual" width={455} height={100} className="hidden xl:block w-[90%] lg:w-full"/>
        </div>
        <div className="flex items-center justify-center hidden lg:block lg:pt-8">
          <Image src={vector} alt="Vector illustration" />
        </div>

        <div className="flex flex-col gap-6 lg:gap-16 justify-between">
          {steps.map((step, index) => (
            <div key={index} className="px-6 md:px-6">
              <h3 className="text-[12px] font-medium text-[#888888]">{step.title}</h3>
              <h4 className="text-[22px] lg:text-[38px] font-medium">{step.heading}</h4>
              <p className="text-[#888888] text-[20px] lg:w-[482px] mt-6">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
