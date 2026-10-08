import React from 'react';
import { SectionTitle } from '../components/common/SectionTitle';
import { Card } from '../components/common/Card';
import { Code2, Video, Brain, Mic } from 'lucide-react';

export const About: React.FC = () => {
  const technologies = [
    { name: 'React', category: 'Frontend', color: 'bg-blue-100 text-blue-700' },
    { name: 'TypeScript', category: 'Frontend', color: 'bg-blue-100 text-blue-700' },
    { name: 'TailwindCSS', category: 'Frontend', color: 'bg-blue-100 text-blue-700' },
    { name: 'Python', category: 'Backend Core', color: 'bg-yellow-100 text-yellow-700' },
    { name: 'FastAPI', category: 'API (Future)', color: 'bg-teal-100 text-teal-700' },
    { name: 'MediaPipe', category: 'Computer Vision', color: 'bg-indigo-100 text-indigo-700' },
    { name: 'OpenCV', category: 'Computer Vision', color: 'bg-indigo-100 text-indigo-700' },
    { name: 'TensorFlow', category: 'Deep Learning', color: 'bg-orange-100 text-orange-700' },
    { name: 'DD-Net', category: 'Deep Learning Model', color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-main-text mb-6">About Speaking Hands</h1>
        <p className="text-xl text-secondary-text max-w-2xl mx-auto leading-relaxed">
          Speaking Hands is an AI-powered application designed to recognize Vietnamese Sign Language 
          using computer vision and deep learning.
        </p>
      </div>

      <div className="mb-16">
        <SectionTitle title="How It Works" />
        <Card className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
            {/* Horizontal Line for Desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border-subtle -z-10 -translate-y-1/2"></div>
            
            {/* Vertical Line for Mobile */}
            <div className="md:hidden absolute top-0 left-1/2 w-0.5 h-full bg-border-subtle -z-10 -translate-x-1/2"></div>

            <div className="flex flex-col items-center bg-white px-2 py-4">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-3">
                <Video className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-sm font-semibold text-main-text">Camera</span>
              <span className="text-xs text-secondary-text text-center mt-1 w-24">Video Ingestion</span>
            </div>

            <div className="flex flex-col items-center bg-white px-2 py-4">
              <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-3">
                <Code2 className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-sm font-semibold text-main-text">MediaPipe</span>
              <span className="text-xs text-secondary-text text-center mt-1 w-24">Landmark Extraction</span>
            </div>

            <div className="flex flex-col items-center bg-white px-2 py-4">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-3">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-semibold text-main-text">DD-Net</span>
              <span className="text-xs text-secondary-text text-center mt-1 w-24">Sign Classification</span>
            </div>

            <div className="flex flex-col items-center bg-white px-2 py-4">
              <div className="w-14 h-14 bg-success/10 rounded-full flex items-center justify-center border-4 border-white shadow-sm mb-3">
                <Mic className="w-6 h-6 text-success" />
              </div>
              <span className="text-sm font-semibold text-main-text">Output</span>
              <span className="text-xs text-secondary-text text-center mt-1 w-24">Vietnamese Text & Audio</span>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <SectionTitle title="Technology Stack" subtitle="Built with modern web and AI frameworks." />
        <div className="flex flex-wrap gap-3">
          {technologies.map((tech) => (
            <div key={tech.name} className={`px-4 py-2 rounded-lg font-medium text-sm border border-white/20 shadow-sm ${tech.color}`}>
              {tech.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
