
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CategoryType, Category, GameItem, Language } from './types';
import { BannerAd, InterstitialAd } from './components/AdComponents';
import { audioService } from './services/audioService';
import { 
  ALPHABET_AR, NUMBERS_AR, SHAPES_AR, IMAGES_AR,
  ALPHABET_EN, NUMBERS_EN, SHAPES_EN, IMAGES_EN 
} from './constants/gameData';

const CATEGORIES: Category[] = [
  { type: CategoryType.ALPHABET, titleEn: 'Letters', titleAr: 'الحُرُوف', icon: 'أ', color: 'bg-[#FF9D4D]' },
  { type: CategoryType.NUMBERS, titleEn: 'Numbers', titleAr: 'الأَرْقَام', icon: '١', color: 'bg-[#56E39F]' },
  { type: CategoryType.SHAPES, titleEn: 'Shapes', titleAr: 'الأَشْكَال', icon: '▲', color: 'bg-[#F66EB3]' },
  { type: CategoryType.IMAGES, titleEn: 'Images', titleAr: 'الصُّوَر', icon: '🍎', color: 'bg-[#6EB7F6]' },
];

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [currentCategory, setCurrentCategory] = useState<CategoryType | null>(null);
  const [stageIndex, setStageIndex] = useState(0); 
  const [roundStep, setRoundStep] = useState(1);   
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [correctAnim, setCorrectAnim] = useState(false);
  const [options, setOptions] = useState<GameItem[]>([]);

  const isRtl = lang === 'ar';

  const currentData = useMemo(() => {
    if (lang === 'ar') {
      switch(currentCategory) {
        case CategoryType.ALPHABET: return ALPHABET_AR;
        case CategoryType.NUMBERS: return NUMBERS_AR;
        case CategoryType.SHAPES: return SHAPES_AR;
        case CategoryType.IMAGES: return IMAGES_AR;
        default: return [];
      }
    } else {
      switch(currentCategory) {
        case CategoryType.ALPHABET: return ALPHABET_EN;
        case CategoryType.NUMBERS: return NUMBERS_EN;
        case CategoryType.SHAPES: return SHAPES_EN;
        case CategoryType.IMAGES: return IMAGES_EN;
        default: return [];
      }
    }
  }, [currentCategory, lang]);

  const currentItem = currentData[stageIndex];

  useEffect(() => {
    if (!currentItem) return;
    const wrongItems = currentData.filter(item => item.id !== currentItem.id);
    const randomWrong = wrongItems[Math.floor(Math.random() * wrongItems.length)] || currentItem;
    const newOptions = [currentItem, randomWrong].sort(() => Math.random() - 0.5);
    setOptions(newOptions);
    
    // نطق السؤال عند تحميل المرحلة
    audioService.speak(currentItem.soundText, lang);
  }, [currentItem, currentData, lang]);

  const handleChoice = (selected: GameItem) => {
    if (selected.id === currentItem.id) {
      setCorrectAnim(true);
      audioService.playSuccess(lang);
      
      setTimeout(() => {
        setCorrectAnim(false);
        const nextIndex = (stageIndex + 1) % currentData.length;
        setStageIndex(nextIndex);
        
        // إظهار الإعلان البيني كل 4 مراحل
        if (roundStep >= 4) {
          setRoundStep(1);
          setShowInterstitial(true);
        } else {
          setRoundStep(prev => prev + 1);
        }
      }, 1500);
    } else {
      audioService.playError(lang);
    }
  };

  const toggleMusic = () => {
    const newState = !isMusicOn;
    setIsMusicOn(newState);
    audioService.toggleMusic(newState);
  };

  const toggleLang = () => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    setLang(newLang);
    // تنبيه صوتي بتغيير اللغة
    audioService.speak(newLang === 'ar' ? "العربية" : "English", newLang);
  };

  if (!currentCategory) {
    return (
      <div className={`min-h-screen bg-[#F0F9FF] flex flex-col items-center p-6 pb-24 safe-top overflow-y-auto ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <header className="w-full flex justify-between items-center mb-10 mt-4 max-w-2xl">
          <div className="flex flex-col">
            <h1 className="text-5xl font-black text-[#0088CC] font-kids drop-shadow-sm">
              {lang === 'ar' ? 'مرح الأطفال' : 'Kids Fun'}
            </h1>
            <div className="w-16 h-2 bg-[#FF9D4D] rounded-full mt-2"></div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={toggleLang}
              className="px-4 h-16 rounded-[24px] bg-white shadow-lg border-b-4 border-gray-100 flex items-center justify-center text-xl font-black text-[#0088CC] active:scale-95 active:border-b-0 transition-all"
            >
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button 
              onClick={toggleMusic}
              className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg transition-all border-b-4 ${isMusicOn ? 'bg-[#56E39F] border-[#3cb97a]' : 'bg-gray-200 border-gray-300'}`}
            >
              <span className="text-3xl">{isMusicOn ? '🎵' : '🔇'}</span>
            </button>
          </div>
        </header>

        <main className="grid grid-cols-2 gap-6 w-full max-w-2xl animate-in fade-in slide-in-from-bottom duration-700">
          {CATEGORIES.map(cat => (
            <button
              key={cat.type}
              onClick={() => {
                setCurrentCategory(cat.type);
                setStageIndex(0);
                setRoundStep(1);
              }}
              className={`${cat.color} aspect-square rounded-[48px] flex flex-col items-center justify-center p-6 border-b-[12px] border-black/10 active:translate-y-2 active:border-b-4 transition-all hover:scale-[1.02] shadow-xl`}
            >
              <div className="text-[100px] mb-2 drop-shadow-2xl select-none leading-none">
                {cat.type === CategoryType.ALPHABET ? (lang === 'ar' ? 'أ' : 'A') : cat.icon}
              </div>
              <div className="text-3xl font-black text-white drop-shadow-md">
                {lang === 'ar' ? cat.titleAr : cat.titleEn}
              </div>
            </button>
          ))}
        </main>
        <BannerAd />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F0F9FF] flex flex-col relative overflow-hidden safe-top ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <InterstitialAd isOpen={showInterstitial} onClose={() => setShowInterstitial(false)} />
      
      <header className="p-6 flex justify-between items-center z-20">
        <button 
          onClick={() => setCurrentCategory(null)}
          className="w-16 h-16 bg-white rounded-[24px] shadow-lg flex items-center justify-center text-4xl text-[#0088CC] border-b-4 border-gray-100 active:scale-90 active:border-b-0 transition-all"
        >
          {isRtl ? '→' : '←'}
        </button>
        <div className="flex items-center gap-2 bg-white/60 px-5 py-3 rounded-full shadow-inner border border-white">
          {[1, 2, 3, 4].map(s => (
            <div 
              key={s} 
              className={`w-4 h-4 rounded-full transition-all duration-700 ${roundStep >= s ? 'bg-[#56E39F] scale-125 shadow-md shadow-[#56E39F]/40' : 'bg-gray-200'}`}
            ></div>
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
        {/* Shadow Challenge Area */}
        <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center mb-16 bg-white/20 rounded-[60px] border-2 border-dashed border-white/40">
          <div 
            className={`text-[220px] font-black transition-all duration-500 select-none ${correctAnim ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
            style={{ 
              filter: 'brightness(0) opacity(0.06)', // ظل خفيف جداً كما طلبت
              WebkitFilter: 'brightness(0) opacity(0.06)'
            }}
          >
            {currentItem?.image}
          </div>
          
          {/* Reveal Item on success */}
          {correctAnim && (
            <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in spin-in-3 duration-500">
                <div className="text-[220px] font-black text-[#0088CC] drop-shadow-[0_20px_40px_rgba(0,136,204,0.3)]">
                    {currentItem?.image}
                </div>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-8 w-full max-w-lg">
          {options.map((opt, idx) => (
            <button
              key={`${opt.id}-${idx}`}
              onClick={() => handleChoice(opt)}
              disabled={correctAnim}
              className={`aspect-square bg-white rounded-[56px] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.1)] border-b-[12px] border-gray-100 flex items-center justify-center text-8xl font-black text-gray-800 active:scale-95 active:border-b-4 transition-all ${correctAnim && opt.id === currentItem.id ? 'bg-[#56E39F] text-white border-[#3cb97a] scale-110 z-10 shadow-xl shadow-[#56E39F]/30' : ''}`}
            >
              <span className="drop-shadow-sm select-none">{opt.image}</span>
            </button>
          ))}
        </div>
      </main>

      <BannerAd />

      {/* Celebration Effects */}
      {correctAnim && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
           <div className="text-[200px] animate-ping opacity-20">🌟</div>
           <div className="absolute text-7xl top-1/4 left-1/4 animate-bounce">🎈</div>
           <div className="absolute text-7xl bottom-1/4 right-1/4 animate-bounce">🍬</div>
        </div>
      )}
    </div>
  );
};

export default App;
