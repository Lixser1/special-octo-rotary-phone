"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { Customer, Order } from "@/lib/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { ChatWindow } from "../ui/ChatWindow";

export function CustomerDashboard({ customer }: { customer: Customer }) {
  const users = useAppStore((state) => state.users);
  const orders = useAppStore((state) => state.orders);
  const chats = useAppStore((state) => state.chats);
  const createOrder = useAppStore((state) => state.createOrder);
  const acceptResponse = useAppStore((state) => state.acceptResponse);
  const getOrCreateChat = useAppStore((state) => state.getOrCreateChat);

  const [activeTab, setActiveTab] = useState<"orders" | "create" | "chats" | "birzha">("orders");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [specText, setSpecText] = useState("");
  const [budget, setBudget] = useState(50000);
  const [deadline, setDeadline] = useState("");
  const [requirements, setRequirements] = useState<Array<{ skillName: string; minLevel: number }>>([
    { skillName: "React", minLevel: 3 },
  ]);

  const allOrders = useAppStore((state) => state.orders);

  const customerOrders = useMemo(
    () => orders.filter((o) => o.customerId === customer.id),
    [orders, customer.id]
  );

  const birzhaOrders = useMemo(
    () => orders.filter(
      (o) => o.status === "pending" || o.status === "negotiating"
    ),
    [orders]
  );

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const selectedTeacher = users.find((u) => u.id === selectedTeacherId && u.role === "teacher");

  // Filter chats belonging to this customer
  const customerChats = useMemo(
    () => chats.filter((c) => c.customerId === customer.id),
    [chats, customer.id]
  );

  const handleAddRequirement = () => {
    setRequirements([...requirements, { skillName: "", minLevel: 1 }]);
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleRequirementChange = (index: number, field: "skillName" | "minLevel", value: any) => {
    setRequirements(
      requirements.map((req, i) =>
        i === index ? { ...req, [field]: field === "minLevel" ? Number(value) : value } : req
      )
    );
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !deadline) return;

    // Filter out requirements with empty skill name
    const validReqs = requirements
      .filter((r) => r.skillName.trim() !== "")
      .map((r) => ({ skillName: r.skillName.trim(), minLevel: r.minLevel as 1 | 2 | 3 | 4 | 5 }));

    createOrder(customer.id, {
      title: title.trim(),
      description: description.trim(),
      specText: specText.trim() || undefined,
      budget,
      deadline,
      requirements: validReqs,
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setSpecText("");
    setBudget(50000);
    setDeadline("");
    setRequirements([{ skillName: "React", minLevel: 3 }]);
    setActiveTab("orders");
  };

  const handleOpenChat = (orderId: string, teacherId: string) => {
    const chatRoom = getOrCreateChat(orderId, customer.id, teacherId);
    setActiveChatId(chatRoom.id);
    setActiveTab("chats");
    setSelectedTeacherId(null);
    setSelectedOrderId(null);
  };

  const handleAcceptTeacher = (orderId: string, teacherId: string) => {
    if (confirm("Вы уверены, что хотите утвердить этого преподавателя исполнителем проекта?")) {
      acceptResponse(orderId, teacherId);
      setSelectedTeacherId(null);
      setSelectedOrderId(null);
    }
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
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Личный кабинет заказчика</h2>
        <p className="text-sm text-slate-500">Управляйте своими заказами и общайтесь с преподавателями IT-колледжа</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => {
            setActiveTab("orders");
            setSelectedOrderId(null);
            setSelectedTeacherId(null);
          }}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "orders"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Мои Заказы ({customerOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "create"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Разместить Заказ
        </button>
        <button
          onClick={() => setActiveTab("chats")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "chats"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Чат / Обсуждения ({customerChats.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("birzha");
            setSelectedOrderId(null);
          }}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "birzha"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Биржа ({birzhaOrders.length})
        </button>
      </div>

      {/* Tab: Orders List */}
      {activeTab === "orders" && !selectedOrderId && (
        <div className="grid gap-4">
          {customerOrders.length === 0 ? (
            <Card>
              <div className="py-8 text-center text-slate-500">
                <p className="mb-4">У вас пока нет активных заказов.</p>
                <Button onClick={() => setActiveTab("create")}>Разместить первый заказ</Button>
              </div>
            </Card>
          ) : (
            customerOrders.map((order) => (
              <Card key={order.id} title={order.title}>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm text-slate-600 line-clamp-2">{order.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>Бюджет: <strong>{order.budget.toLocaleString()} ₽</strong></span>
                      <span>•</span>
                      <span>Дедлайн: {new Date(order.deadline).toLocaleDateString("ru-RU")}</span>
                      <span>•</span>
                      <span>Статус: {getStatusLabel(order.status)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="secondary" onClick={() => setSelectedOrderId(order.id)}>
                      Детали и отклики ({order.responses.length})
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab: Order Detail */}
      {activeTab === "orders" && selectedOrderId && selectedOrder && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card title={selectedOrder.title}>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Описание</h4>
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{selectedOrder.description}</p>
                </div>

                {selectedOrder.specText && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Техническое задание (ТЗ)</h4>
                    <pre className="mt-1 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 whitespace-pre-wrap font-sans border border-slate-100">
                      {selectedOrder.specText}
                    </pre>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Требования к навыкам</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedOrder.requirements.map((req) => (
                      <span
                        key={req.skillName}
                        className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800"
                      >
                        {req.skillName} (уровень {req.minLevel})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span>Бюджет: <strong className="text-slate-800 text-sm">{selectedOrder.budget.toLocaleString()} ₽</strong></span>
                  <span>Дедлайн: <strong className="text-slate-800 text-sm">{new Date(selectedOrder.deadline).toLocaleDateString("ru-RU")}</strong></span>
                  <span>Статус: {getStatusLabel(selectedOrder.status)}</span>
                </div>
              </div>
            </Card>

            <Button variant="secondary" onClick={() => setSelectedOrderId(null)}>
              ← Вернуться к списку заказов
            </Button>
          </div>

          {/* Right sidebar: responses */}
          <div className="space-y-6">
            <Card title="Отклики исполнителей">
              {selectedOrder.responses.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-6">Пока нет откликов от преподавателей.</p>
              ) : (
                <div className="space-y-3">
                  {selectedOrder.responses.map((resp) => {
                    const teacher = users.find((u) => u.id === resp.teacherId);
                    if (!teacher) return null;
                    return (
                      <div
                        key={resp.teacherId}
                        className={`rounded-lg border p-3 hover:border-blue-200 transition-colors ${
                          selectedTeacherId === resp.teacherId ? "border-blue-500 bg-blue-50/20" : "border-slate-100 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={teacher.avatar}
                            alt={teacher.name}
                            className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">{teacher.name}</p>
                            <p className="text-[10px] text-slate-400">Преподаватель</p>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => setSelectedTeacherId(resp.teacherId)}
                            className="flex-1 rounded bg-slate-100 py-1 text-center text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                          >
                            Анкета
                          </button>
                          <button
                            onClick={() => handleOpenChat(selectedOrder.id, resp.teacherId)}
                            className="flex-1 rounded bg-blue-50 py-1 text-center text-xs font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            Чат
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Profile Drawer inside details */}
            {selectedTeacherId && selectedTeacher && (
              <Card title={`Анкета: ${selectedTeacher.name}`}>
                <div className="space-y-4 text-sm text-slate-700">
                  {selectedTeacher.role === "teacher" && (
                    <>
                      <div>
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">О себе</h5>
                        <p className="mt-1 text-xs text-slate-600 whitespace-pre-wrap">{selectedTeacher.bio || "Описание отсутствует"}</p>
                      </div>

                      {selectedTeacher.skills && selectedTeacher.skills.length > 0 && (
                        <div>
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Квалификация / Навыки</h5>
                          <div className="flex flex-wrap gap-1">
                            {selectedTeacher.skills.map((s) => (
                              <span key={s.name} className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-800">
                                {s.name} (уровень {s.level})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTeacher.portfolio && selectedTeacher.portfolio.length > 0 && (
                        <div>
                          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Портфолио</h5>
                          <div className="space-y-1">
                            {selectedTeacher.portfolio.map((link, idx) => (
                              <a
                                key={`${link}-${idx}`}
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-xs text-blue-600 hover:underline truncate"
                              >
                                {link}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedOrder.status !== "accepted" && (
                    <Button className="w-full justify-center" onClick={() => handleAcceptTeacher(selectedOrder.id, selectedTeacher.id)}>
                      Утвердить исполнителем
                    </Button>
                  )}
                  <Button variant="secondary" className="w-full justify-center" onClick={() => setSelectedTeacherId(null)}>
                    Закрыть анкету
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab: Create Order */}
      {activeTab === "create" && (
        <Card title="Новый заказ для IT-колледжа">
          <form onSubmit={handleCreateOrder} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Название заказа / проекта</label>
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
              <label className="mb-1 block text-sm font-medium text-slate-700">Краткое описание проекта</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишите основные бизнес-цели проекта, ожидаемый результат и команду."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Техническое задание (ТЗ)</label>
              <textarea
                rows={5}
                value={specText}
                onChange={(e) => setSpecText(e.target.value)}
                placeholder="Опишите технические требования, функционал страниц, архитектурные особенности, ссылки на макеты в Figma и т.д."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Requirements section */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Требуемые навыки команды</label>
                <Button type="button" variant="secondary" className="px-3 py-1 text-xs" onClick={handleAddRequirement}>
                  + Добавить навык
                </Button>
              </div>
              <div className="space-y-2">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Название технологии (React, Node, ML, Figma...)"
                      value={req.skillName}
                      onChange={(e) => handleRequirementChange(index, "skillName", e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <select
                      value={req.minLevel}
                      onChange={(e) => handleRequirementChange(index, "minLevel", e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value={1}>Уровень 1 (Основы)</option>
                      <option value={2}>Уровень 2 (Начальный)</option>
                      <option value={3}>Уровень 3 (Средний)</option>
                      <option value={4}>Уровень 4 (Продвинутый)</option>
                      <option value={5}>Уровень 5 (Эксперт)</option>
                    </select>
                    <button
                      type="button"
                      disabled={requirements.length <= 1}
                      onClick={() => handleRemoveRequirement(index)}
                      className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 disabled:opacity-30 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
              <Button type="button" variant="secondary" onClick={() => setActiveTab("orders")}>
                Отмена
              </Button>
              <Button type="submit">Опубликовать заказ</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: Chats */}
      {activeTab === "chats" && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Chat List sidebar */}
          <div className="space-y-3">
            <Card title="Активные диалоги">
              {customerChats.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">Нет активных чатов с преподавателями.</p>
              ) : (
                <div className="space-y-1">
                  {customerChats.map((c) => {
                    const teacher = users.find((u) => u.id === c.teacherId);
                    const order = orders.find((o) => o.id === c.orderId);
                    const isSelected = activeChatId === c.id;

                    return (
                      <button
                        key={c.id}
                        onClick={() => setActiveChatId(c.id)}
                        className={`w-full rounded-lg p-2.5 text-left transition-colors flex items-center gap-3 ${
                          isSelected ? "bg-blue-50 text-blue-900 font-medium" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {teacher && (
                          <img
                            src={teacher.avatar}
                            alt={teacher.name}
                            className="h-8 w-8 rounded-full object-cover border border-slate-200"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold">{teacher?.name}</p>
                          <p className="truncate text-[10px] text-slate-400">{order?.title}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Chat Window Container */}
          <div className="md:col-span-2">
            {activeChatId ? (
              <ChatWindow chatId={activeChatId} />
            ) : (
              <div className="flex h-[550px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-400">
                <div>
                  <svg
                    className="mx-auto h-12 w-12 text-slate-300 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-sm">Выберите чат в боковом меню</p>
                  <p className="text-xs text-slate-400">или откликнитесь/начните чат из карточки заказа</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Birzha - all active orders */}
      {activeTab === "birzha" && (
        <div className="grid gap-4">
          {birzhaOrders.length === 0 ? (
            <Card>
              <div className="py-12 text-center text-slate-500">
                <p className="mb-2 text-base font-medium">Нет активных заказов на бирже</p>
                <p className="text-sm text-slate-400">
                  Заказы от других заказчиков появятся здесь
                </p>
              </div>
            </Card>
          ) : (
            birzhaOrders.map((order) => {
              const cust = users.find((u) => u.id === order.customerId);
              const isMine = order.customerId === customer.id;
              return (
                <Card
                  key={order.id}
                  title={order.title}
                  action={
                    isMine ? (
                      <Badge variant="success">Ваш заказ</Badge>
                    ) : undefined
                  }
                >
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
                            {isMine && " (вы)"}
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
                        {order.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {order.requirements.slice(0, 4).map((req) => (
                              <span
                                key={req.skillName}
                                className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700"
                              >
                                {req.skillName} {req.minLevel}
                              </span>
                            ))}
                            {order.requirements.length > 4 && (
                              <span className="text-[11px] text-slate-400">
                                +{order.requirements.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setActiveTab("orders");
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
    </div>
  );
}