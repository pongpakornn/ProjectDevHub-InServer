"use client";

import React from "react";

interface EditButtonV2Props {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
}

export default function EditButtonV2({
  onClick,
  className = "",
  type = "button",
  title = "แก้ไขข้อมูล",
}: EditButtonV2Props) {
  return (
    <>
      <button
        type={type}
        onClick={onClick}
        title={title}
        aria-label={title}
        className={`edit-btn-v2 ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pencil-icon-v2"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      </button>

      <style jsx>{`
        .edit-btn-v2 {
          background: transparent;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 6px;
          color: #64748b; /* สีไอคอนปกติ (slate-500) */
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .pencil-icon-v2 {
          width: 17px;
          height: 17px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .edit-btn-v2:hover {
          color: #2563eb; /* เปลี่ยนเป็นสีน้ำเงินตอน Hover */
        }

        .edit-btn-v2:hover .pencil-icon-v2 {
          animation: pencil-wiggle-v2 0.5s ease-in-out infinite alternate;
        }

        .edit-btn-v2:active {
          transform: scale(0.9);
        }

        @keyframes pencil-wiggle-v2 {
          0% {
            transform: rotate(0deg) translate(0, 0);
          }
          25% {
            transform: rotate(-12deg) translate(-1px, 1px);
          }
          75% {
            transform: rotate(8deg) translate(1px, -1px);
          }
          100% {
            transform: rotate(-5deg) translate(0, 0);
          }
        }
      `}</style>
    </>
  );
}