"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import type { Order, Teacher, Chat, User } from "@/lib/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { ChatWindow } from "../ui/ChatWindow";
import { Modal } from "../ui/Modal";

type BirzhaView = "list" | "detail" | "chat" | "apply";

export function BirzhaDashboard({ teacher }: { teacher: Teacher }) {
  const users = useAppStore((state) => state.users);
  const orders = useAppStore((state) => state.orders);
  const chats = useAppStore((state) => state.chats);
  const respondToOrder = useAppStore((state) => state.respondToOrder);
  const getOrCreateChat = useAppStore((state) => state.getOrCreateChat);
  const activeUserId = useAppStore((state) => state.activeUserId);

  const [view, setView] = useState<BirzhaView>("list");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");

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

  const teacherResponses = useMemo(
    () =>
      selectedOrder
        ? selectedOrder.responses.filter((r) => r.teacherId === teacher.id)
        : [],
    [selectedOrder, teacher.id]
  );

  const teacherHasApplied = teacherResponses.length > 0;

  const teacherChat = useMemo(() => {
    if (!selectedOrder || !selectedOrder.customerId) return null;
    return chats.find(
      (c) =>
        c.orderId === selectedOrderId &&
        c.customerId === selectedOrder.customerId &&
        c.teacherId === teacher.id
    );
  }, [chats, selectedOrderId, selectedOrder?.customerId, teacher.id]);

  const openDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setView("detail");
  };

  const openChat = () => {
    if (!selectedOrder) return;
    const chatRoom = getOrCreateChat(
      selectedOrder.id,
      selectedOrder.customerId,
      teacher.id
    );
    setActiveChatId(chatRoom.id);
    setView("chat");
  };

  const handleApply = () => {
    if (!selectedOrder || teacherHasApplied) return;
    respondToOrder(selectedOrder.id, teacher.id);
    if (applyMessage.trim()) {
      const chatRoom = getOrCreateChat(
        selectedOrder.id,
        selectedOrder.customerId,
        teacher.id
      );
      const userName = users.find((u) => u.id === activeUserId)?.name || teacher.name;
      getOrCreateChat(selectedOrder.id, selectedOrder.customerId, teacher.id);
      // Message will be sent via ChatWindow
    }
    setShowApplyModal(false);
    setApplyMessage("");
    setView("detail");
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
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Биржа заказов</h2>
        <p className="text-sm text-slate-500">
          Просматривайте заказы от заказчиков и откликайтесь на подходящие проекты
        </p>
      </div>

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
                  Новые заказы от заказчиков появятся здесь
                </p>
              </div>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const cust = users.find((u) => u.id === order.customerId);
              return (
                <Card key={order.id} title={order.title}>
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
                      onClick={() => openDetail(order.id)}
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
                {teacherHasApplied && (
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
            {!teacherHasApplied ? (
              <Card>
                <p className="mb-3 text-sm text-slate-600">
                  Хотите взять этот проект? Откликнитесь, и заказчик рассмотрит вашу заявку.
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
                      onClick={openChat}
                    >
                      Открыть чат
                    </Button>
                  )}
                  {selectedOrder.status === "accepted" && (
                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                      <p className="text-sm font-semibold text-blue-700">
                        Заказ принят!
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Начните работу над проектом
                      </p>
                    </div>
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

            {/* Other teachers who responded */}
            {selectedOrder.responses.length > 0 && (
              <Card title="Откликнувшиеся преподаватели">
                <div className="space-y-3">
                  {selectedOrder.responses.map((resp) => {
                    const t = users.find((u) => u.id === resp.teacherId);
                    if (!t) return null;
                    return (
                      <div
                        key={resp.teacherId}
                        className={`flex items-center gap-3 rounded-lg p-2 ${
                          resp.teacherId === teacher.id
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-slate-50"
                        }`}
                      >
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-slate-800">
                            {t.name}
                          </p>
                          <p className="truncate text-[10px] text-slate-400">
                            {resp.teacherId === teacher.id
                              ? "Вы"
                              : "Преподаватель"}
                          </p>
                        </div>
                        {resp.teacherId !== teacher.id && (
                          <Badge
                            variant={
                              resp.status === "accepted"
                                ? "success"
                                : resp.status === "declined"
                                ? "danger"
                                : "default"
                            }
                          >
                            {resp.status === "accepted"
                              ? "Принят"
                              : resp.status === "declined"
                              ? "Отклонён"
                              : "Заявка"}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
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
