'use client';

import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';

export default function RootNotFound() {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <html lang="en">
      <head>
        <title>404 - Page Not Found | Rahal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images/logo-2.png" type="image/png" />
        <style>{`
          body {
            margin: 0;
            background-color: #fcf9f4;
            color: #1c1c19;
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow: hidden;
          }
          .container {
            max-width: 480px;
            width: 90%;
            text-align: center;
            background: rgba(252, 249, 244, 0.8);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(130, 117, 100, 0.2);
            padding: 3rem 2rem;
            border-radius: 24px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
            position: relative;
            z-index: 10;
          }
          .icon-container {
            width: 80px;
            height: 80px;
            background: rgba(126, 87, 0, 0.1);
            border: 1px solid rgba(126, 87, 0, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 2rem;
            color: #7e5700;
          }
          .title {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
          }
          .subtitle {
            font-size: 1rem;
            color: #504536;
            margin-bottom: 2rem;
            line-height: 1.6;
          }
          .btn {
            background-color: #7e5700;
            color: #ffffff;
            border: none;
            padding: 0.8rem 2rem;
            font-size: 0.95rem;
            font-weight: 600;
            border-radius: 9999px;
            cursor: pointer;
            transition: all 0.2s ease-out;
            box-shadow: 0 4px 6px -1px rgba(126, 87, 0, 0.2);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            text-decoration: none;
          }
          .btn:hover {
            background-color: #c8922a;
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(126, 87, 0, 0.3);
          }
          .btn:active {
            transform: translateY(0);
          }
          .bg-blur-1 {
            position: absolute;
            top: 10%;
            left: 10%;
            width: 300px;
            height: 300px;
            background: rgba(126, 87, 0, 0.08);
            filter: blur(100px);
            border-radius: 50%;
            z-index: 1;
          }
          .bg-blur-2 {
            position: absolute;
            bottom: 10%;
            right: 10%;
            width: 300px;
            height: 300px;
            background: rgba(54, 98, 134, 0.08);
            filter: blur(100px);
            border-radius: 50%;
            z-index: 1;
          }
          .arabic-text {
            direction: rtl;
            margin-top: 1.5rem;
            border-top: 1px dashed rgba(130, 117, 100, 0.2);
            padding-top: 1.5rem;
          }
        `}</style>
      </head>
      <body>
        <div className="bg-blur-1" />
        <div className="bg-blur-2" />
        
        <div className="container">
          <div className="icon-container">
            <Compass style={{ width: '40px', height: '40px', transform: 'rotate(45deg)' }} />
          </div>

          <div className="english-text">
            <h1 className="title">Lost in the Sands?</h1>
            <p className="subtitle">The page you are looking for has been buried in time or doesn't exist.</p>
          </div>

          <div className="arabic-text">
            <h1 className="title" style={{ fontSize: '1.8rem' }}>هل تِهت في الرمال؟</h1>
            <p className="subtitle" style={{ fontSize: '0.9rem' }}>يبدو أن الصفحة التي تبحث عنها قد دُفنت مع مرور الزمن أو أنها غير موجودة.</p>
          </div>

          <button onClick={handleGoHome} className="btn" style={{ marginTop: '1.5rem' }}>
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
            <span>Return to Oasis / العودة إلى الواحة</span>
          </button>
        </div>
      </body>
    </html>
  );
}
