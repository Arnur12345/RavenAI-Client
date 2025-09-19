import React from "react";
import Card from "../../components/Card";
import Image from "next/image";
import line from "@/app/asset/svg/line.svg";
import dev from "@/app/asset/svg/dev.svg";
import Ab from "@/app/asset/svg/Ab.svg";
import Dependency from "@/app/asset/svg/dependency.svg";
import view from "@/app/asset/svg/views.svg";

const Solution = () => {

  return (
    <section
      id="features"
      className="container mx-auto relative flex flex-col justify-center items-center text-center px-6 w-full"
    >
      <div className="absolute top-[70%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full lg:w-[753px] h-[753px] rounded-full bg-white blur-[460px] -z-10"></div>

      <div className="flex justify-center items-center px-10 py-3">
        <Image src={line} alt="line-icon" className="bg-white" />
      </div>

      <p className="text-[12px] font-medium text-gray-300 mb-2 pt-10">
        AI-POWERED MEETING TRANSCRIPTION 💡
      </p>

      <h2>
        Never miss a meeting insight <br /> with RavenAI
      </h2>

      <p className="text-xl mb-8 text-gray-300 font-medium">
        Watch as your meetings transform into clear, actionable notes automatically.{" "}
        <br />
        Privacy-first. Real-time. Open source.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <Card
          imageSrc={dev}
          title="Real-time Meeting Transcription"
          subtext="AI bots join your Google Meet calls and transcribe everything in real-time with 99+ language support"
        />
        <Card
          imageSrc={Ab}
          title="Privacy-First Architecture"
          subtext="Your meeting data stays under your control with open-source, self-hostable infrastructure"
        />
        <div className="flex flex-col items-center max-w-[600px] bg-black py-8 rounded-2xl border border-gray-800 shadow-[0_0_20px_rgba(96,165,250,0.3)]">
          <div className="py-6 w-full px-6">
            <div className="w-full h-[400px] bg-gray-900/80 rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl">
              <div className="@container flex flex-1 items-center justify-center h-full max-lg:py-6 lg:pb-2">
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/component-images/dark-bento-03-security.png"
                  className="h-[min(152px,40cqw)] object-cover"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-8 px-6 text-left w-full">
            <h3 className="text-2xl font-bold pb-4 text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Security
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Enterprise-grade encryption protects your meeting data with end-to-end security. Self-hostable architecture ensures complete control over sensitive conversations.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center max-w-[600px] bg-black py-8 rounded-2xl border border-gray-800 shadow-[0_0_20px_rgba(96,165,250,0.3)]">
          <div className="py-6 w-full px-6">
            <div className="w-full h-[400px] bg-gray-900/80 rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl">
              {/* Terminal Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-3 border-b border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex text-sm font-medium text-gray-300">
                  <div className="bg-gray-800/60 px-3 py-1 rounded-t-lg border-t border-x border-gray-600/30 text-white">
                    mcp.json
                  </div>
                  <div className="px-3 py-1 text-gray-500 border-b border-gray-600/30">
                    config
                  </div>
                </div>
                <div className="w-16"></div>
              </div>
              
              {/* Code Content */}
              <div className="px-6 py-4 h-full overflow-auto bg-gray-900/90">
                <div className="font-mono text-sm text-white leading-relaxed">
                  <pre className="whitespace-pre-wrap text-left text-white">
{`{
  "mcpServers": {
    "fastapi-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://64.161.160.54:18056/mcp",
        "--header",
        "Authorization:\${RAVEN_API_KEY}"
      ],
      "env": {
        "RAVEN_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-8 px-6 text-left w-full">
            <h3 className="text-2xl font-bold pb-4 text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Strong MCP Server
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Full Vexa API access from any MCP-capable agent like Claude Desktop, Cursor, and more.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
