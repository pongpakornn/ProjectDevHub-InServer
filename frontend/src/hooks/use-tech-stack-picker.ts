"use client";

import { useEffect, useMemo, useState } from "react";
import { DropdownOption } from "@/components/ui/inputs/dropdown";
import { getTechStackCatalog, TechStackCatalogOption } from "@/lib/project-solo-api";

// ===========================================================================
// Hook กลางสำหรับ Dropdown "ประเภท -> ชื่อ" แบบ Cascading ของ Stack/Library
// ใช้ร่วมกันทั้ง Solo Work, Team Work, และ Flow Diagram (จุดเดียวที่ดูแล Logic นี้)
//
// พฤติกรรม:
// - โหลดตัวเลือก "ประเภท" (TYPE) ครั้งเดียวตอน Mount
// - Dropdown "ชื่อ" (NAME) ถูกปิดใช้งานจนกว่าจะเลือก "ประเภท" ก่อน
// - ทุกครั้งที่เปลี่ยน "ประเภท" -> เคลียร์ค่า "ชื่อ" ที่เลือกไว้ทันที แล้วยิง API ใหม่พร้อม typeId
//   เพื่อกรองรายชื่อฝั่ง Backend ให้เหลือเฉพาะที่ตรงกับ TypeId นั้น (ไม่ได้ Filter ฝั่ง Client จาก List เดิม)
// ===========================================================================
export function useTechStackPicker() {
  const [typeCatalog, setTypeCatalog] = useState<TechStackCatalogOption[]>([]);
  const [layerCatalog, setLayerCatalog] = useState<TechStackCatalogOption[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [nameCatalog, setNameCatalog] = useState<TechStackCatalogOption[]>([]);
  const [isLoadingNames, setIsLoadingNames] = useState(false);

  // โหลด "ประเภท" + "Layer" ครั้งเดียว (เรียกแบบไม่ระบุ typeId -> Backend คืนเฉพาะ TYPE/LAYER ไม่คืน NAME)
  useEffect(() => {
    getTechStackCatalog(null)
      .then((catalog) => {
        setTypeCatalog(catalog.filter((c) => c.optionGroup === "TYPE"));
        setLayerCatalog(catalog.filter((c) => c.optionGroup === "LAYER"));
      })
      .catch((err) => console.error("โหลดประเภท Stack/Library ไม่สำเร็จ", err));
  }, []);

  // ทุกครั้งที่ Type เปลี่ยน -> ยิง API ใหม่พร้อม typeId เพื่อกรอง "ชื่อ" ฝั่ง Backend
  useEffect(() => {
    if (selectedTypeId == null) {
      setNameCatalog([]);
      return;
    }
    let cancelled = false;
    setIsLoadingNames(true);
    getTechStackCatalog(selectedTypeId)
      .then((catalog) => {
        if (cancelled) return;
        setNameCatalog(catalog.filter((c) => c.optionGroup === "NAME"));
      })
      .catch((err) => console.error("โหลดรายชื่อ Stack/Library ไม่สำเร็จ", err))
      .finally(() => {
        if (!cancelled) setIsLoadingNames(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedTypeId]);

  const typeOptions: DropdownOption[] = useMemo(
    () => typeCatalog.map((c) => ({ label: c.optionValue, value: String(c.catalogId) })),
    [typeCatalog]
  );

  const nameOptions: DropdownOption[] = useMemo(
    () => nameCatalog.map((c) => ({ label: c.optionValue, value: c.optionValue })),
    [nameCatalog]
  );

  const layerOptions: DropdownOption[] = useMemo(
    () => layerCatalog.map((c) => ({ label: c.optionValue, value: c.optionValue })),
    [layerCatalog]
  );

  const selectedTypeLabel = useMemo(
    () => typeCatalog.find((c) => c.catalogId === selectedTypeId)?.optionValue ?? "",
    [typeCatalog, selectedTypeId]
  );

  // เปลี่ยน "ประเภท" -> เคลียร์ค่า "ชื่อ" ทันที (Step 4: เปลี่ยนค่า Name ทันทีเมื่อ Type เปลี่ยน)
  const handleTypeChange = (value: string) => {
    setSelectedTypeId(value ? Number(value) : null);
    setSelectedName("");
  };

  const reset = () => {
    setSelectedTypeId(null);
    setSelectedName("");
  };

  return {
    typeOptions,
    nameOptions,
    layerOptions,
    selectedTypeId,
    selectedTypeLabel,
    selectedName,
    setSelectedName,
    handleTypeChange,
    isNameDisabled: selectedTypeId == null,
    isLoadingNames,
    reset,
  };
}
