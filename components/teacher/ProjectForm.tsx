"use client";

import { useState } from "react";
import type { CreateProjectInput, ProjectRequirement, SkillLevel } from "@/lib/types";
import { SKILL_LEVELS } from "@/lib/store";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProjectInput) => void;
}

export function ProjectForm({ open, onClose, onSubmit }: ProjectFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [requirements, setRequirements] = useState<ProjectRequirement[]>([
    { skillName: "", minLevel: 1 },
  ]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setBudget("");
    setDeadline("");
    setRequirements([{ skillName: "", minLevel: 1 }]);
  };

  const handleSubmit = () => {
    const filteredRequirements = requirements.filter((item) => item.skillName.trim());
    if (!title.trim() || !description.trim() || !budget || !deadline) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      budget: Number(budget),
      deadline,
      requirements: filteredRequirements,
    });
    reset();
    onClose();
  };

  const updateRequirement = (
    index: number,
    updates: Partial<ProjectRequirement>,
  ) => {
    setRequirements(
      requirements.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...updates } : item,
      ),
    );
  };

  return (
    <Modal
      open={open}
      title="Создать проект"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit}>Создать</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Название</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Описание</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Бюджет (₽)</label>
            <input
              type="number"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Дедлайн</label>
            <input
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Требуемые навыки</label>
            <Button
              variant="secondary"
              className="px-3 py-1 text-xs"
              onClick={() =>
                setRequirements([...requirements, { skillName: "", minLevel: 1 }])
              }
            >
              Добавить
            </Button>
          </div>
          <div className="space-y-2">
            {requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={req.skillName}
                  onChange={(event) =>
                    updateRequirement(index, { skillName: event.target.value })
                  }
                  placeholder="Навык"
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <select
                  value={req.minLevel}
                  onChange={(event) =>
                    updateRequirement(index, {
                      minLevel: Number(event.target.value) as SkillLevel,
                    })
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {SKILL_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      ≥ {level}
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  className="text-red-600"
                  onClick={() =>
                    setRequirements(
                      requirements.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
