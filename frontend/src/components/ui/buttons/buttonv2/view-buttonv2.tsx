"use client";

import React from "react";

interface ViewButtonV2Props {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
}

/**
 * View Button V2 Component
 * ปุ่มดูรายละเอียดสไตล์ Minimal Icon Button (Flat Design)
 * มี Animation เปลือกตาเปิดและรูม่านตาขยายเมื่อ Hover
 */
export default function ViewButtonV2({
  onClick,
  className = "",
  type = "button",
  title = "ดูรายละเอียด",
}: ViewButtonV2Props) {
  return (
    <>
      <button
        type={type}
        onClick={onClick}
        title={title}
        aria-label={title}
        className={`view-btn-v2 ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="eye-icon-v2"
        >
          {/* ขอบดวงตา (Eye Outline) */}
          <path
            d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
            className="eye-lid-v2"
          />
          {/* รูม่านตา (Pupil) */}
          <circle cx="12" cy="12" r="3" className="eye-pupil-v2" />
        </svg>
      </button>

      <style jsx>{`
        .view-btn-v2 {
          background: transparent;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 6px;
          color: #64748b; /* สีไอคอนปกติ Slate-500 กลมกลืนกับ Data Table */
          transition: color 0.2s ease, transform 0.2s ease;
          border-radius: 6px;
        }

        .eye-icon-v2 {
          width: 18px;
          height: 18px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .eye-pupil-v2 {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
          fill: currentColor;
        }

        /* Hover States & Micro-animation */
        .view-btn-v2:hover {
          color: #0d9488; /* Teal-600 สื่อถึงการตรวจสอบข้อมูล / View Details */
        }

        .view-btn-v2:hover .eye-icon-v2 {
          transform: scale(1.12);
        }

        .view-btn-v2:hover .eye-pupil-v2 {
          animation: pupil-expand-v2 0.5s ease-in-out infinite alternate;
        }

        .view-btn-v2:active {
          transform: scale(0.9);
        }

        @keyframes pupil-expand-v2 {
          0% {
            transform: scale(0.85);
          }
          100% {
            transform: scale(1.3);
          }
        }
      `}</style>
    </>
  );
}
