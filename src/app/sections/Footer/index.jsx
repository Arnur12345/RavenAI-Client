import React from "react";
import Image from "next/image";
import Line from "@/app/asset/svg/footerLine.svg";
import Link from "next/link";
import logo from "@/app/asset/svg/ravenlogo.svg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <section className="container mx-auto relative flex flex-col justify-center items-center text-center px-6 w-full">
      <Image src={Line} alt="line" className="w-full mb-8" />
      
      <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-6xl gap-8 mb-8">
        {/* Logo Section */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src={logo} alt="RavenAI logo" width={32} height={32} />
            <span className="text-white font-semibold text-xl">RavenAI</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <Link href="#features" className="text-white hover:text-gray-300 transition-colors">
            Features
          </Link>
          <Link href="#HowItWorks" className="text-white hover:text-gray-300 transition-colors">
            How it Works
          </Link>
          <Link href="#faq" className="text-white hover:text-gray-300 transition-colors">
            FAQ
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="w-full">
        <p className="text-gray-400 text-sm text-center">
          © {currentYear} RavenAI. All rights reserved.
        </p>
      </div>
    </section>
  );
};

export default Footer;
