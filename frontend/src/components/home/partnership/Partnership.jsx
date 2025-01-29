import React from 'react';
import ZklendLogo from '@/assets/images/zklend_logo.svg';
import EkuboLogo from '@/assets/images/ekubo_logo.svg';
import Star from '@/assets/particles/star.svg';

const Partnership = () => {
  const logos = [];
  const logoCount = 20; // Number of logo pairs

  for (let i = 0; i < logoCount; i++) {
    logos.push(<img src={ZklendLogo} alt="zklend-logo" key={`zklend-${i}`} className="w-36 h-24 mx-5 shrink-0" />);
    logos.push(<img src={EkuboLogo} alt="ekubo-logo" key={`ekubo-${i}`} className="w-36 h-24 mx-5 shrink-0" />);
  }

  const starData = [{ top: '10%', left: '75%', size: '15%' }];

  return (
    <div className="relative">
      {starData.map((star, index) => (
        <img
          src={Star}
          alt="star"
          key={index}
          className="absolute"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
          }}
        />
      ))}
      <h1 className="text-center font-bold text-white mb-32 text-4xl md:text-3xl sm:text-2xl">Partnership</h1>
      <div className="w-screen h-36 bg-main-gradient flex relative overflow-hidden">
        <div className="partnership-logo">{logos}</div>
      </div>
    </div>
  );
};

export default Partnership;
