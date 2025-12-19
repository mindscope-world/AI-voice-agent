
import React from 'react';

const Specs: React.FC = () => {
  const specGroups = [
    {
      title: "Neural Pipeline",
      specs: [
        { label: "ASR Model", value: "OpenAI Whisper - Tiny" },
        { label: "LLM Model", value: "Liquid AI LFM2 - 700M" },
        { label: "TTS Engine", value: "Gemini 2.5 Native Audio" },
        { label: "Context Window", value: "2,048 Tokens" },
        { label: "Inference Latency", value: "600ms - 900ms (Total Turn)" },
      ]
    },
    {
      title: "Hardware Target",
      specs: [
        { label: "SOC", value: "NVIDIA Jetson Orin Nano" },
        { label: "GPU Architecture", value: "Ampere (1024 CUDA Cores)" },
        { label: "CPU", value: "6-core ARM® Cortex®-A78AE v8.2" },
        { label: "Memory Type", value: "8GB 128-bit LPDDR5 (68 GB/s)" },
        { label: "Power Envelope", value: "7W - 15W (Adjustable)" },
      ]
    },
    {
      title: "Software Environment",
      specs: [
        { label: "Operating System", value: "Ubuntu 22.04 (JetPack 6.0+)" },
        { label: "Acceleration API", value: "CUDA 12.x / TensorRT 10.x" },
        { label: "Audio Backend", value: "ALSA / PulseAudio (16kHz PCM)" },
        { label: "Precision Engine", value: "INT8 / FP16 Quantization" },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-16">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Technical Datasheet</h2>
        <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
          Comprehensive engineering specifications for the YULETIDE Edge Intelligence platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {specGroups.map((group, idx) => (
          <div key={idx} className="space-y-6">
            <h3 className="text-lg font-bold text-blue-600 uppercase tracking-widest px-4">{group.title}</h3>
            <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm">
              <table className="w-full text-left">
                <tbody>
                  {group.specs.map((spec, sIdx) => (
                    <tr key={sIdx} className={sIdx !== group.specs.length - 1 ? "border-b border-gray-50" : ""}>
                      <td className="py-6 px-8 text-sm font-medium text-gray-400 w-1/3">{spec.label}</td>
                      <td className="py-6 px-8 text-sm font-semibold text-gray-900">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-gray-900 rounded-[3rem] p-12 text-center text-white space-y-6">
        <h3 className="text-2xl font-bold">Ready for edge deployment?</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Download the pre-configured JetPack image and pre-quantized model weights to get started in minutes.
        </p>
        <button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-full font-bold transition-all">
          Get Build Artifacts
        </button>
      </div>
    </div>
  );
};

export default Specs;
