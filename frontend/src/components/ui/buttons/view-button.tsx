"use client";

import React from "react";

interface ViewButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
}

/**
 * View Button Component
 * ปุ่มดูรายละเอียดพร้อม Micro-animation ดวงตาขยายโฟกัสเมื่อ Hover
 */
export default function ViewButton({
  onClick,
  className = "",
  type = "button",
  title = "ดูรายละเอียด",
}: ViewButtonProps) {
  return (
    <>
      <button
        type={type}
        onClick={onClick}
        title={title}
        aria-label={title}
        className={`view-btn ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="eye-icon"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" className="eye-pupil" />
        </svg>
      </button>

      <style jsx>{`
        .view-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: #1e293b; /* Slate-800 Neutral Base */
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          position: relative;
        }

        .eye-icon {
          width: 20px;
          height: 20px;
          color: #ffffff;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .eye-pupil {
          transition: transform 0.3s ease;
          transform-origin: center;
        }

        /* Hover States & Animation */
        .view-btn:hover {
          background-color: #0d9488; /* Teal-600 สื่อถึงการส่อง/ตรวจสอบ/Info */
          box-shadow: 0px 6px 15px rgba(13, 148, 136, 0.4);
          transform: translateY(-2px);
        }

        .view-btn:hover .eye-icon {
          transform: scale(1.15);
        }

        .view-btn:hover .eye-pupil {
          animation: pupil-bounce 0.6s ease-in-out infinite alternate;
        }

        .view-btn:active {
          transform: translateY(0px) scale(0.95);
        }

        @keyframes pupil-bounce {
          0% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1.35);
          }
        }
      `}</style>
    </>
  );
}