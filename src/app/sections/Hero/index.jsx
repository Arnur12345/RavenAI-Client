'use client';

import React from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import Image from "next/image";
import icon from "@/app/asset/svg/heroicon.svg";
import leftIcon from "@/app/asset/svg/icon.svg";
import wave from "@/app/asset/svg/herowave.svg";
import leftWave from "@/app/asset/svg/wave.svg";
import vector from "@/app/asset/svg/vector.svg";

const Hero = () => {
  const router = useRouter();

  const handleLetRavenCook = () => {
    router.push('/auth');
  };

  return (
    <section className="hero container mx-auto relative flex flex-col items-center text-center w-full lg:mb-8 px-4">
      {/* soft radial glow background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(120,120,120,0.20),rgba(0,0,0,0)_60%)] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="absolute top-[4rem] left-[-10rem] justify-between hidden lg:block">
          <Image src={icon} alt="icon" className="opacity-30" />
        </div>
        <div className="absolute top-[4rem] right-[-10rem] justify-between hidden lg:block">
          <Image src={leftIcon} alt="icon" className="opacity-30" />
        </div>

        {/* eyebrow */}
        <p className="mt-10 mb-4 text-[12px] tracking-[0.2em] text-zinc-400 uppercase">
          • New Gen Meeting Notetaker
        </p>

        <h1 className="text-[44px] md:text-[64px] lg:text-[72px] font-medium tracking-tight text-zinc-200 pt-2 lg:pt-0 leading-[1.1]">
          Transform your meetings into{" "}
          <span className="font-[400] italic font-[family-name:var(--font-eb-garamond)] text-zinc-100">
            actionable tasks
          </span>
        </h1>

        <div className="absolute bottom-[5rem] left-[-1rem] justify-between hidden lg:block">
          <Image src={wave} alt="icon" className="opacity-40" />
        </div>
        <div className="absolute bottom-[4rem] right-[-1rem] justify-between hidden lg:block">
          <Image src={leftWave} alt="icon" className="opacity-40" />
        </div>

        <p className="text-[18px] md:text-xl mb-8 text-zinc-400 px-6 lg:px-0 max-w-2xl mx-auto leading-relaxed">
          Your meeting notes, automated. Fully open-source. Powered by AI.
          No code required! Bot joins your calls, generates notes, and updates your dashboard.
        </p>

        <Button
          size="large"
          clickHandler={handleLetRavenCook}
          className="!bg-[linear-gradient(180deg,#1F2937,#0B0F14)] !text-white !border !border-white/10 hover:!border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_10px_40px_rgba(0,0,0,0.55)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_12px_48px_rgba(0,0,0,0.6)]"
        >
          <span className="inline-flex items-center gap-2">
            Let RavenAI cook
            <span aria-hidden>↗</span>
          </span>
        </Button>

        <div className="relative py-6">
          <div className="absolute right-[50%]">
            <Image src={vector} alt="vector" />
          </div>
          <p className="pt-12 text-[14px] font-medium text-[#D4D4D4] pl-6 rotate-[-25deg]">
            No code required!
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
