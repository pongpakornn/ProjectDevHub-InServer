"use client";

import React from "react";

interface EditButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
}

/**
 * Edit Button Component
 * ปุ่มแก้ไขพร้อม Micro-animation ดินสอขยับเขียนเมื่อ Hover
 */
export default function EditButton({
  onClick,
  className = "",
  type = "button",
  title = "แก้ไขข้อมูล",
}: EditButtonProps) {
  return (
    <>
      <button
        type={type}
        onClick={onClick}
        title={title}
        aria-label={title}
        className={`edit-btn ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pencil-icon"
        >
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
          <path d="m15 5 4 4" />
        </svg>
      </button>

      <style jsx>{`
        .edit-btn {
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

        .pencil-icon {
          width: 18px;
          height: 18px;
          color: #ffffff;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Hover States & Animation */
        .edit-btn:hover {
          background-color: #2563eb; /* Blue-600 สื่อถึงการแก้ไข/การจัดการ */
          box-shadow: 0px 6px 15px rgba(37, 99, 235, 0.4);
          transform: translateY(-2px);
        }

        .edit-btn:hover .pencil-icon {
          animation: pencil-wiggle 0.5s ease-in-out infinite alternate;
        }

        .edit-btn:active {
          transform: translateY(0px) scale(0.95);
        }

        @keyframes pencil-wiggle {
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