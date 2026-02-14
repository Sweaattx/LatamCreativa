import React, { useState } from 'react';
import { X, ArrowRight, Palette, Briefcase, GraduationCap, Users, Check, Loader2 } from 'lucide-react';
import { LATAM_COUNTRIES } from '../../data/countries';
import { COMMON_ROLES } from '../../data/roles';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => Promise<void>;
}

interface OnboardingData {
  role: string;
  country: string;
  experience: string;
  interests: string[];
}

const experienceLevels = [
  { id: 'student', label: 'Estudiante', icon: GraduationCap },
  { id: 'junior', label: 'Junior (0-2 años)', icon: Palette },
  { id: 'mid', label: 'Mid (3-5 años)', icon: Briefcase },
  { id: 'senior', label: 'Senior (5+ años)', icon: Users },
];

const interestOptions = [
  'Diseño gráfico',
  'Ilustración',
  'Animación',
  'UI/UX',
  'Motion graphics',
  '3D',
  'Fotografía',
  'Video',
  'Branding',
  'Lettering',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    role: '',
    country: '',
    experience: '',
    interests: [],
  });

  if (!isOpen) return null;

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const canContinue = () => {
    switch (step) {
      case 1:
        return !!data.role;
      case 2:
        return !!data.country;
      case 3:
        return !!data.experience;
      case 4:
        return data.interests.length >= 2;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        await onComplete(data);
        onClose();
      } catch (error) {
        console.error('Onboarding error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleInterest = (interest: string) => {
    setData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {/* Progress */}
        <div className="h-1 bg-neutral-800">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Paso {step} de {totalSteps}</p>
            <h3 className="font-semibold text-white">
              {step === 1 && '¿Cuál es tu rol creativo?'}
              {step === 2 && '¿De dónde eres?'}
              {step === 3 && '¿Cuál es tu nivel de experiencia?'}
              {step === 4 && '¿Qué te interesa?'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Step 1: Role */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
              {COMMON_ROLES.slice(0, 12).map((role) => (
                <button
                  key={role}
                  onClick={() => setData((prev) => ({ ...prev, role }))}
                  className={`p-3 text-left rounded-lg text-sm transition-colors ${
                    data.role === role
                      ? 'bg-amber-500/10 border border-amber-500/50 text-amber-500'
                      : 'bg-neutral-800/50 border border-transparent hover:bg-neutral-800 text-white'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Country */}
          {step === 2 && (
            <div className="space-y-2">
              <select
                value={data.country}
                onChange={(e) => setData((prev) => ({ ...prev, country: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-neutral-600"
              >
                <option value="">Selecciona tu país</option>
                {LATAM_COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3: Experience */}
          {step === 3 && (
            <div className="space-y-2">
              {experienceLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setData((prev) => ({ ...prev, experience: level.id }))}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg transition-colors ${
                    data.experience === level.id
                      ? 'bg-amber-500/10 border border-amber-500/50'
                      : 'bg-neutral-800/50 border border-transparent hover:bg-neutral-800'
                  }`}
                >
                  <level.icon
                    className={`w-5 h-5 ${
                      data.experience === level.id ? 'text-amber-500' : 'text-neutral-500'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      data.experience === level.id ? 'text-amber-500' : 'text-white'
                    }`}
                  >
                    {level.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Interests */}
          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-neutral-500">Selecciona al menos 2 intereses</p>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => {
                  const selected = data.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-1.5 ${
                        selected
                          ? 'bg-amber-500 text-black'
                          : 'bg-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-800">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              className={`text-sm text-neutral-500 hover:text-white transition-colors ${
                step === 1 ? 'invisible' : ''
              }`}
            >
              Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={!canContinue() || loading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : step === totalSteps ? (
                'Completar'
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
