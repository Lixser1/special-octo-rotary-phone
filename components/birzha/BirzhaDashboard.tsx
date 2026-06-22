"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { Order, Teacher, Student, Chat, User } from "@/lib/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { ChatWindow } from "../ui/ChatWindow";
import { Modal } from "../ui/Modal";

type BirzhaView = "list" | "detail" | "chat" | "apply" | "create";

interface BirzhaDashboardProps {
  user: Teacher | Student;
  canCreateOrder: boolean;
}

export function BirzhaDashboard({ user, canCreateOrder }: BirzhaDashboardProps) {
  const users = useAppStore((state) => state.users);
  const orders = useAppStore((state) => state.orders);
  const chats = useAppStore((state) => state.chats);
  const respondToOrder = useAppStore((state) => state.respondToOrder);
  const createOrder = useAppStore((state) => state.createOrder);
  const getOrCreateChat = useAppStore((state) => state.getOrCreateChat);
  const activeUserId = useAppStore((state) => state.activeUserId);

  const isTeacher = user.role === "teacher";
  const isSuperStudent = user.role === "student" && user.isSuperStudent;

  const [view, setView] = useState<BirzhaView>("list");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [specText, setSpecText] = useState("");
  const [budget, setBudget] = useState(50000);
  const [deadline, setDeadline] = useState("");
  const [requirements, setRequirements] = useState<Array<{ skillName: string; minLevel: number }>>([
    { skillName: "React", minLevel: 3 },
  ]);

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status === "pending" || order.status === "negotiating"
    );
  }, [orders]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId),
    [orders, selectedOrderId]
  );

  const customer = useMemo(
    () =>
      selectedOrder
        ? users.find((u) => u.id === selectedOrder.customerId)
        : undefined,
    [users, selectedOrder]
  );

  const responses = useMemo(
    () =>
      selectedOrder
        ? selectedOrder.responses.filter((r) => r.teacherId === (user as Teacher).id)
        : [],
    [selectedOrder, user.id]
  );

  const hasApplied = responses.length > 0;

  const handleApply = () => {
    if (!selectedOrder || hasApplied) return;
    respondToOrder(selectedOrder.id, user.id);
    setShowApplyModal(false);
    setApplyMessage("");
    setView("detail");
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !deadline) return;

    const validReqs = requirements
      .filter((r) => r.skillName.trim() !== "")
      .map((r) => ({ skillName: r.skillName.trim(), minLevel: r.minLevel as 1 | 2 | 3 | 4 | 5 }));

    createOrder((user as any).id, {
      title: title.trim(),
      description: description.trim(),
      specText: specText.trim() || undefined,
      budget,
      deadline,
      requirements: validReqs,
    });

    setTitle("");
    setDescription("");
    setSpecText("");
    setBudget(50000);
    setDeadline("");
    setRequirements([{ skillName: "React", minLevel: 3 }]);
    setView("list");
  };

  const handleBack = () => {
    setView("list");
    setSelectedOrderId(null);
    setActiveChatId(null);
  };

  const getStatusLabel = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="default">Ожидает откликов</Badge>;
      case "negotiating":
        return <Badge variant="active">Обсуждение</Badge>;
      case "accepted":
        return <Badge variant="success">Исполнитель выбран</Badge>;
      case "completed":
        return <Badge variant="completed">Завершен</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Биржа заказов</h2>
          <p className="text-sm text-slate-500">
            {canCreateOrder 
              ? "Создавайте свои заказы и откликайтесь на проекты других" 
              : "Просматривайте заказы от заказчиков и откликайтесь на подходящие проекты"}
          </p>
        </div>
        {canCreateOrder && view !== "create" && (
          <Button onClick={() => setView("create")}>Создать заказ</Button>
        )}
      </div>

      {/* === CREATE ORDER === */}
      {view === "create" && (
        <Card title="Новый заказ">
          <form onSubmit={handleCreateOrder} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Название</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Например: Разработка корпоративного чат-бота"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Бюджет (₽)</label>
                  <input
                    type="number"
                    min={1000}
                    required
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Дедлайн</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Описание</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишите основные цели проекта"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Техническое задание (ТЗ)</label>
              <textarea
                rows={5}
                value={specText}
                onChange={(e) => setSpecText(e.target.value)}
                placeholder="Опишите технические требования..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
              <Button type="button" variant="secondary" onClick={() => setView("list")}>
                Отмена
              </Button>
              <Button type="submit">Опубликовать заказ</Button>
            </div>
          </form>
        </Card>
      )}

      {/* === LIST VIEW === */}
      {view === "list" && (
        <div className="grid gap-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <div className="py-12 text-center text-slate-500">
                <svg
                  className="mx-auto h-12 w-12 text-slate-300 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="mb-2 text-base font-medium">Нет доступных заказов</p>
                <p className="text-sm text-slate-400">
                  Новые заказы появятся здесь
                </p>
              </div>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const cust = users.find((u) => u.id === order.customerId);
              const isMine = order.customerId === user.id;
              return (
                <Card key={order.id} title={order.title} action={isMine ? <Badge variant="success">Ваш</Badge> : undefined}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      {cust && (
                        <img
                          src={cust.avatar}
                          alt={cust.name}
                          className="mt-1 h-10 w-10 flex-shrink-0 rounded-full border border-slate-200 object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-slate-400">
                            от {cust?.name || "Заказчик"}
                          </span>
                          {getStatusLabel(order.status)}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {order.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">
                            {order.budget.toLocaleString()} ₽
                          </span>
                          <span>•</span>
                          <span>
                            Дедлайн:{" "}
                            {new Date(order.deadline).toLocaleDateString("ru-RU")}
                          </span>
                          <span>•</span>
                          <span>
                            Откликов: {order.responses.length}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setView("detail");
                      }}
                      className="flex-shrink-0"
                    >
                      Подробнее
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* === DETAIL VIEW === */}
      {view === "detail" && selectedOrder && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card title={selectedOrder.title}>
              <div className="space-y-5">
                {/* Customer info */}
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  {customer && (
                    <img
                      src={customer.avatar}
                      alt={customer.name}
                      className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {customer?.name || "Заказчик"}
                    </p>
                    <p className="text-xs text-slate-500">Заказчик</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Описание проекта
                  </h4>
                  <p className="mt-1.5 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedOrder.description}
                  </p>
                </div>

                {/* Spec / ТЗ */}
                {selectedOrder.specText && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Техническое задание
                    </h4>
                    <pre className="mt-1.5 rounded-lg bg-slate-50 p-4 text-xs text-slate-600 whitespace-pre-wrap font-sans border border-slate-100 leading-relaxed">
                      {selectedOrder.specText}
                    </pre>
                  </div>
                )}

                {/* Requirements */}
                {selectedOrder.requirements.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Требования к навыкам
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedOrder.requirements.map((req) => (
                        <span
                          key={req.skillName}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                        >
                          {req.skillName} — уровень {req.minLevel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Budget & Deadline */}
                <div className="flex flex-wrap items-center gap-6 rounded-lg bg-slate-50 p-4 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Бюджет
                    </p>
                    <p className="text-lg font-bold text-slate-800">
                      {selectedOrder.budget.toLocaleString()} ₽
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Дедлайн
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {new Date(selectedOrder.deadline).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Статус
                    </p>
                    <div className="mt-0.5">
                      {getStatusLabel(selectedOrder.status)}
                    </div>
                  </div>
                </div>

                {/* Applied status */}
                {hasApplied && (
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-100">
                    ✓ Вы уже откликнулись на этот заказ
                    {selectedOrder.status === "negotiating" && (
                      <span className="ml-1">(Статус: обсуждение)</span>
                    )}
                  </div>
                )}
              </div>
            </Card>

            <Button variant="secondary" onClick={handleBack}>
              ← Назад к списку заказов
            </Button>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {!hasApplied ? (
              <Card>
                <p className="mb-3 text-sm text-slate-600">
                  Хотите взять этот проект? Откликнитесь.
                </p>
                <Button
                  className="w-full justify-center"
                  onClick={() => setShowApplyModal(true)}
                >
                  Откликнуться
                </Button>
              </Card>
            ) : (
              <Card>
                <div className="space-y-3">
                  <div className="rounded-lg bg-green-50 p-3 text-center">
                    <p className="text-sm font-semibold text-green-700">
                      Вы откликнулись
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Ожидайте решения заказчика
                    </p>
                  </div>
                  {selectedOrder.status === "negotiating" && (
                    <Button
                      className="w-full justify-center"
                      onClick={() => {
                        const chatRoom = getOrCreateChat(
                          selectedOrder.id,
                          selectedOrder.customerId,
                          user.id
                        );
                        setActiveChatId(chatRoom.id);
                        setView("chat");
                      }}
                    >
                      Открыть чат
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Responses count */}
            <Card>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">
                  {selectedOrder.responses.length}
                </p>
                <p className="text-xs text-slate-500">откликов</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* === CHAT VIEW === */}
      {view === "chat" && activeChatId && selectedOrder && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleBack}>
              ← Назад
            </Button>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedOrder.title}
              </h3>
              <p className="text-xs text-slate-500">
                Обсуждение деталей заказа
              </p>
            </div>
          </div>
          <ChatWindow chatId={activeChatId} />
        </div>
      )}

      {/* === APPLY MODAL === */}
      <Modal
        open={showApplyModal}
        title="Отклик на заказ"
        onClose={() => setShowApplyModal(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleApply();
          }}
          className="space-y-4"
        >
          <p className="text-sm text-slate-600">
            Заказ: <strong>{selectedOrder?.title}</strong>
          </p>
          <p className="text-sm text-slate-500">
            Добавьте сообщение заказчику (необязательно)
          </p>
          <textarea
            rows={4}
            value={applyMessage}
            onChange={(e) => setApplyMessage(e.target.value)}
            placeholder="Расскажите о своём опыте, почему подходит этот проект..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowApplyModal(false)}
            >
              Отмена
            </Button>
            <Button type="submit">Отправить заявку</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
