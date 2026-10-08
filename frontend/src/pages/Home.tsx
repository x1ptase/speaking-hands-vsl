import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ArrowRight, BrainCircuit, HandMetal } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-[calc(100vh-130px)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-sm font-medium mb-8">
          <Bot className="w-4 h-4" />
          <span>AI-Powered Recognition</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-main-text max-w-4xl tracking-tight mb-6 leading-tight">
          Vietnamese Sign Language <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
            Recognition
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-secondary-text max-w-2xl mb-10 leading-relaxed">
          Communicate naturally with real-time AI-powered Vietnamese Sign Language recognition. 
          Our system translates gestures into text and audio instantly.
        </p>
        
        <Button 
          onClick={() => navigate('/recognition')} 
          className="gap-2 px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all"
        >
          Start Recognition
          <ArrowRight className="w-5 h-5" />
        </Button>

        {/* Abstract Visual Elements */}
        <div className="mt-20 w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-subtle flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <HandMetal className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-main-text">Gesture Tracking</h3>
            <p className="text-sm text-secondary-text text-center mt-2">Precise 33-point skeletal landmark extraction</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-subtle flex flex-col items-center">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
              <BrainCircuit className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-main-text">Deep Learning</h3>
            <p className="text-sm text-secondary-text text-center mt-2">Advanced DD-Net spatial-temporal classification</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-subtle flex flex-col items-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold text-main-text">Real-time Output</h3>
            <p className="text-sm text-secondary-text text-center mt-2">Instant Vietnamese text and audio translation</p>
          </div>
        </div>
      </section>
    </div>
  );
};
