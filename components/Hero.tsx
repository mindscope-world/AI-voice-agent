
import React from 'react';

interface HeroProps {
  onTryLive: () => void;
}

const Hero: React.FC<HeroProps> = ({ onTryLive }) => {
  return (
    <section className="relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-16 py-12">
        <div className="w-full lg:w-1/2 space-y-10">
          <div className="space-y-4">
            <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-800 text-xs font-bold uppercase tracking-widest rounded-full">
              Project YULETIDE
            </span>
            <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1]">
              Introducing <br />
              <span className="text-blue-600">Private Intelligence.</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
              Loud and Clear. An end-to-end, fully offline AI voice agent stack running entirely on-device under extreme resource constraints.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onTryLive}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all shadow-xl shadow-blue-200"
            >
              Start Conversation
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-10 py-4 rounded-full text-lg font-semibold transition-all">
              View Documentation
            </button>
          </div>
          
          <div className="flex items-center gap-8 pt-4">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://picsum.photos/seed/${i + 10}/100/100`} className="w-12 h-12 rounded-full border-4 border-white object-cover" alt="User" />
              ))}
            </div>
            <p className="text-sm text-gray-400">
              <span className="text-gray-900 font-semibold">1,200+</span> engineers already <br /> deployed on Orin Nano.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 relative">
          <div className="relative z-10 animate-float">
             <img 
               src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop" 
               alt="Headphones" 
               className="w-full h-auto rounded-[3rem] shadow-2xl grayscale-[0.2]"
             />
             
             {/* Yellow accent circle similar to the prompt image */}
             <div className="absolute bottom-[-20px] right-[-20px] w-48 h-48 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg transform rotate-[-10deg]">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer hover:scale-110 transition-transform" onClick={onTryLive}>
                   <svg className="w-8 h-8 text-blue-600 fill-current ml-1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                   </svg>
                </div>
             </div>
          </div>
          
          {/* Background decorative elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/30 rounded-full blur-3xl -z-10"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
