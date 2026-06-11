import React, { useState, useEffect, useRef } from 'react';

// === インラインマークダウン解析関数 ===
const renderInlineElements = (text) => {
  if (!text) return '';
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, idx) => {
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 hover:text-emerald-700 transition-colors font-medium inline-flex items-center gap-0.5"
        >
          {linkMatch[1]}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      );
    }

    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      const boldMatch = bPart.match(/\*\*(.*?)\*\*/);
      if (boldMatch) {
        return <strong key={bIdx} className="font-semibold text-slate-800">{boldMatch[1]}</strong>;
      }
      return bPart;
    });
  });
};

// === マークダウンテキストレンダラー ===
const parseMarkdownToJsx = (text) => {
  if (!text) return null;

  return text.split('\n').map((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine === '') {
      return <div key={index} className="h-4" />;
    }

    if (trimmedLine.startsWith('# ')) {
      return (
        <h1 key={index} className="text-lg font-extrabold text-slate-900 mt-6 mb-4 border-b border-slate-100 pb-2.5 tracking-tight">
          {trimmedLine.replace('# ', '')}
        </h1>
      );
    }

    if (trimmedLine.startsWith('## ')) {
      return (
        <h2 key={index} className="text-sm font-bold text-emerald-600 mt-5 mb-2 flex items-center">
          <span className="w-1 h-3.5 bg-gradient-to-b from-emerald-500 to-emerald-600 mr-2 rounded-full"></span>
          {trimmedLine.replace('## ', '')}
        </h2>
      );
    }

    if (trimmedLine.startsWith('### ')) {
      return (
        <h3 key={index} className="text-xs font-semibold text-slate-700 mt-4 mb-1.5">
          {trimmedLine.replace('### ', '')}
        </h3>
      );
    }

    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      const content = trimmedLine.substring(2);
      return (
        <li key={index} className="ml-5 list-disc text-slate-600 mb-1.5 leading-relaxed text-[12px]">
          {renderInlineElements(content)}
        </li>
      );
    }

    return (
      <p key={index} className="text-slate-600 leading-relaxed text-[12px] mb-2.5">
        {renderInlineElements(trimmedLine)}
      </p>
    );
  });
};

// === スクロール連動ふわっと表示コンポーネント (IntersectionObserver) ===
const ScrollReveal = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    }, { threshold: 0.1 });

    if (domRef.current) {
      observer.observe(domRef.current);
    }

    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {children}
    </div>
  );
};

import INITIAL_ARTICLES from './data/news.json';

export default function App() {
  const [articles, setArticles] = useState(INITIAL_ARTICLES);
  const [activeCategory, setActiveCategory] = useState('主要');
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportFilter, setReportFilter] = useState('すべて');
  const [gourmetFilter, setGourmetFilter] = useState('すべて');
  
  // 管理者記事作成コンソール用のフォーム状態
  const [adminTitle, setAdminTitle] = useState('');
  const [adminSummary, setAdminSummary] = useState('');
  const [adminCategory, setAdminCategory] = useState('主要');
  const [adminReportSubCategory, setAdminReportSubCategory] = useState('観光地');
  const [adminGourmetSubCategory, setAdminGourmetSubCategory] = useState('ラオス料理');
  const [adminReadTime, setAdminReadTime] = useState('3 min read');
  const [adminSource, setAdminSource] = useState('現地取材スタッフ');
  const [adminTakeaway1, setAdminTakeaway1] = useState('');
  const [adminTakeaway2, setAdminTakeaway2] = useState('');
  const [adminTakeaway3, setAdminTakeaway3] = useState('');
  const [adminContent, setAdminContent] = useState('');
  const [adminImageFilename, setAdminImageFilename] = useState('');
  const [adminImagePreview, setAdminImagePreview] = useState('');
  const [adminBudgetLAK, setAdminBudgetLAK] = useState('30,000 - 60,000 LAK');
  const [adminBudgetJPY, setAdminBudgetJPY] = useState('約200 - 450円');
  const [adminRecommendedMenu, setAdminRecommendedMenu] = useState('');
  const [adminBusinessHours, setAdminBusinessHours] = useState('8:00 - 17:00');
  const [adminHoliday, setAdminHoliday] = useState('年中無休');
  const [adminMapLink, setAdminMapLink] = useState('');
  const [generatedJson, setGeneratedJson] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // ビュー管理: 'portal' | 'article' | 'about' | 'privacy' | 'terms'
  const [currentView, setCurrentView] = useState('portal');

  // スクロール進捗率の計測
  const [scrollProgress, setScrollProgress] = useState(0);

  const [weatherData, setWeatherData] = useState({
    temp: 32,
    humidity: 65,
    windSpeed: 2.0,
    icon: '☀️',
    loading: true,
    error: null
  });

  const [rateData, setRateData] = useState({
    jpy: 138.5,
    usd: 21850,
    thb: 625,
    loading: true,
    error: null
  });

  const fetchWeather = async () => {
    try {
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=17.9667&longitude=102.6&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      
      const code = data.current.weather_code;
      let emoji = '☀️';
      if (code === 0) emoji = '☀️';
      else if (code >= 1 && code <= 3) emoji = '🌤️';
      else if (code === 45 || code === 48) emoji = '🌫️';
      else if (code >= 51 && code <= 55) emoji = '🌧️';
      else if (code >= 61 && code <= 65) emoji = '🌧️';
      else if (code >= 80 && code <= 82) emoji = '🌦️';
      else if (code >= 95) emoji = '⛈️';

      setWeatherData({
        temp: Math.round(data.current.temperature_2m),
        humidity: Math.round(data.current.relative_humidity_2m),
        windSpeed: data.current.wind_speed_10m,
        icon: emoji,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error(err);
      setWeatherData(prev => ({ ...prev, loading: false, error: err.message }));
    }
  };

  const fetchRates = async () => {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const lakPerUsd = data.rates.LAK;
      const jpyPerUsd = data.rates.JPY;
      const thbPerUsd = data.rates.THB;
      
      // BCELの窓口現金レート水準に合わせるためスプレッド（約1.01倍）を加算
      const lakPerJpy = (lakPerUsd / jpyPerUsd) * 1.01; 
      const lakPerThb = (lakPerUsd / thbPerUsd) * 1.01;
      
      setRateData({
        usd: Math.round(lakPerUsd),
        jpy: parseFloat(lakPerJpy.toFixed(1)),
        thb: Math.round(lakPerThb),
        loading: false,
        error: null
      });
    } catch (err) {
      console.error(err);
      setRateData(prev => ({ ...prev, loading: false, error: err.message }));
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchWeather();
    fetchRates();

    const weatherInterval = setInterval(fetchWeather, 15 * 60 * 1000); // 15分毎更新
    const ratesInterval = setInterval(fetchRates, 60 * 60 * 1000); // 1時間毎更新

    return () => {
      clearInterval(weatherInterval);
      clearInterval(ratesInterval);
    };
  }, []);

  // カテゴリマッピングと3Dアイコンの指定
  const categoryMap = {
    '主要': { name: '総合', icon: '/icon_globe.png' },
    '経済': { name: '経済', icon: '/icon_chart.png' },
    '社会': { name: '社会', icon: '/icon_people.png' },
    '国際': { name: '国際', icon: '/icon_plane.png' },
    '観光': { name: '観光', icon: '/icon_temple.png' },
    '現地グルメ': { name: '現地グルメ', icon: '/icon_gourmet.png' },
    '取材レポ': { name: '取材レポ', icon: '/icon_report.png' },
    '基本情報': { name: '基本情報', icon: '/icon_basic.png' },
    '生活情報': { name: '生活情報', icon: '/icon_living.png' }
  };

  // 記事を選択して詳細表示＆閲覧数+1
  const handleSelectArticle = (artId) => {
    setSelectedArticleId(artId);
    setCurrentView('article');
    setArticles(prev => prev.map(art => {
      if (art.id === artId) {
        return { ...art, viewsCount: art.viewsCount + 1 };
      }
      return art;
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ビュー遷移
  const navigateToView = (viewName) => {
    setCurrentView(viewName);
    setSelectedArticleId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminAccess = () => {
    const pw = prompt('管理者パスコードを入力してください:');
    if (pw === 'laodigest2026') {
      navigateToView('admin');
    } else if (pw !== null) {
      alert('パスコードが正しくありません。');
    }
  };

  const handleFileChange = (file) => {
    if (!file) return;
    setAdminImageFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setAdminImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateJSON = () => {
    if (!adminTitle.trim()) {
      alert('タイトルを入力してください。');
      return;
    }
    const randomId = 'gen-' + Math.random().toString(36).substring(2, 9);
    const takeaways = [];
    if (adminTakeaway1.trim()) takeaways.push(adminTakeaway1.trim());
    if (adminTakeaway2.trim()) takeaways.push(adminTakeaway2.trim());
    if (adminTakeaway3.trim()) takeaways.push(adminTakeaway3.trim());

    const item = {
      id: randomId,
      category: adminCategory,
      title: adminTitle.trim(),
      summary: adminSummary.trim(),
      date: new Date().toLocaleDateString('sv-SE'), // YYYY-MM-DD
      readTime: adminReadTime.trim(),
      source: adminSource.trim(),
      picksCount: 0,
      viewsCount: 0,
      image: adminImageFilename ? '/' + adminImageFilename : "",
      takeaways: takeaways.length > 0 ? takeaways : undefined,
      content: adminContent.trim()
    };

    if (adminCategory === '取材レポ') {
      item.reportSubCategory = adminReportSubCategory;
    } else if (adminCategory === '現地グルメ') {
      item.gourmetSubCategory = adminGourmetSubCategory;
      item.restaurantInfo = {
        budgetLAK: adminBudgetLAK.trim(),
        budgetJPY: adminBudgetJPY.trim(),
        recommendedMenu: adminRecommendedMenu.trim(),
        businessHours: adminBusinessHours.trim(),
        holiday: adminHoliday.trim(),
        mapLink: adminMapLink.trim()
      };
    }

    setGeneratedJson(JSON.stringify(item, null, 2));
    setCopySuccess(false);
  };

  const handleCopyToClipboard = () => {
    if (!generatedJson) return;
    navigator.clipboard.writeText(generatedJson);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // 記事フィルタリング
  const mappedCategory = categoryMap[activeCategory]?.name || '総合';
  const filteredArticles = articles.filter(art => {
    const matchesCategory = activeCategory === '主要'
      ? (art.category !== '基本情報' && art.category !== '生活情報' && art.category !== '現地グルメ' && art.category !== '取材レポ')
      : art.category === mappedCategory;
    const matchesSearch = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ランキング順（閲覧数の多い順）
  const rankedArticles = [...articles].sort((a, b) => b.viewsCount - a.viewsCount);

  // 現在詳細表示している記事
  const selectedArticle = articles.find(art => art.id === selectedArticleId);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-slate-800 font-sans flex flex-col justify-between scroll-smooth">
      
      {/* 1. スリムヘッダー */}
      <header className="bg-white border-b border-[#e9e4db] sticky top-0 z-50">
        
        {/* 最上部ミニバー */}
        <div className="bg-[#1f2937] text-slate-300">
          <div className="max-w-[1000px] mx-auto px-4 py-1.5 flex justify-between items-center text-[10px] font-bold">
            <div className="flex items-center space-x-4">
              <span onClick={() => navigateToView('portal')} className="text-emerald-400 cursor-pointer font-extrabold hover:text-emerald-300 transition">ラオス日刊ダイジェスト</span>
            </div>
            <div className="flex items-center space-x-3">
              <span>毎日12:00自動更新</span>
              <span>•</span>
              <span>{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</span>
            </div>
          </div>
        </div>

        {/* メインタイトルロゴ & 検索バー */}
        <div className="max-w-[1000px] mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div 
            onClick={() => { navigateToView('portal'); setActiveCategory('主要'); }}
            className="flex items-center cursor-pointer select-none group"
          >
            <div className="flex flex-col text-left">
              <h1 className="font-logo text-[20px] md:text-[23px] text-[#0f766e] group-hover:text-teal-800 transition-colors leading-none tracking-tight">
                ラオス日刊ダイジェスト
              </h1>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest mt-1.5 font-bold uppercase block pl-0.5">
                Cozy Daily Intelligence Portal
              </span>
            </div>
          </div>

          {/* 右側：シンプル検索窓 */}
          <div className="flex items-center border border-[#d9d2c5] rounded-xl overflow-hidden bg-white w-full sm:w-[320px]">
            <input
              type="text"
              placeholder="キーワードを入力..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView !== 'portal') setCurrentView('portal');
              }}
              className="w-full px-2.5 py-1.5 text-xs outline-none text-slate-700 bg-transparent placeholder-slate-400"
            />
            <button className="bg-slate-50 hover:bg-slate-100 border-l border-[#d9d2c5] text-slate-700 font-bold text-xs px-4 py-1.5 transition-colors">
              検索
            </button>
          </div>
        </div>

        {/* Horizontal main nav category bar */}
        <div className="bg-[#fcfbf9] border-t border-[#e9e4db]">
          <nav className="max-w-[1000px] mx-auto flex overflow-x-auto scrollbar-none font-bold text-xs p-2 gap-2 justify-center sm:justify-start">
            {['主要', '経済', '社会', '国際', '観光', '現地グルメ', '取材レポ', '基本情報', '生活情報'].map((cat) => {
              const isActive = activeCategory === cat && currentView === 'portal';
              const iconPath = categoryMap[cat]?.icon;
              const isInfo = cat === '基本情報' || cat === '生活情報';
              const isSpecial = cat === '現地グルメ' || cat === '取材レポ';
              const activeClass = isInfo
                ? 'bg-[#6d28d9] text-white border border-[#6d28d9] shadow-sm font-extrabold'
                : isSpecial
                ? 'bg-[#c2410c] text-white border border-[#c2410c] shadow-sm font-extrabold'
                : 'bg-[#0f766e] text-white border border-[#0f766e] shadow-sm font-extrabold';
              const inactiveClass = isInfo
                ? 'border-violet-200/80 bg-violet-50/30 text-violet-700 hover:text-violet-900 hover:bg-violet-100/50'
                : isSpecial
                ? 'border-amber-200/80 bg-amber-50/30 text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'
                : 'border border-[#e9e4db] bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50';



              return (
                <button
                  key={cat}
                  onClick={() => {
                    navigateToView('portal');
                    setActiveCategory(cat);
                  }}
                  className={`px-3 py-1.5 shrink-0 whitespace-nowrap transition-all duration-200 flex items-center gap-2 rounded-xl hover-wiggle ${
                    isActive ? activeClass : inactiveClass
                  }`}
                >
                  {iconPath && (
                    <img 
                      src={iconPath} 
                      alt="" 
                      className="w-5 h-5 object-contain" 
                    />
                  )}
                  <span>{cat}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* スクロール進行度インジケーターバー */}
        <div className="h-[3px] bg-slate-100 w-full overflow-hidden absolute bottom-[-3px] left-0">
          <div className="h-full bg-gradient-to-r from-teal-500 to-teal-700 transition-all duration-100" style={{ width: `${scrollProgress}%` }}></div>
        </div>
      </header>

      {/* タグライン紹介バナー */}
      <section className="bg-white border-b border-[#e9e4db] py-3.5 px-4 shadow-3xs">
        <div className="max-w-[1000px] mx-auto text-left text-xs font-semibold text-slate-600 leading-relaxed flex items-center space-x-2">
          <span className="inline-block px-1.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded text-[10px] font-bold">INFO</span>
          <span>ラオスの主要メディアやSNS（主にFacebook）で話題になっている、重要かつインパクトの高いニュースを毎日お届けします。</span>
        </div>
      </section>

      {/* 2カラム構成 */}
      <div className="max-w-[1000px] w-full mx-auto px-4 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* 左側：メインエリア (lg:col-span-8) */}
        <main className="lg:col-span-8 space-y-4">

          {/* ポータル表示 */}
          {currentView === 'portal' && (
            <>
              <div className="cozy-card overflow-hidden flex flex-col md:flex-row items-stretch bg-white">
                
                {/* 左側縦カテゴリ */}
                {activeCategory !== '基本情報' && activeCategory !== '生活情報' && activeCategory !== '現地グルメ' && activeCategory !== '取材レポ' && (
                  <div className="w-full md:w-[135px] bg-[#faf9f6] border-r-0 md:border-r border-b md:border-b-0 border-[#e9e4db] shrink-0 flex md:flex-col justify-start py-2">
                    <div className="hidden md:block px-3 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-left">
                      カテゴリー
                    </div>
                    {['主要', '経済', '社会', '国際', '観光'].map(cat => {
                      const iconPath = categoryMap[cat]?.icon;
                      const isActive = activeCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`flex-1 md:flex-initial text-center md:text-left px-3 py-2 text-xs font-bold transition-all flex items-center justify-center md:justify-start gap-2 ${
                            isActive
                              ? 'bg-white text-teal-700 md:border-l-4 md:border-l-teal-600 font-extrabold shadow-3xs'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {iconPath && (
                            <img 
                              src={iconPath} 
                              alt="" 
                              className="w-8 h-8 object-contain" 
                            />
                          )}
                          <span className="truncate">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 右側：メインコンテンツエリア */}
                <div className="flex-1 p-5 md:p-6 space-y-6 min-w-0">
                  {activeCategory === '基本情報' ? (
                    /* 基本情報ビュー */
                    <ScrollReveal>
                      <div className="text-left space-y-5">
                        <h2 className="text-base font-extrabold text-slate-900 border-b border-[#e9e4db] pb-2.5 flex items-center gap-2">
                          <img src={categoryMap['基本情報'].icon} alt="" className="w-10 h-10 object-contain" />
                          <span>ラオス基本情報</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                          {articles.filter(art => art.category === '基本情報').map(art => (
                            <div 
                              key={art.id}
                              onClick={() => handleSelectArticle(art.id)}
                              className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl space-y-3 border border-[#e9e4db]/30 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                            >
                              <div>
                                {art.image && (
                                  <div className="w-full h-[120px] rounded-lg overflow-hidden bg-slate-100 mb-3 border border-[#e9e4db]/40">
                                    <img src={art.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                                  </div>
                                )}
                                <h3 className="font-extrabold text-slate-800 text-xs mb-1.5 group-hover:text-teal-700 transition-colors">{art.title}</h3>
                                <p className="text-slate-600 leading-relaxed line-clamp-3">{art.summary}</p>
                              </div>
                              <div className="text-[10px] text-teal-600 font-bold mt-2 flex items-center gap-1">
                                <span>詳しく見る</span>
                                <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  ) : activeCategory === '生活情報' ? (
                    /* 生活情報ビュー */
                    <ScrollReveal>
                      <div className="text-left space-y-5">
                        <h2 className="text-base font-extrabold text-slate-900 border-b border-[#e9e4db] pb-2.5 flex items-center gap-2">
                          <img src={categoryMap['生活情報'].icon} alt="" className="w-10 h-10 object-contain" />
                          <span>ラオス生活情報</span>
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                          {articles.filter(art => art.category === '生活情報').map(art => (
                            <div 
                              key={art.id}
                              onClick={() => handleSelectArticle(art.id)}
                              className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl space-y-3 border border-[#e9e4db]/30 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                            >
                              <div>
                                {art.image && (
                                  <div className="w-full h-[120px] rounded-lg overflow-hidden bg-slate-100 mb-3 border border-[#e9e4db]/40">
                                    <img src={art.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                                  </div>
                                )}
                                <h3 className="font-extrabold text-slate-800 text-xs mb-1.5 group-hover:text-teal-700 transition-colors">{art.title}</h3>
                                <p className="text-slate-600 leading-relaxed line-clamp-3">{art.summary}</p>
                              </div>
                              <div className="text-[10px] text-teal-600 font-bold mt-2 flex items-center gap-1">
                                <span>詳しく見る</span>
                                <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  ) : activeCategory === '現地グルメ' ? (
                    /* 現地グルメビュー */
                    <ScrollReveal>
                      <div className="text-left space-y-5">
                        <div className="border-b border-[#e9e4db] pb-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            <img src={categoryMap['現地グルメ'].icon} alt="" className="w-10 h-10 object-contain" />
                            <span>ラオス現地グルメ (レストラン紹介)</span>
                          </h2>
                          {/* サブカテゴリーフィルター */}
                          <div className="flex flex-wrap gap-1">
                            {['すべて', 'ラオス料理', 'アジア・各国料理', 'カフェ・洋菓子', 'ローカル・屋台', 'BBQ・バー'].map(sub => (
                              <button
                                key={sub}
                                onClick={() => setGourmetFilter(sub)}
                                className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-colors border ${
                                  gourmetFilter === sub
                                    ? 'bg-amber-700 text-white border-amber-700'
                                    : 'bg-white text-slate-600 border-[#e9e4db] hover:bg-slate-50'
                                }`}
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                          {articles
                            .filter(art => {
                              if (art.category !== '現地グルメ') return false;
                              if (gourmetFilter === 'すべて') return true;
                              return art.gourmetSubCategory === gourmetFilter;
                            })
                            .map(art => (
                              <div 
                                key={art.id}
                                onClick={() => handleSelectArticle(art.id)}
                                className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl space-y-3.5 border border-[#e9e4db]/30 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                              >
                                <div>
                                  {art.image && (
                                    <div className="w-full h-[130px] rounded-lg overflow-hidden bg-slate-100 mb-3 border border-[#e9e4db]/40">
                                      <img src={art.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                                    </div>
                                  )}
                                  {art.gourmetSubCategory && (
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-50 text-amber-700 border border-amber-100 uppercase">
                                        {art.gourmetSubCategory}
                                      </span>
                                    </div>
                                  )}
                                  <h3 className="font-extrabold text-slate-800 text-xs mb-2 group-hover:text-teal-700 transition-colors">{art.title}</h3>
                                  <p className="text-slate-600 leading-relaxed line-clamp-2 mb-3">{art.summary}</p>
                                  
                                  {art.restaurantInfo && (
                                    <div className="bg-[#f5f1ea]/40 border border-[#e9e4db]/60 p-2.5 rounded-lg text-[10px] space-y-1 text-slate-700 font-bold">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">平均予算</span>
                                        <span>{art.restaurantInfo.budgetLAK} ({art.restaurantInfo.budgetJPY})</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400">おすすめ</span>
                                        <span>{art.restaurantInfo.recommendedMenu}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-3.5 flex justify-between items-center">
                                  <div className="text-[10px] text-teal-600 font-bold flex items-center gap-1">
                                    <span>詳しく見る</span>
                                    <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                                  </div>
                                  {art.restaurantInfo?.mapLink && (
                                    <a 
                                      href={art.restaurantInfo.mapLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f766e] text-white rounded-lg hover:bg-teal-800 transition-colors text-[10px] font-bold"
                                    >
                                      📍 地図を見る
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  ) : activeCategory === '取材レポ' ? (
                    /* 取材レポビュー */
                    <ScrollReveal>
                      <div className="text-left space-y-5">
                        <div className="border-b border-[#e9e4db] pb-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                            <img src={categoryMap['取材レポ'].icon} alt="" className="w-10 h-10 object-contain" />
                            <span>現地取材レポート</span>
                          </h2>
                          {/* サブカテゴリーフィルター */}
                          <div className="flex flex-wrap gap-1">
                            {['すべて', '観光地', '生活お役立ち', '企業紹介'].map(sub => (
                              <button
                                key={sub}
                                onClick={() => setReportFilter(sub)}
                                className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-colors border ${
                                  reportFilter === sub
                                    ? 'bg-teal-700 text-white border-teal-700'
                                    : 'bg-white text-slate-600 border-[#e9e4db] hover:bg-slate-50'
                                }`}
                              >
                                {sub}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                          {articles
                            .filter(art => {
                              if (art.category !== '取材レポ') return false;
                              if (reportFilter === 'すべて') return true;
                              return art.reportSubCategory === reportFilter;
                            })
                            .map(art => (
                              <div 
                                key={art.id}
                                onClick={() => handleSelectArticle(art.id)}
                                className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-xl space-y-3 border border-[#e9e4db]/30 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
                              >
                                <div>
                                  {art.image && (
                                    <div className="w-full h-[120px] rounded-lg overflow-hidden bg-slate-100 mb-3 border border-[#e9e4db]/40">
                                      <img src={art.image} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-amber-50 text-amber-700 border border-amber-100 uppercase">
                                      {art.reportSubCategory}
                                    </span>
                                  </div>
                                  <h3 className="font-extrabold text-slate-800 text-xs mb-1.5 group-hover:text-teal-700 transition-colors">{art.title}</h3>
                                  <p className="text-slate-600 leading-relaxed line-clamp-3">{art.summary}</p>
                                </div>
                                <div className="text-[10px] text-teal-600 font-bold mt-2 flex items-center gap-1">
                                  <span>詳しく見る</span>
                                  <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  ) : (
                    /* 一般トピック・ニュース一覧ビュー */
                    <div className="space-y-6">
                      
                      {/* 主要記事プレビュー */}
                      {filteredArticles.length > 0 && (
                        <div 
                          onClick={() => handleSelectArticle(filteredArticles[0].id)}
                          className="cursor-pointer group flex flex-col sm:flex-row gap-4 border-b border-[#e9e4db] pb-5 items-start transition-all text-left"
                        >
                          {filteredArticles[0].image && (
                            <div className="w-full sm:w-[200px] h-[120px] rounded overflow-hidden bg-slate-100 shrink-0 relative border border-[#e9e4db] shadow-2xs group-hover:shadow-xs transition duration-300">
                              <img 
                                src={filteredArticles[0].image} 
                                alt={filteredArticles[0].title}
                                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                              />
                              <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-[7px] text-white font-bold px-1 rounded-sm">AIイメージ</span>
                            </div>
                          )}
                          <div className="space-y-2 flex-1 min-w-0">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-700 border border-teal-100 inline-block uppercase">
                              PICKUP // {filteredArticles[0].category}
                            </span>
                            <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-snug group-hover:text-teal-700 group-hover:underline">
                              {filteredArticles[0].title}
                            </h3>
                            <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                              {filteredArticles[0].summary}
                            </p>
                            <div className="flex items-center text-[10px] text-slate-400 font-bold space-x-3 pt-1">
                              <span>👁️ {filteredArticles[0].viewsCount.toLocaleString()} 閲覧</span>
                              <span>•</span>
                              <span>{filteredArticles[0].source}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ニュースリスト */}
                      <div className="flex flex-col space-y-3 text-left">
                        {filteredArticles.slice(1).length === 0 && filteredArticles.length <= 1 && (
                          <div className="text-center py-6 text-slate-400 text-xs">
                            該当するトピックはありません。
                          </div>
                        )}
                        
                        {filteredArticles.slice(1, 6).map((art) => (
                          <div 
                            key={art.id}
                            onClick={() => handleSelectArticle(art.id)}
                            className="cursor-pointer group flex justify-between items-center py-1 border-b border-dashed border-[#e9e4db]/60 last:border-b-0"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full shrink-0"></span>
                              <span className="text-slate-800 text-[12px] font-bold group-hover:text-teal-700 group-hover:underline truncate">
                                {art.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-semibold shrink-0 ml-4">
                              <span>👁️ {art.viewsCount}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  )}
                </div>
              </div>

              {/* 新着の配信ニュース一覧（カテゴリーに関わらず下部に表示） */}
              {activeCategory !== '基本情報' && activeCategory !== '生活情報' && activeCategory !== '現地グルメ' && activeCategory !== '取材レポ' && (
                <div className="space-y-5">
                  <ScrollReveal>
                    <div className="cozy-card p-5 text-left bg-white">
                      <h4 className="text-xs font-black text-slate-900 border-b border-[#e9e4db] pb-2 mb-4 flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 bg-teal-700 rounded-full"></span>
                        <span>新着の配信ニュース一覧</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {articles
                          .filter((art) => art.category !== '基本情報' && art.category !== '生活情報' && art.category !== '現地グルメ' && art.category !== '取材レポ')
                          .slice(0, 8)
                          .map((art) => (
                            <div 
                              key={art.id} 
                              onClick={() => handleSelectArticle(art.id)}
                              className="cursor-pointer group flex items-start space-x-3 border-b border-slate-50 pb-3 last:border-b-0 md:last:border-b"
                            >
                              {art.image && (
                                <div className="w-[80px] h-[55px] rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-3xs group-hover:shadow-2xs transition duration-300">
                                  <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                                </div>
                              )}
                              <div className="min-w-0 space-y-1">
                                <h5 className="text-[12px] font-extrabold text-slate-900 group-hover:text-teal-700 leading-snug line-clamp-2">
                                  {art.title}
                                </h5>
                                <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-bold">
                                  <span>{art.source}</span>
                                  <span>•</span>
                                  <span>👁️ {art.viewsCount}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* 現地特別取材 ＆ おすすめグルメ新着 */}
                  <ScrollReveal>
                    <div className="cozy-card p-5 text-left bg-white border-t-2 border-t-[#c2410c]/70">
                      <h4 className="text-xs font-black text-slate-900 border-b border-[#e9e4db] pb-2 mb-4 flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 bg-[#c2410c] rounded-full"></span>
                        <span className="text-[#c2410c]">現地特別取材 ＆ おすすめグルメ新着</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {articles
                          .filter((art) => art.category === '現地グルメ' || art.category === '取材レポ')
                          .slice(0, 6)
                          .map((art) => (
                            <div 
                              key={art.id} 
                              onClick={() => handleSelectArticle(art.id)}
                              className="cursor-pointer group flex items-start space-x-3 border-b border-slate-50 pb-3 last:border-b-0 md:last:border-b"
                            >
                              {art.image && (
                                <div className="w-[80px] h-[55px] rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-3xs group-hover:shadow-2xs transition duration-300">
                                  <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                                </div>
                              )}
                              <div className="min-w-0 space-y-1">
                                <span className="inline-block px-1 rounded text-[7px] font-black bg-amber-50 text-amber-700 border border-amber-100 uppercase">
                                  {art.category === '取材レポ' ? `${art.category} • ${art.reportSubCategory}` : art.category}
                                </span>
                                <h5 className="text-[11px] font-extrabold text-slate-900 group-hover:text-amber-700 leading-snug line-clamp-2">
                                  {art.title}
                                </h5>
                                <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-bold">
                                  <span>{art.source}</span>
                                  <span>•</span>
                                  <span>👁️ {art.viewsCount}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              )}
            </>
          )}
          {/* 記事詳細表示ビュー */}
          {currentView === 'article' && selectedArticle && (
            <ScrollReveal>
              <div className="cozy-card overflow-hidden text-left bg-white">
                
                {/* 戻るボタン */}
                <div className="bg-slate-50 border-b border-[#e9e4db] px-4 py-2 flex items-center justify-between">
                  <button
                    onClick={() => navigateToView('portal')}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-teal-700 font-bold transition-all hover-wiggle"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>トピックス一覧に戻る</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{selectedArticle.date}</span>
                </div>

                <div className="p-6 md:p-8">
                  
                  <h1 className="text-lg md:text-xl font-black text-slate-900 leading-snug mb-3">
                    {selectedArticle.title}
                  </h1>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-b border-[#e9e4db] pb-3 mb-5">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100 uppercase">{selectedArticle.category}</span>
                      <span>ソース: <span className="text-slate-700 font-extrabold">{selectedArticle.source}</span></span>
                    </div>
                    <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-100">
                      👁️ {selectedArticle.viewsCount.toLocaleString()} 閲覧
                    </span>
                  </div>

                  {/* 「ざっくり言うと」 (3点要約ブロック) */}
                  {selectedArticle.takeaways && (
                    <div className="bg-[#fcfbf9] border-l-4 border-teal-600 p-4.5 mb-6 rounded-r-xl border border-y-[#e9e4db] border-r-[#e9e4db]">
                      <h4 className="text-[11px] font-black text-teal-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <span>💡</span>
                        <span>ざっくり言うと (AI 3点まとめ)</span>
                      </h4>
                      <ul className="space-y-2 text-xs font-bold text-slate-700 list-inside">
                        {selectedArticle.takeaways.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-teal-600 mt-0.5 shrink-0">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 店舗基本情報 */}
                  {selectedArticle.restaurantInfo && (
                    <div className="bg-[#faf7f2] border border-[#e9e4db] p-4.5 mb-6 rounded-xl text-xs">
                      <h4 className="text-[11px] font-black text-[#0f766e] uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-[#e9e4db]/80 pb-2">
                        <span>🍴</span>
                        <span>店舗基本情報</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 font-bold text-slate-700">
                        <div className="flex justify-between border-b border-dashed border-[#e9e4db]/60 pb-1.5">
                          <span className="text-slate-400">平均予算</span>
                          <span>{selectedArticle.restaurantInfo.budgetLAK} ({selectedArticle.restaurantInfo.budgetJPY})</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-[#e9e4db]/60 pb-1.5">
                          <span className="text-slate-400">おすすめメニュー</span>
                          <span>{selectedArticle.restaurantInfo.recommendedMenu}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-[#e9e4db]/60 pb-1.5">
                          <span className="text-slate-400">営業時間</span>
                          <span>{selectedArticle.restaurantInfo.businessHours}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-[#e9e4db]/60 pb-1.5">
                          <span className="text-slate-400">定休日</span>
                          <span>{selectedArticle.restaurantInfo.holiday}</span>
                        </div>
                      </div>
                      {selectedArticle.restaurantInfo.mapLink && (
                        <div className="mt-4 flex justify-end">
                          <a 
                            href={selectedArticle.restaurantInfo.mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0f766e] text-white rounded-lg hover:bg-teal-800 transition-colors text-[10px] font-bold shadow-2xs hover:shadow-xs"
                          >
                            📍 Googleマップで地図を開く
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI生成イメージ */}
                  {selectedArticle.image && (
                    <div className="relative w-full h-[280px] bg-slate-100 overflow-hidden border border-slate-200 rounded-lg mb-6 shadow-2xs">
                      <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
                      <span className="absolute bottom-3 right-3 bg-black/60 text-[9px] text-white font-bold px-2 py-1 rounded">
                        🤖 AI生成イメージ
                      </span>
                    </div>
                  )}

                  {/* 記事本文 */}
                  <div className="prose prose-slate prose-sm max-w-none text-slate-600">
                    {parseMarkdownToJsx(selectedArticle.content)}
                  </div>

                  <div className="mt-8 pt-5 border-t border-[#e9e4db] flex justify-center">
                    <button
                      onClick={() => navigateToView('portal')}
                      className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs hover-wiggle"
                    >
                      ニュース一覧に戻る
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* 当サイトについて */}
          {currentView === 'about' && (
            <ScrollReveal>
              <div className="cozy-card p-6 md:p-8 text-left bg-white space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 border-b border-[#e9e4db] pb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-teal-700 rounded-full"></span>
                  ラオス日刊ダイジェストについて
                </h2>
                <p className="text-xs leading-relaxed text-slate-600">
                  「ラオス日刊ダイジェスト」は、ラオス国内の主要ソーシャルメディア（主にFacebook）や地元の主要報道メディアから話題のトピックスを抽出し、AIを活用して日本人が理解しやすい構成で整理したデイリー・インテリジェンス・ポータルです。
                </p>
                <button onClick={() => navigateToView('portal')} className="mt-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition hover-wiggle">
                  ← ポータルトップへ戻る
                </button>
              </div>
            </ScrollReveal>
          )}

          {/* プライバシーポリシー */}
          {currentView === 'privacy' && (
            <ScrollReveal>
              <div className="cozy-card p-6 md:p-8 text-left bg-white space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 border-b border-[#e9e4db] pb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-teal-700 rounded-full"></span>
                  プライバシーポリシー
                </h2>
                <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs mb-1">1. クッキー（Cookie）情報の取り扱いについて</h3>
                    <p>
                      当サイトでは、利用者の閲覧状況の分析や、利便性の向上を目的としてCookie（クッキー）を利用することがあります。Cookieは個人特定情報を収集するものではありません。ブラウザの設定によりCookieの無効化が可能です。
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs mb-1">2. 個人情報の管理について</h3>
                    <p>
                      当サイトは、ユーザーのプライバシー保護を重視し、収集されたデータは適切かつ安全に管理いたします。
                    </p>
                  </div>
                </div>
                <button onClick={() => navigateToView('portal')} className="mt-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition hover-wiggle">
                  ← ポータルトップへ戻る
                </button>
              </div>
            </ScrollReveal>
          )}

          {/* 免責事項・利用規約 */}
          {currentView === 'terms' && (
            <ScrollReveal>
              <div className="cozy-card p-6 md:p-8 text-left bg-white space-y-4">
                <h2 className="text-base font-extrabold text-slate-900 border-b border-[#e9e4db] pb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-teal-700 rounded-full"></span>
                  免責事項・利用規約
                </h2>
                <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs mb-1">1. 情報の正確性について</h3>
                    <p>
                      当サイトで掲載しているニュースおよび情報は、AIを用いて自動的に抽出・構成・日本語翻訳したものです。AIによる翻訳・要約プロセスの性質上、不正確な記述が含まれる場合があり、いかなる責任も負いかねます。
                    </p>
                  </div>
                </div>
                <button onClick={() => navigateToView('portal')} className="mt-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition hover-wiggle">
                  ← ポータルトップへ戻る
                </button>
              </div>
            </ScrollReveal>
          )}

          {/* 管理者用記事作成コンソール */}
          {currentView === 'admin' && (
            <ScrollReveal>
              <div className="cozy-card p-6 md:p-8 text-left bg-white space-y-6">
                <div className="border-b border-[#e9e4db] pb-3 flex justify-between items-center">
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-amber-600 rounded-full"></span>
                    <span>管理者用記事作成コンソール</span>
                  </h2>
                  <button onClick={() => navigateToView('portal')} className="text-xs text-slate-500 hover:text-teal-700 font-bold">
                    ← 閉じる
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* カテゴリ ＆ サブカテゴリ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">カテゴリー</label>
                      <select 
                        value={adminCategory} 
                        onChange={(e) => setAdminCategory(e.target.value)}
                        className="w-full border border-[#e9e4db] rounded-lg p-2 font-bold text-slate-700 bg-white"
                      >
                        {['主要', '経済', '社会', '国際', '観光', '現地グルメ', '取材レポ', '基本情報', '生活情報'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {adminCategory === '取材レポ' && (
                      <div>
                        <label className="block text-slate-500 font-bold mb-1.5">取材サブカテゴリー</label>
                        <select 
                          value={adminReportSubCategory} 
                          onChange={(e) => setAdminReportSubCategory(e.target.value)}
                          className="w-full border border-[#e9e4db] rounded-lg p-2 font-bold text-slate-700 bg-white"
                        >
                          {['観光地', '生活お役立ち', '企業紹介'].map(sc => (
                            <option key={sc} value={sc}>{sc}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {adminCategory === '現地グルメ' && (
                      <div>
                        <label className="block text-slate-500 font-bold mb-1.5">グルメサブカテゴリー</label>
                        <select 
                          value={adminGourmetSubCategory} 
                          onChange={(e) => setAdminGourmetSubCategory(e.target.value)}
                          className="w-full border border-[#e9e4db] rounded-lg p-2 font-bold text-slate-700 bg-white"
                        >
                          {['ラオス料理', 'アジア・各国料理', 'カフェ・洋菓子', 'ローカル・屋台', 'BBQ・バー'].map(sc => (
                            <option key={sc} value={sc}>{sc}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1.5">タイトル</label>
                    <input 
                      type="text" 
                      value={adminTitle}
                      onChange={(e) => setAdminTitle(e.target.value)}
                      placeholder="記事のタイトルを入力..."
                      className="w-full border border-[#e9e4db] rounded-lg p-2 font-bold text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1.5">要約 (概要)</label>
                    <textarea 
                      value={adminSummary}
                      onChange={(e) => setAdminSummary(e.target.value)}
                      placeholder="記事の短い要約を入力..."
                      rows="2"
                      className="w-full border border-[#e9e4db] rounded-lg p-2 font-bold text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">読了時間</label>                      <label className="block text-slate-500 font-bold mb-1.5">読了時間</label>
                      <input 
                        type="text" 
                        value={adminReadTime}
                        onChange={(e) => setAdminReadTime(e.target.value)}
                        className="w-full border border-[#e9e4db] rounded-lg p-2 font-bold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1.5">情報ソース</label>
                      <input 
                        type="text" 
                        value={adminSource}
                        onChange={(e) => setAdminSource(e.target.value)}
                        className="w-full border border-[#e9e4db] rounded-lg p-2 font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  {/* グルメ専用情報 */}
                  {adminCategory === '現地グルメ' && (
                    <div className="bg-[#faf7f2] border border-[#e9e4db] p-4 rounded-xl space-y-3">
                      <h4 className="font-bold text-[#c2410c] border-b border-[#e9e4db] pb-1 flex items-center gap-1.5">
                        <span>🍴</span>
                        <span>店舗基本情報 (グルメ専用)</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">平均予算 (現地通貨)</label>
                          <input 
                            type="text" 
                            value={adminBudgetLAK}
                            onChange={(e) => setAdminBudgetLAK(e.target.value)}
                            className="w-full border border-[#e9e4db] rounded-lg p-1.5 font-bold text-slate-700 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">平均予算 (日本円換算)</label>
                          <input 
                            type="text" 
                            value={adminBudgetJPY}
                            onChange={(e) => setAdminBudgetJPY(e.target.value)}
                            className="w-full border border-[#e9e4db] rounded-lg p-1.5 font-bold text-slate-700 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">おすすめメニュー</label>
                          <input 
                            type="text" 
                            value={adminRecommendedMenu}
                            onChange={(e) => setAdminRecommendedMenu(e.target.value)}
                            placeholder="例：特製カオピャック・セン"
                            className="w-full border border-[#e9e4db] rounded-lg p-1.5 font-bold text-slate-700 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">営業時間</label>
                          <input 
                            type="text" 
                            value={adminBusinessHours}
                            onChange={(e) => setAdminBusinessHours(e.target.value)}
                            className="w-full border border-[#e9e4db] rounded-lg p-1.5 font-bold text-slate-700 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">定休日</label>
                          <input 
                            type="text" 
                            value={adminHoliday}
                            onChange={(e) => setAdminHoliday(e.target.value)}
                            className="w-full border border-[#e9e4db] rounded-lg p-1.5 font-bold text-slate-700 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 font-bold mb-1">Googleマップリンク</label>
                          <input 
                            type="text" 
                            value={adminMapLink}
                            onChange={(e) => setAdminMapLink(e.target.value)}
                            placeholder="https://maps.google.com/..."
                            className="w-full border border-[#e9e4db] rounded-lg p-1.5 font-bold text-slate-700 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3点要約 */}
                  <div className="space-y-2">
                    <label className="block text-slate-500 font-bold mb-1">ざっくり言うと (3点まとめ)</label>
                    <input 
                      type="text" 
                      value={adminTakeaway1}
                      onChange={(e) => setAdminTakeaway1(e.target.value)}
                      placeholder="ポイント1を入力..."
                      className="w-full border border-[#e9e4db] rounded-lg p-2 font-bold text-slate-700 mb-1"
                    />
                    <input 
                      type="text" 
                      value={adminTakeaway2}
                      onChange={(e) => setAdminTakeaway2(e.target.value)}
                      placeholder="ポイント2を入力..."
                      className="w-full border border-[#e9e4db] rounded-lg p-2 font-bold text-slate-700 mb-1"
                    />
                    <input 
                      type="text" 
                      value={adminTakeaway3}
                      onChange={(e) => setAdminTakeaway3(e.target.value)}
                      placeholder="ポイント3を入力..."
                      className="w-full border border-[#e9e4db] rounded-lg p-2 font-bold text-slate-700"
                    />
                  </div>

                  {/* 画像ドラッグ＆ドロップエリア */}
                  <div>
                    <label className="block text-slate-500 font-bold mb-1.5">写真 (ドラッグ＆ドロップまたはクリック)</label>
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileChange(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => document.getElementById('admin-image-input').click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                        isDragOver ? 'border-[#c2410c] bg-amber-50/10' : 'border-[#e9e4db] hover:border-slate-400 bg-slate-50/30'
                      }`}
                    >
                      <input 
                        id="admin-image-input"
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileChange(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      {adminImagePreview ? (
                        <div className="space-y-3">
                          <img src={adminImagePreview} alt="プレビュー" className="max-h-[140px] mx-auto rounded-lg object-contain border border-[#e9e4db]" />
                          <div className="text-[10px] text-slate-500 font-bold">
                            選択された画像名: <span className="text-teal-700 font-mono select-all">{adminImageFilename}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 py-2 text-slate-400 font-bold">
                          <div className="text-lg">📸</div>
                          <div>ここに写真をドロップするか、クリックしてファイルを選択</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 本文 */}
                  <div>
                    <label className="block text-slate-500 font-bold mb-1.5">本文 (Markdown形式)</label>
                    <textarea 
                      value={adminContent}
                      onChange={(e) => setAdminContent(e.target.value)}
                      placeholder="# 大見出し\n本文を入力してください...\n\n## 小見出し\n箇条書きなど..."
                      rows="8"
                      className="w-full border border-[#e9e4db] rounded-lg p-2.5 font-bold text-slate-700 font-mono"
                    />
                  </div>

                  {/* ボタン */}
                  <div className="pt-2">
                    <button 
                      onClick={handleGenerateJSON}
                      className="w-full bg-[#c2410c] hover:bg-amber-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition duration-200 shadow-2xs hover:shadow-xs flex justify-center items-center gap-1.5"
                    >
                      <span>✨</span>
                      <span>記事データを生成する (JSON)</span>
                    </button>
                  </div>

                  {/* 生成されたJSON */}
                  {generatedJson && (
                    <div className="bg-[#1f2937] text-teal-400 rounded-xl p-4.5 space-y-3 mt-4 border border-slate-700">
                      <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                        <span className="font-mono text-[10px] text-slate-400 font-bold">OUTPUT JSON</span>
                        <button 
                          onClick={handleCopyToClipboard}
                          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-[9px] px-2.5 py-1 rounded transition-colors"
                        >
                          {copySuccess ? '✓ コピー完了！' : '📋 クリップボードにコピー'}
                        </button>
                      </div>
                      <pre className="font-mono text-[10px] leading-relaxed overflow-x-auto select-all max-h-[200px] scrollbar-none">
                        {generatedJson}
                      </pre>
                      <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-300 font-bold leading-relaxed space-y-1.5">
                        <div className="text-amber-400 text-xs">⚠️ 投稿を反映するための最終手順</div>
                        <div>1. 上記のJSONデータをコピーして、プロジェクト内の <span className="text-emerald-400 font-mono font-black">src/data/news.json</span> の配列の末尾（最後の <span className="font-mono font-black">]</span> の手前）にカンマで区切って貼り付けてください。</div>
                        {adminImageFilename && (
                          <div>2. ドラッグした写真を <span className="text-emerald-400 font-mono font-black">{adminImageFilename}</span> というファイル名で、パソコン上の <span className="text-emerald-400 font-mono font-black">public/</span> フォルダ内にコピーしてください。</div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </ScrollReveal>
          )}
        </main>

        {/* 右側：サイドバーエリア */}
        <aside className="lg:col-span-4 space-y-4">
          
          {/* お天気 & 為替レート */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* お天気 */}
            <ScrollReveal>
              <div className="cozy-card p-4 text-left bg-white h-full flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-[#e9e4db] pb-2 mb-3 flex justify-between items-center">
                    <span>ビエンチャンの天気</span>
                    {weatherData.loading && <span className="animate-pulse text-[8px] text-slate-400">更新中...</span>}
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-700">首都ビエンチャン</div>
                      <div className="text-xl font-black text-slate-900 leading-none">
                        {weatherData.loading ? '--' : `${weatherData.temp}°C`}
                      </div>
                      <div className="text-[9px] text-slate-400 font-bold">
                        湿度 {weatherData.loading ? '--' : `${weatherData.humidity}%`} • 風速 {weatherData.loading ? '--' : `${weatherData.windSpeed}m/s`}
                      </div>
                    </div>
                    <div className="text-3xl text-slate-700 select-none hover-wiggle">
                      {weatherData.icon}
                    </div>
                  </div>
                </div>
                <div className="text-[7px] text-slate-400 font-mono font-bold border-t border-slate-50 pt-2 mt-2 flex justify-between">
                  <span>ソース: Open-Meteo</span>
                  <span>リアルタイム同期中</span>
                </div>
              </div>
            </ScrollReveal>

            {/* 為替レート */}
            <ScrollReveal>
              <div className="cozy-card p-4 text-left bg-white h-full flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-[#e9e4db] pb-2 mb-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img src="/coin_icon.png" alt="" className="w-6 h-6 object-contain" />
                      <span>本日の為替レート (LAK)</span>
                    </div>
                    {rateData.loading && <span className="animate-pulse text-[8px] text-slate-400">更新中...</span>}
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">1 JPY (日本円)</span>
                      <span className="text-slate-800 font-black">
                        {rateData.loading ? '--' : `${rateData.jpy} LAK`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">1 USD (米ドル)</span>
                      <span className="text-slate-800 font-black">
                        {rateData.loading ? '--' : `${rateData.usd.toLocaleString()} LAK`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">1 THB (タイバーツ)</span>
                      <span className="text-slate-800 font-black">
                        {rateData.loading ? '--' : `${rateData.thb.toLocaleString()} LAK`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[7px] text-slate-400 font-mono font-bold border-t border-slate-50 pt-2 mt-2 flex justify-between">
                  <span>ソース: BCEL公示レート平均値参照</span>
                  <span>毎時自動更新</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* アクセスランキング (3Dカテゴリミニアイコン付) */}
          <ScrollReveal>
            <div className="cozy-card p-4 text-left bg-white">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-[#e9e4db] pb-2 mb-3">
                アクセスランキング
              </h4>
              <div className="space-y-3.5">
                {rankedArticles.slice(0, 5).map((art, idx) => {
                  const matchedCat = Object.keys(categoryMap).find(k => categoryMap[k].name === art.category);
                  const iconPath = categoryMap[matchedCat]?.icon;
                  return (
                    <div 
                      key={art.id}
                      onClick={() => handleSelectArticle(art.id)}
                      className="cursor-pointer group flex items-start gap-2.5"
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 border ${
                        idx === 0 ? 'bg-teal-700 text-white font-black border-teal-800 shadow-xs' :
                        idx === 1 ? 'bg-teal-100 text-teal-800 border-teal-200' :
                        idx === 2 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <span className="text-[11px] font-bold text-slate-700 leading-snug group-hover:text-teal-700 group-hover:underline line-clamp-2">
                          {art.title}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {iconPath && (
                            <img src={iconPath} alt="" className="w-6 h-6 object-contain mix-blend-multiply" />
                          )}
                          <span className="text-[9px] text-slate-400 font-bold">👁️ {art.viewsCount.toLocaleString()} 閲覧</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        </aside>

      </div>

      {/* Livedoor風ポータルフッター */}
      <footer className="bg-white border-t border-[#e9e4db] mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 font-bold text-slate-600 mb-6">
            <button onClick={() => navigateToView('about')} className="hover:text-teal-700 transition-colors">ラオス日刊ダイジェストについて</button>
            <button onClick={() => navigateToView('terms')} className="hover:text-teal-700 transition-colors">免責事項・利用規約</button>
            <button onClick={() => navigateToView('privacy')} className="hover:text-teal-700 transition-colors">プライバシーポリシー</button>
          </div>
          <div className="text-center font-mono text-[9px] text-slate-400 flex items-center justify-center gap-1.5">
            <span>© {new Date().getFullYear()} Lao Daily Digest. All rights reserved.</span>
            <button onClick={handleAdminAccess} className="hover:opacity-80 transition-opacity" title="管理者ツール">🔑</button>
          </div>
        </div>
      </footer>

    </div>
  );
}