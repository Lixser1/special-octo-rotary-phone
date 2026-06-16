"use client";

import type { Skill, SkillLevel } from "@/lib/types";
import { SKILL_LEVELS } from "@/lib/store";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface SkillsEditorProps {
  title: string;
  items: Skill[];
  variant: "skill" | "weakness";
  onChange: (items: Skill[]) => void;
}

export function SkillsEditor({
  title,
  items,
  variant,
  onChange,
}: SkillsEditorProps) {
  const updateItem = (index: number, updates: Partial<Skill>) => {
    onChange(
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item,
      ),
    );
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const addItem = () => {
    onChange([...items, { name: "", level: 1 }]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <Button variant="secondary" className="px-3 py-1 text-xs" onClick={addItem}>
          Добавить
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-sm text-slate-500">Пока ничего не добавлено</p>
      )}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center"
          >
            <input
              type="text"
              value={item.name}
              onChange={(event) => updateItem(index, { name: event.target.value })}
              placeholder="Название навыка"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <select
              value={item.level}
              onChange={(event) =>
                updateItem(index, {
                  level: Number(event.target.value) as SkillLevel,
                })
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {SKILL_LEVELS.map((level) => (
                <option key={level} value={level}>
                  Уровень {level}
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              className="text-red-600"
              onClick={() => removeItem(index)}
            >
              Удалить
            </Button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {items
          .filter((item) => item.name.trim())
          .map((item) => (
            <Badge key={`${item.name}-${item.level}`} variant={variant}>
              {item.name} · {item.level}/5
            </Badge>
          ))}
      </div>
    </div>
  );
}
