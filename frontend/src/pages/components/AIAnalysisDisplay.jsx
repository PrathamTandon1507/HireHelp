import React from 'react';

const AIAnalysisDisplay = ({ text }) => {
  if (!text || typeof text !== 'string') return null;

  // Attempt to parse STRENGTHS and IMPROVEMENTS
  const strengthsIndex = text.indexOf('STRENGTHS:');
  const improvementsIndex = text.indexOf('IMPROVEMENTS');

  if (strengthsIndex !== -1 && improvementsIndex !== -1) {
    const generalText = text.substring(0, strengthsIndex).trim();
    const strengthsText = text.substring(strengthsIndex + 10, improvementsIndex).trim();
    const improvementsText = text.substring(improvementsIndex).replace(/^IMPROVEMENTS[^:]*:/, '').trim();

    const parseList = (str) =>
      str
        .split('•')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

    const strengths = parseList(strengthsText);
    const improvements = parseList(improvementsText);

    return (
      <div className="space-y-4 text-sm mt-2">
        {generalText && (
          <p className="text-[#cbd5e1] leading-relaxed mb-4">{generalText}</p>
        )}

        {strengths.length > 0 && (
          <div className="bg-gradient-to-br from-[#10b981]/10 to-[#047857]/5 border border-[#10b981]/20 rounded-xl p-4 shadow-inner">
            <h4 className="text-xs font-bold text-[#10b981] uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="text-lg">🌟</span> Key Strengths
            </h4>
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-[#cbd5e1] items-start">
                  <span className="text-[#10b981] font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {improvements.length > 0 && (
          <div className="bg-gradient-to-br from-[#f59e0b]/10 to-[#b45309]/5 border border-[#f59e0b]/20 rounded-xl p-4 shadow-inner">
            <h4 className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="text-lg">📈</span> Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {improvements.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-[#cbd5e1] items-start">
                  <span className="text-[#f59e0b] font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Fallback for unstructured text
  return (
    <div className="text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-wrap mt-2 p-4 bg-[#0f172a]/40 border border-[#334155]/30 rounded-xl">
      {text}
    </div>
  );
};

export default AIAnalysisDisplay;
