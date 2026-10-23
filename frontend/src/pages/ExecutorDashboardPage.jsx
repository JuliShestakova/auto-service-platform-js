import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SiteHeader from '../components/SiteHeader';
import ServiceSuggest from '../components/ServiceSuggest';
import { SERVICE_GROUPS } from '../data/serviceCatalog';
import { resolveBestService } from '../utils/fuzzyService';
import { CITIES, DEFAULT_CITY } from '../data/cities';
import shopImage1 from '../assets/shops/shop-1.jpg';
import shopImage2 from '../assets/shops/shop-2.jpg';
import shopImage3 from '../assets/shops/shop-3.jpg';
import shopImage4 from '../assets/shops/shop-4.jpg';
import shopImage5 from '../assets/shops/shop-5.jpg';
import shopImage6 from '../assets/shops/shop-6.jpg';
import shopImage7 from '../assets/shops/shop-7.jpg';
import shopImage8 from '../assets/shops/shop-8.jpg';

const SHOP_IMAGES = [
  shopImage1, shopImage2, shopImage3, shopImage4,
  shopImage5, shopImage6, shopImage7, shopImage8,
];

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];
const CALENDAR_STATUSES = new Set([
  'Ожидает подтверждения',
  'Запланирован',
  'В работе',
]);

function shopCover(id) {
  return SHOP_IMAGES[Math.abs(Number(id) || 0) % SHOP_IMAGES.length];
}

function catalogServiceName(item) {
  if (Array.isArray(item)) return item[0];
  return item?.name;
}

function mergeCatalog(apiItems = [], profileServices = []) {
  const groups = SERVICE_GROUPS.map((group) => ({
    category: group.category,
    items: [...group.items],
  }));
  const known = new Set(groups.flatMap((group) => group.items));
  const extras = [];

  for (const item of apiItems) {
    if (item?.name && !known.has(item.name)) {
      extras.push(item.name);
      known.add(item.name);
    }
  }
  for (const row of profileServices || []) {
    const name = catalogServiceName(row);
    if (name && !known.has(name)) {
      extras.push(name);
      known.add(name);
    }
  }
  if (extras.length) {
    groups.push({
      category: 'Другое',
      items: extras.sort((a, b) => a.localeCompare(b, 'ru')),
    });
  }
  return groups;
}

function todayIso() {
  return toIso(new Date());
}

function toIso(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseIso(value) {
  return new Date(`${value}T00:00:00`);
}

function addDays(iso, amount) {
  const date = parseIso(iso);
  date.setDate(date.getDate() + amount);
  return toIso(date);
}

function startOfWeek(iso) {
  const date = parseIso(iso);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return toIso(date);
}

function weekDays(iso) {
  const start = startOfWeek(iso);
  return WEEKDAYS.map((label, index) => {
    const value = addDays(start, index);
    return { label, iso: value, date: parseIso(value).getDate() };
  });
}

function toIsoDate(year, monthIndex, day) {
  return toIso(new Date(year, monthIndex, day));
}

function formatReviewDate(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function buildMonthCells(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, iso: toIsoDate(year, monthIndex, day) });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatDateLabel(value, withWeekday = false) {
  if (!value) return 'Без даты';
  const date = parseIso(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ru-RU', {
    weekday: withWeekday ? 'long' : undefined,
    day: 'numeric',
    month: 'long',
    year: withWeekday ? 'numeric' : undefined,
  });
}

function formatWhen(visitDate, visitTime) {
  const parts = [];
  if (visitDate) parts.push(formatDateLabel(visitDate));
  if (visitTime) parts.push(visitTime);
  return parts.join(', ') || 'Без даты';
}

function hourOf(time) {
  const match = String(time || '').match(/^(\d{1,2})/);
  if (!match) return null;
  return String(match[1]).padStart(2, '0') + ':00';
}

function shortName(name) {
  const parts = String(name || '').trim().split(/\s+/);
  if (parts.length < 2) return name || 'Клиент';
  return `${parts[0]} ${parts[1][0]}.`;
}

function initials(name) {
  return String(name || 'К')
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'К';
}

function endTime(time) {
  const match = String(time || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';
  const hour = Math.min(23, Number(match[1]) + 1);
  return `${String(hour).padStart(2, '0')}:${match[2]}`;
}

function timeRange(time) {
  if (!time) return 'Время не указано';
  const finish = endTime(time);
  return finish ? `${time} – ${finish}` : time;
}

function formatUpcomingWhen(visitDate, visitTime) {
  if (!visitDate) return timeRange(visitTime);
  const today = todayIso();
  const dateLabel = visitDate === today
    ? 'Сегодня'
    : visitDate === addDays(today, 1)
      ? 'Завтра'
      : formatDateLabel(visitDate);
  return `${dateLabel}, ${timeRange(visitTime)}`;
}

function statusShort(status) {
  if (status === 'Ожидает подтверждения') return 'Ожидает';
  if (status === 'Запланирован') return 'Подтверждена';
  if (status === 'Отменён') return 'Отменена';
  if (status === 'Завершён') return 'Завершена';
  return status || '—';
}

function statusLabel(status) {
  if (status === 'Отменён') return 'Отменена';
  if (status === 'Завершён') return 'Завершена';
  if (status === 'Запланирован') return 'Подтверждена';
  return status || '—';
}

function isUnackedCancel(item) {
  return item?.status === 'Отменён' && !item.cancel_ack_at;
}

function chipTone(status) {
  if (status === 'В работе') return 'work';
  if (status === 'Запланирован') return 'ok';
  if (status === 'Ожидает подтверждения') return 'wait';
  if (status === 'Отменён') return 'cancel';
  return 'muted';
}

function statusTone(status) {
  if (status === 'В работе') return 'progress';
  if (status === 'Запланирован') return 'planned';
  if (status === 'Ожидает подтверждения') return 'wait';
  if (status === 'Отменён') return 'cancelled';
  if (status === 'Завершён') return 'done';
  return 'muted';
}

function matchesQuery(item, query) {
  if (!query) return true;
  const haystack = [
      item.title, item.customer_name, item.car_label, item.description, item.status,
    item.staff_name,
  ].join(' ').toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function Icon({ type }) {
  const paths = {
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    clipboard: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V3h6v1M9 9h6M9 13h6M9 17h4" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 9h16" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M4 19c.4-3.2 2.4-5 5-5s4.6 1.8 5 5" />
        <circle cx="16.5" cy="9" r="2.2" />
        <path d="M19.5 19c-.2-2.2-1.4-3.6-3-4.1" />
      </>
    ),
    star: (
      <path d="m12 3.6 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18.5l.9-5.4-3.9-3.8 5.4-.8L12 3.6Z" />
    ),
    plug: (
      <>
        <path d="M9 7v4M15 7v4" />
        <path d="M8 11h8v2a4 4 0 0 1-8 0v-2Z" />
        <path d="M12 17v3" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19h16" />
        <path d="M7 16v-5M12 16V8M17 16v-8" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.1-1.2L12.2 3h-4l-.4 2.7a7 7 0 0 0-2.1 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 3.3 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.1 1.2l.4 2.7h4l.4-2.7a7 7 0 0 0 2.1-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5" />
        <path d="M14 8l4 4-4 4M8 12h10" />
      </>
    ),
    car: (
      <>
        <path d="M4 14l2-6h12l2 6M4 14v5h3M20 14v5h-3" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[type]}
    </svg>
  );
}

export default function ExecutorDashboardPage() {
  const { user, logout, authFetch, patchUser } = useAuth();
  const navigate = useNavigate();

  const [section, setSection] = useState('overview');
  const [executorOrders, setExecutorOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [profile, setProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirmStaffId, setConfirmStaffId] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [staffDraft, setStaffDraft] = useState({ name: '', position: 'Мастер', phone: '' });
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [newBookingSaving, setNewBookingSaving] = useState(false);
  const [newBookingError, setNewBookingError] = useState('');
  const [newBooking, setNewBooking] = useState({
    guest_name: '',
    title: '',
    staff_id: '',
    visit_date: todayIso(),
    visit_time: '10:00',
  });
  const [search, setSearch] = useState('');
  const [boardView, setBoardView] = useState('week');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState(todayIso);
  const [calendarCursor, setCalendarCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [profileDraft, setProfileDraft] = useState({
    name: '',
    phone: '',
    address: '',
    city: DEFAULT_CITY,
    hours: '',
    description: '',
    status: 'Открыто',
  });
  const [profileError, setProfileError] = useState('');
  const [catalogGroups, setCatalogGroups] = useState(SERVICE_GROUPS);
  const [pickedServices, setPickedServices] = useState([]);
  const [servicesSaving, setServicesSaving] = useState(false);
  const [servicesError, setServicesError] = useState('');
  const [servicesSaved, setServicesSaved] = useState(false);
  const [notices, setNotices] = useState([]);
  const [shopReviews, setShopReviews] = useState([]);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [ackingId, setAckingId] = useState(null);

  const loadExecutorData = async () => {
    const [ordersResponse, profileResponse, staffResponse, noticesResponse] = await Promise.all([
      authFetch('/api/orders'),
      authFetch('/api/executors/me'),
      authFetch('/api/staff'),
      authFetch('/api/notifications'),
    ]);
    if (ordersResponse.ok) {
      const orders = await ordersResponse.json();
      setExecutorOrders(orders);
      setBookingDetail((current) => {
        if (!current) return current;
        return orders.find((item) => item.id === current.id) || current;
      });
    }
    if (noticesResponse.ok) setNotices(await noticesResponse.json());
    if (staffResponse.ok) setStaff(await staffResponse.json());
    if (profileResponse.ok) {
      const data = await profileResponse.json();
      setProfile(data);
      setPickedServices(
        (data.services || []).map(catalogServiceName).filter(Boolean),
      );
      setProfileDraft(profileToDraft(data, user));
      if (data.name && data.name !== user?.name) {
        patchUser?.({ name: data.name });
      }
      const reviewsResponse = await fetch(`/api/executors/${data.id}/reviews`);
      if (reviewsResponse.ok) {
        setShopReviews(await reviewsResponse.json());
      }
    }
  };

  useEffect(() => {
    if (user?.role !== 'executor') return undefined;
    loadExecutorData();
    const timer = window.setInterval(() => {
      loadExecutorData();
    }, 15000);
    return () => window.clearInterval(timer);
  }, [user]);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) return;
        const data = await response.json();
        setCatalogGroups(mergeCatalog(data, profile?.services));
      } catch {
        setCatalogGroups(mergeCatalog([], profile?.services));
      }
    };
    loadCatalog();
  }, [profile]);

  const today = todayIso();

  const visibleOrders = useMemo(
    () => executorOrders.filter((item) => matchesQuery(item, search)),
    [executorOrders, search],
  );

  const pendingConfirmations = useMemo(
    () => visibleOrders.filter((item) => (
      item.executor_id && item.status === 'Ожидает подтверждения'
    )),
    [visibleOrders],
  );

  const openRequests = useMemo(
    () => visibleOrders.filter((item) => !item.executor_id),
    [visibleOrders],
  );

  const calendarBookings = useMemo(
    () => visibleOrders.filter((item) => {
      if (!item.executor_id) return false;
      if (serviceFilter !== 'all' && item.title !== serviceFilter) return false;
      if (CALENDAR_STATUSES.has(item.status)) return true;
      return isUnackedCancel(item);
    }),
    [visibleOrders, serviceFilter],
  );

  const cancelledOrders = useMemo(
    () => visibleOrders.filter((item) => item.executor_id && item.status === 'Отменён'),
    [visibleOrders],
  );

  const assignedOrders = useMemo(
    () => visibleOrders.filter((item) => item.executor_id),
    [visibleOrders],
  );

  const boardBookings = useMemo(
    () => calendarBookings.filter((item) => (
      staffFilter === 'all' || String(item.staff_id) === String(staffFilter)
    )),
    [calendarBookings, staffFilter],
  );

  const todayBoard = useMemo(
    () => boardBookings.filter((item) => (
      item.visit_date === today && item.status !== 'Отменён'
    )),
    [boardBookings, today],
  );

  const inProgressCount = useMemo(
    () => visibleOrders.filter((item) => item.status === 'В работе').length,
    [visibleOrders],
  );

  const clientCount = useMemo(() => {
    const ids = new Set(
      executorOrders.map((item) => item.customer_id || `guest:${item.customer_name}`),
    );
    return ids.size;
  }, [executorOrders]);

  const uniqueClients = useMemo(() => {
    const map = new Map();
    executorOrders.forEach((item) => {
      const key = item.customer_id || `guest:${item.customer_name}`;
      const current = map.get(key) || {
        id: key,
        name: item.customer_name,
        visits: 0,
      };
      current.visits += 1;
      map.set(key, current);
    });
    return [...map.values()];
  }, [executorOrders]);

  const upcoming = useMemo(() => {
    return calendarBookings
      .filter((item) => (
        item.visit_date
        && item.visit_date >= today
        && item.status !== 'Отменён'
      ))
      .sort((a, b) => `${a.visit_date} ${a.visit_time}`.localeCompare(
        `${b.visit_date} ${b.visit_time}`,
      ))
      .slice(0, 6);
  }, [calendarBookings, today]);

  const serviceList = useMemo(() => {
    const rows = profile?.services || [];
    return rows.map(catalogServiceName).filter(Boolean);
  }, [profile]);

  const servicesDirty = useMemo(() => {
    const current = [...pickedServices].sort().join('|');
    const saved = [...serviceList].sort().join('|');
    return current !== saved;
  }, [pickedServices, serviceList]);

  const askConfirm = (order) => {
    setConfirmError('');
    setConfirmStaffId(staff[0] ? String(staff[0].id) : '');
    setConfirmTarget(order);
  };

  const confirmOrder = async () => {
    if (!confirmTarget?.id) return;
    if (!confirmStaffId) {
      setConfirmError('Назначьте сотрудника, который выполнит работу');
      return;
    }
    setConfirmingId(confirmTarget.id);
    setConfirmError('');
    try {
      const response = await authFetch(`/api/orders/${confirmTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: true,
          staff_id: Number(confirmStaffId),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setConfirmError(
          typeof data?.detail === 'string'
            ? data.detail
            : 'Не удалось подтвердить запись',
        );
        return;
      }
      setConfirmTarget(null);
      await loadExecutorData();
    } finally {
      setConfirmingId(null);
    }
  };

  const openSchedule = ({ view, day, staffId } = {}) => {
    if (view) setBoardView(view);
    if (day) {
      setSelectedDay(day);
      const parsed = parseIso(day);
      if (!Number.isNaN(parsed.getTime())) {
        setCalendarCursor({
          year: parsed.getFullYear(),
          month: parsed.getMonth(),
        });
      }
    }
    if (staffId !== undefined) {
      setStaffFilter(staffId ? String(staffId) : 'all');
    }
    openCabinetSection('schedule');
  };

  const openBookingDetail = (item) => {
    setBookingDetail(item);
  };

  const openUpcoming = (item) => {
    openBookingDetail(item);
  };

  const markNoticeRead = async (noticeId) => {
    const response = await authFetch(`/api/notifications/${noticeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    });
    if (response.ok) {
      const data = await response.json();
      setNotices((current) => current.map((item) => (
        item.id === data.id ? data : item
      )));
    }
  };

  const markNoticeKindsRead = async (kinds) => {
    const unread = notices.filter((item) => (
      !item.read_at && kinds.includes(item.kind)
    ));
    if (!unread.length) return;
    const updated = await Promise.all(unread.map(async (item) => {
      const response = await authFetch(`/api/notifications/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      return response.ok ? response.json() : null;
    }));
    const byId = new Map(
      updated.filter(Boolean).map((item) => [item.id, item]),
    );
    if (!byId.size) return;
    setNotices((current) => current.map((item) => byId.get(item.id) || item));
  };

  const openCabinetSection = (id) => {
    setSection(id);
    if (id === 'requests' || id === 'schedule') {
      markNoticeKindsRead(['new_booking', 'cancelled']);
    }
    if (id === 'reviews') {
      markNoticeKindsRead(['new_review']);
    }
  };

  const handleOpenNotice = (notice) => {
    if (notice.kind === 'new_review') {
      openCabinetSection('reviews');
      if (!notice.read_at) markNoticeRead(notice.id);
      return;
    }
    const order = executorOrders.find((item) => item.id === notice.order_id);
    if (order) {
      setBookingDetail(order);
      if (order.visit_date) {
        setSelectedDay(order.visit_date);
        const parsed = parseIso(order.visit_date);
        if (!Number.isNaN(parsed.getTime())) {
          setCalendarCursor({
            year: parsed.getFullYear(),
            month: parsed.getMonth(),
          });
        }
      }
    } else {
      setBookingDetail({
        id: notice.order_id,
        title: notice.title,
        description: notice.body,
        status: notice.status || (notice.kind === 'cancelled' ? 'Отменён' : ''),
        cancel_reason: notice.cancel_reason,
        customer_name: notice.customer_name,
        visit_date: notice.visit_date,
        visit_time: notice.visit_time,
      });
    }
    openCabinetSection('requests');
    if (notice.kind !== 'cancelled' && !notice.read_at) {
      markNoticeRead(notice.id);
    }
  };

  const ackCancel = async (order) => {
    if (!order?.id) return;
    setAckingId(order.id);
    try {
      const response = await authFetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ack_cancel: true }),
      });
      if (!response.ok) return;
      await loadExecutorData();
    } finally {
      setAckingId(null);
    }
  };

  const openNewBooking = (preset = {}) => {
    setNewBookingError('');
    setNewBooking({
      guest_name: '',
      title: '',
      staff_id: staff[0] ? String(staff[0].id) : '',
      visit_date: preset.visit_date || selectedDay || todayIso(),
      visit_time: preset.visit_time || '10:00',
    });
    setNewBookingOpen(true);
  };

  const submitNewBooking = async (event) => {
    event.preventDefault();
    if (!newBooking.guest_name.trim()) {
      setNewBookingError('Укажите имя клиента');
      return;
    }
    const title = resolveBestService(newBooking.title, serviceList)
      || newBooking.title.trim();
    if (!title) {
      setNewBookingError('Выберите услугу из списка');
      return;
    }
    if (!newBooking.staff_id) {
      setNewBookingError('Назначьте мастера');
      return;
    }
    if (!newBooking.visit_date || !newBooking.visit_time) {
      setNewBookingError('Укажите дату и время');
      return;
    }
    setNewBookingSaving(true);
    setNewBookingError('');
    try {
      const response = await authFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          guest_name: newBooking.guest_name.trim(),
          staff_id: Number(newBooking.staff_id),
          visit_date: newBooking.visit_date,
          visit_time: newBooking.visit_time,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setNewBookingError(
          typeof data?.detail === 'string'
            ? data.detail
            : 'Не удалось создать запись',
        );
        return;
      }
      setNewBookingOpen(false);
      await loadExecutorData();
    } finally {
      setNewBookingSaving(false);
    }
  };

  const saveStaff = async (event) => {
    event.preventDefault();
    if (!staffDraft.name.trim()) return;
    const response = await authFetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffDraft),
    });
    if (response.ok) {
      setStaffDraft({ name: '', position: 'Мастер', phone: '' });
      await loadExecutorData();
    }
  };

  const removeStaff = async (staffId) => {
    const response = await authFetch(`/api/staff/${staffId}`, { method: 'DELETE' });
    if (response.ok || response.status === 204) {
      await loadExecutorData();
    }
  };

  const acceptOrder = async (orderId) => {
    const response = await authFetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accept: true }),
    });
    if (response.ok) await loadExecutorData();
  };

  const togglePickedService = (name) => {
    setServicesSaved(false);
    setPickedServices((current) => (
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    ));
  };

  const setGroupPicked = (items, enabled) => {
    setServicesSaved(false);
    setPickedServices((current) => {
      const next = new Set(current);
      items.forEach((name) => {
        if (enabled) next.add(name);
        else next.delete(name);
      });
      return [...next];
    });
  };

  const saveServices = async () => {
    setServicesSaving(true);
    setServicesError('');
    setServicesSaved(false);
    const services = pickedServices.map((name) => [name]);
    try {
      const response = await authFetch('/api/executors/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setServicesError(
          typeof data?.detail === 'string'
            ? data.detail
            : 'Не удалось сохранить услуги',
        );
        return;
      }
      setServicesSaved(true);
      await loadExecutorData();
    } finally {
      setServicesSaving(false);
    }
  };

  const startEditProfile = () => {
    setProfileError('');
    setProfileDraft(profileToDraft(profile, user));
    setEditingProfile(true);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileError('');
    const response = await authFetch('/api/executors/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: profileDraft.name.trim(),
        phone: profileDraft.phone.trim(),
        address: profileDraft.address.trim(),
        city: profileDraft.city,
        hours: profileDraft.hours.trim() || PLACEHOLDER_HOURS,
        description: profileDraft.description.trim() || PLACEHOLDER_DESCRIPTION,
        status: profileDraft.status,
      }),
    });
    if (response.ok) {
      const saved = await response.json().catch(() => null);
      if (saved?.name) {
        patchUser?.({ name: saved.name });
      }
      setEditingProfile(false);
      await loadExecutorData();
      return;
    }
    const data = await response.json().catch(() => ({}));
    setProfileError(
      typeof data?.detail === 'string'
        ? data.detail
        : 'Не удалось сохранить данные автосервиса',
    );
  };

  const handleLogout = () => {
    navigate('/', { replace: true });
    if (typeof logout === 'function') logout();
  };

  const serviceName = profile?.name || user?.name || 'Автосервис';
  const cityLabel = profile?.city || 'Город не указан';
  const requestBadge = pendingConfirmations.length + openRequests.length;
  const unreadNotices = notices.filter((item) => !item.read_at);
  const hasBookingNotice = unreadNotices.some((item) => (
    item.kind === 'new_booking' || item.kind === 'cancelled'
  ));
  const hasReviewNotice = unreadNotices.some((item) => item.kind === 'new_review');
  const kpiStrip = (
    <div className="ex-kpi">
      <KpiCard
        icon="calendar"
        label="Сегодня"
        value={todayBoard.length}
        note="записи"
        action="Посмотреть →"
        active={section === 'schedule' && boardView === 'day'}
        onAction={() => openSchedule({ view: 'day', day: todayIso(), staffId: 'all' })}
      />
      <KpiCard
        icon="clock"
        label="Ожидают подтверждения"
        value={pendingConfirmations.length}
        note="записи"
        action="Посмотреть →"
        active={section === 'requests'}
        onAction={() => openCabinetSection('requests')}
      />
      <KpiCard
        icon="car"
        label="В работе"
        value={inProgressCount}
        note="автомобиля"
        action="Посмотреть →"
        active={section === 'schedule' && boardView !== 'day'}
        onAction={() => openSchedule({ view: 'week', staffId: 'all' })}
      />
      <KpiCard
        icon="people"
        label="Всего клиентов"
        value={clientCount}
        note="в базе"
        action="Посмотреть →"
        active={section === 'clients'}
        onAction={() => openCabinetSection('clients')}
      />
      <button type="button" className="ex-new-btn" onClick={() => openNewBooking()}>
        + Новая запись
      </button>
    </div>
  );

  if (!user) {
    return (
      <div className="role-dashboard-page">
        <SiteHeader
          variant="executor"
          onLogin={() => navigate('/login')}
          onRegister={() => navigate('/register')}
        />
        <main className="role-dashboard-auth">
          <div className="role-empty-card">
            <div className="role-empty-icon"><Icon type="car" /></div>
            <h1>Войдите в аккаунт</h1>
            <p>Кабинет автосервиса доступен после авторизации.</p>
            <Link className="primary-button" to="/login">Войти →</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="role-dashboard-page ex-cab-page">
      <SiteHeader
        variant="executor"
        searchValue={search}
        onSearchChange={setSearch}
        noticeCount={unreadNotices.length}
        notices={notices}
        onOpenNotice={handleOpenNotice}
        displayName={profile?.name || user?.name}
      />

      <main className="ex-cab-layout">
        <aside className="ex-cab-sidebar">
          <img
            className="ex-cab-cover"
            src={shopCover(profile?.id)}
            alt=""
          />
          <div className="ex-cab-profile-card">
            <strong>{serviceName}</strong>
            <span className={`ex-cab-live ${profile?.status === 'Закрыто' ? 'is-closed' : ''}`}>
              {profile?.status || 'Открыто'}
            </span>
            <p>{cityLabel}</p>
          </div>

          <nav className="ex-cab-nav">
            <SideLink active={section === 'overview'} icon="grid" label="Обзор" onClick={() => openCabinetSection('overview')} />
            <SideLink active={section === 'requests'} icon="clipboard" label="Записи" badge={requestBadge || null} dot={hasBookingNotice} onClick={() => openCabinetSection('requests')} />
            <SideLink active={section === 'schedule'} icon="calendar" label="Расписание" dot={hasBookingNotice} onClick={() => openCabinetSection('schedule')} />
            <SideLink active={section === 'staff'} icon="people" label="Сотрудники" onClick={() => openCabinetSection('staff')} />
            <SideLink active={section === 'clients'} icon="people" label="Клиенты" onClick={() => openCabinetSection('clients')} />
            <SideLink active={section === 'reviews'} icon="star" label="Отзывы" dot={hasReviewNotice} onClick={() => openCabinetSection('reviews')} />
            <SideLink active={section === 'services'} icon="plug" label="Услуги" onClick={() => openCabinetSection('services')} />
            <SideLink active={section === 'stats'} icon="chart" label="Статистика" onClick={() => openCabinetSection('stats')} />
            <SideLink active={section === 'service' || section === 'settings'} icon="settings" label="Настройки" onClick={() => { setEditingProfile(false); openCabinetSection('service'); }} />
            <button type="button" className="ex-cab-side-link ex-cab-side-logout" onClick={handleLogout}>
              <Icon type="logout" />
              <span>Выйти</span>
            </button>
          </nav>
        </aside>

        <section className="ex-cab-main">
          {kpiStrip}

          {section === 'overview' && (
            <OverviewBoard
              boardView={boardView}
              setBoardView={setBoardView}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              calendarCursor={calendarCursor}
              setCalendarCursor={setCalendarCursor}
              serviceFilter={serviceFilter}
              setServiceFilter={setServiceFilter}
              staffFilter={staffFilter}
              setStaffFilter={setStaffFilter}
              serviceList={serviceList}
              bookings={boardBookings}
              loadBookings={calendarBookings}
              upcoming={upcoming}
              staff={staff}
              confirmingId={confirmingId}
              onOpenBooking={openBookingDetail}
              onOpenRecords={() => openCabinetSection('requests')}
              onOpenStaff={() => setSection('staff')}
              onOpenStaffSchedule={(person) => openSchedule({ view: 'day', day: todayIso(), staffId: person.id })}
              onOpenUpcoming={openUpcoming}
              onNewBooking={openNewBooking}
            />
          )}

          {section === 'requests' && (
            <>
              <Panel title="Записи на подтверждение" label={`${pendingConfirmations.length} ожидают`} wide>
                <div className="role-list">
                  {pendingConfirmations.length > 0 ? pendingConfirmations.map((item) => (
                    <PendingConfirmRow
                      key={item.id}
                      item={item}
                      busy={confirmingId === item.id}
                      onConfirm={() => askConfirm(item)}
                      onOpen={() => openBookingDetail(item)}
                    />
                  )) : (
                    <p className="role-empty-note">Нет записей, ожидающих подтверждения</p>
                  )}
                </div>
              </Panel>
              <Panel title="Открытые заявки" label={`${openRequests.length} новых`} wide>
                <div className="role-list">
                  {openRequests.length > 0 ? openRequests.map((item) => (
                    <RequestRow key={item.id} item={item} onAccept={() => acceptOrder(item.id)} />
                  )) : (
                    <p className="role-empty-note">Открытых заявок пока нет</p>
                  )}
                </div>
              </Panel>
              <Panel title="Все записи" label={`${assignedOrders.length} в базе`} wide>
                <div className="role-list">
                  {assignedOrders.length > 0 ? assignedOrders.map((item) => (
                    <BookingRecordRow
                      key={item.id}
                      item={item}
                      onOpen={() => openBookingDetail(item)}
                    />
                  )) : (
                    <p className="role-empty-note">Записей пока нет</p>
                  )}
                </div>
              </Panel>
              <Panel title="Отменённые записи" label={`${cancelledOrders.length} отмен`} wide>
                <div className="role-list">
                  {cancelledOrders.length > 0 ? cancelledOrders.map((item) => (
                    <BookingRecordRow
                      key={item.id}
                      item={item}
                      onOpen={() => openBookingDetail(item)}
                    />
                  )) : (
                    <p className="role-empty-note">Отменённых записей нет</p>
                  )}
                </div>
              </Panel>
            </>
          )}

          {section === 'schedule' && (
            <OverviewBoard
              boardView={boardView}
              setBoardView={setBoardView}
              selectedDay={selectedDay}
              setSelectedDay={setSelectedDay}
              calendarCursor={calendarCursor}
              setCalendarCursor={setCalendarCursor}
              serviceFilter={serviceFilter}
              setServiceFilter={setServiceFilter}
              staffFilter={staffFilter}
              setStaffFilter={setStaffFilter}
              serviceList={serviceList}
              bookings={boardBookings}
              loadBookings={calendarBookings}
              upcoming={upcoming}
              staff={staff}
              confirmingId={confirmingId}
              onOpenBooking={openBookingDetail}
              onOpenRecords={() => openCabinetSection('requests')}
              onOpenStaff={() => setSection('staff')}
              onOpenStaffSchedule={(person) => openSchedule({ view: 'day', day: todayIso(), staffId: person.id })}
              onOpenUpcoming={openUpcoming}
              onNewBooking={openNewBooking}
            />
          )}

          {section === 'staff' && (
            <Panel title="Сотрудники" label={`${staff.length} в базе`} wide>
              <form className="role-edit-form ex-staff-form" onSubmit={saveStaff}>
                <input
                  value={staffDraft.name}
                  onChange={(event) => setStaffDraft((draft) => ({ ...draft, name: event.target.value }))}
                  placeholder="Имя сотрудника"
                  required
                />
                <input
                  value={staffDraft.position}
                  onChange={(event) => setStaffDraft((draft) => ({ ...draft, position: event.target.value }))}
                  placeholder="Должность, например мастер"
                />
                <input
                  value={staffDraft.phone}
                  onChange={(event) => setStaffDraft((draft) => ({ ...draft, phone: event.target.value }))}
                  placeholder="Телефон"
                />
                <button type="submit" className="primary-button small">Добавить</button>
              </form>
              {staff.length > 0 ? (
                <ul className="ex-client-list">
                  {staff.map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <p className="role-empty-note">{item.position}{item.phone ? ` · ${item.phone}` : ''}</p>
                      </div>
                      <button type="button" className="text-action" onClick={() => removeStaff(item.id)}>
                        Удалить
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="role-empty-note">Добавьте сотрудников — без них нельзя подтвердить запись.</p>
              )}
            </Panel>
          )}

          {section === 'clients' && (
            <Panel title="Клиенты" label={`${uniqueClients.length} из базы`} wide>
              {uniqueClients.length > 0 ? (
                <ul className="ex-client-list">
                  {uniqueClients.map((item) => (
                    <li key={item.id}>
                      <strong>{item.name}</strong>
                      <span>{item.visits} записей</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="role-empty-note">Клиенты появятся после первых записей.</p>
              )}
            </Panel>
          )}

          {section === 'stats' && (
            <Panel title="Отмены" label={`${cancelledOrders.length} записей`} wide>
              {cancelledOrders.length > 0 ? (
                <ul className="ex-client-list">
                  {cancelledOrders.map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>{item.title}</strong>
                        <p className="role-empty-note">
                          {item.customer_name}
                          {item.visit_date ? ` · ${formatWhen(item.visit_date, item.visit_time)}` : ''}
                        </p>
                        <p className="ex-record-reason">
                          Причина: {item.cancel_reason || 'не указана'}
                        </p>
                      </div>
                      <span>{statusLabel(item.status)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="role-empty-note">Отменённых записей пока нет — они появятся в статистике.</p>
              )}
            </Panel>
          )}

          {(section === 'service' || section === 'settings') && (
            <div className="role-settings-stack">
              <Panel title="Данные автосервиса" wide>
                {editingProfile ? (
                  <form className="role-edit-form ex-profile-form" onSubmit={saveProfile}>
                    <p className="ex-profile-hint">
                      Название, город, адрес, телефон и часы работы подставляются
                      из регистрации. Здесь их можно уточнить.
                    </p>
                    <label>
                      Название автосервиса
                      <input
                        value={profileDraft.name}
                        onChange={(event) => setProfileDraft((d) => ({ ...d, name: event.target.value }))}
                        placeholder="Например, АвтоПро"
                        required
                      />
                    </label>
                    <label>
                      Email
                      <input value={user?.email || ''} disabled readOnly />
                      <small>Как при регистрации, изменить нельзя</small>
                    </label>
                    <label>
                      Город
                      <select
                        value={profileDraft.city}
                        onChange={(event) => setProfileDraft((d) => ({ ...d, city: event.target.value }))}
                      >
                        {CITIES.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Адрес
                      <input
                        value={profileDraft.address}
                        onChange={(event) => setProfileDraft((d) => ({ ...d, address: event.target.value }))}
                        placeholder="Улица, дом"
                        required
                      />
                    </label>
                    <label>
                      Телефон
                      <input
                        type="tel"
                        value={profileDraft.phone}
                        onChange={(event) => setProfileDraft((d) => ({
                          ...d,
                          phone: formatShopPhone(event.target.value),
                        }))}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </label>
                    <label>
                      Часы работы
                      <input
                        value={profileDraft.hours}
                        onChange={(event) => setProfileDraft((d) => ({ ...d, hours: event.target.value }))}
                        placeholder="09:00–20:00"
                      />
                    </label>
                    <label>
                      Описание
                      <textarea
                        value={profileDraft.description}
                        onChange={(event) => setProfileDraft((d) => ({ ...d, description: event.target.value }))}
                        placeholder="Коротко расскажите о сервисе"
                      />
                    </label>
                    <label>
                      Статус
                      <select
                        value={profileDraft.status}
                        onChange={(event) => setProfileDraft((d) => ({ ...d, status: event.target.value }))}
                      >
                        <option value="Открыто">Открыто</option>
                        <option value="Закрыто">Закрыто</option>
                      </select>
                    </label>
                    {profileError ? (
                      <p className="confirm-modal-error">{profileError}</p>
                    ) : null}
                    <div className="ex-cab-inline-actions">
                      <button type="submit" className="primary-button small">Сохранить</button>
                      <button type="button" className="customer-outline-button" onClick={() => setEditingProfile(false)}>Отмена</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <SettingRow label="Название" value={profile?.name || user?.name || 'Не указано'} />
                    <SettingRow label="Email" value={user?.email || 'Не указан'} />
                    <SettingRow label="Телефон" value={profile?.phone || 'Не указан'} />
                    <SettingRow label="Город" value={profile?.city || 'Не указан'} />
                    <SettingRow label="Адрес" value={profile?.address || 'Не указан'} />
                    <SettingRow label="Часы работы" value={
                      profile?.hours && profile.hours !== PLACEHOLDER_HOURS
                        ? profile.hours
                        : 'Не указаны'
                    } />
                    <SettingRow
                      label="Описание"
                      value={
                        profile?.description && profile.description !== PLACEHOLDER_DESCRIPTION
                          ? profile.description
                          : 'Не указано'
                      }
                    />
                    <SettingRow label="Статус" value={profile?.status || 'Не указан'} />
                    <div className="role-settings-action">
                      <button type="button" className="customer-outline-button" onClick={startEditProfile}>
                        Редактировать профиль
                      </button>
                    </div>
                  </>
                )}
              </Panel>
            </div>
          )}

          {section === 'services' && (
            <Panel
              title="Услуги сервиса"
              label={`${pickedServices.length} выбрано`}
              wide
            >
              <p className="role-empty-note">
                Отметьте услуги, которые выполняет автосервис.
                Этот же список увидят клиенты при записи, и по нему
                сработает подстановка в новой записи.
              </p>
              <ServicesCatalogEditor
                groups={catalogGroups}
                selected={pickedServices}
                onToggle={togglePickedService}
                onToggleGroup={setGroupPicked}
              />
              {servicesError ? (
                <p className="confirm-modal-error">{servicesError}</p>
              ) : null}
              <div className="ex-svc-save">
                <span>
                  {servicesSaved && !servicesDirty
                    ? 'Сохранено'
                    : `${pickedServices.length} услуг в профиле`}
                </span>
                <button
                  type="button"
                  className="customer-primary-button"
                  disabled={servicesSaving || !servicesDirty}
                  onClick={saveServices}
                >
                  {servicesSaving ? 'Сохраняем…' : 'Сохранить услуги'}
                </button>
              </div>
            </Panel>
          )}

          {section === 'reviews' && (
            <Panel
              title="Отзывы"
              label={shopReviews.length ? `${shopReviews.length} в базе` : 'из базы'}
              wide
            >
              {shopReviews.length > 0 ? (
                <>
                  <p className="role-empty-note">
                    Рейтинг сервиса {profile?.rating || 0} из 5
                    {' · '}
                    {shopReviews.length} {shopReviews.length === 1 ? 'отзыв' : 'отзывов'}
                  </p>
                  <ul className="ex-review-list">
                    {shopReviews.map((review) => (
                      <li key={review.id} className="ex-review-card">
                        <div className="ex-review-card-top">
                          <span className="ex-review-avatar" aria-hidden="true">
                            {initials(review.author_name)}
                          </span>
                          <div>
                            <strong>{review.author_name || 'Клиент'}</strong>
                            <span className="ex-review-stars">
                              {'★'.repeat(Number(review.rating) || 0)}
                              {'☆'.repeat(Math.max(0, 5 - (Number(review.rating) || 0)))}
                            </span>
                          </div>
                          <time>{formatReviewDate(review.created_at)}</time>
                        </div>
                        {review.text ? (
                          <p>{review.text}</p>
                        ) : (
                          <p className="role-empty-note">Без комментария</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="role-empty-note">
                  Отзывов пока нет. Они появятся, когда клиенты оценят автосервис.
                </p>
              )}
            </Panel>
          )}
        </section>
      </main>

      {confirmTarget ? (
        <div className="confirm-modal-backdrop" role="presentation" onClick={() => !confirmingId && setConfirmTarget(null)}>
          <div className="confirm-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="confirm-modal-close" onClick={() => setConfirmTarget(null)} aria-label="Закрыть">×</button>
            <p className="confirm-modal-label">Подтверждение записи</p>
            <h2>Назначьте сотрудника</h2>
            <p>
              {confirmTarget.title}
              {confirmTarget.customer_name ? ` · ${confirmTarget.customer_name}` : ''}
              {confirmTarget.visit_date ? ` · ${formatWhen(confirmTarget.visit_date, confirmTarget.visit_time)}` : ''}
            </p>
            {staff.length > 0 ? (
              <label className="cancel-reason-field" htmlFor="confirm-staff">
                Сотрудник
                <select
                  id="confirm-staff"
                  value={confirmStaffId}
                  onChange={(event) => setConfirmStaffId(event.target.value)}
                >
                  {staff.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                      {item.position ? ` · ${item.position}` : ''}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="confirm-modal-error">
                Сначала добавьте сотрудников в разделе «Сотрудники».
              </p>
            )}
            {confirmError ? <p className="confirm-modal-error">{confirmError}</p> : null}
            <div className="confirm-modal-actions">
              <button type="button" className="customer-outline-button" onClick={() => setConfirmTarget(null)}>
                Отмена
              </button>
              <button
                type="button"
                className="customer-primary-button"
                disabled={Boolean(confirmingId) || staff.length === 0}
                onClick={confirmOrder}
              >
                {confirmingId ? 'Подтверждаем…' : 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {newBookingOpen ? (
        <div
          className="confirm-modal-backdrop"
          role="presentation"
          onClick={() => !newBookingSaving && setNewBookingOpen(false)}
        >
          <div
            className="confirm-modal booking-detail-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="confirm-modal-close"
              onClick={() => setNewBookingOpen(false)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <p className="confirm-modal-label">Запись</p>
            <h2>Новая запись</h2>
            <form className="ex-new-form" onSubmit={submitNewBooking}>
              <label className="cancel-reason-field">
                Имя клиента
                <input
                  value={newBooking.guest_name}
                  onChange={(event) => setNewBooking((draft) => ({
                    ...draft,
                    guest_name: event.target.value,
                  }))}
                  placeholder="Например, Иван Петров"
                />
              </label>
              <div className="cancel-reason-field">
                <span>Услуга</span>
                {serviceList.length > 0 ? (
                  <ServiceSuggest
                    value={newBooking.title}
                    options={serviceList}
                    onChange={(title) => setNewBooking((draft) => ({
                      ...draft,
                      title,
                    }))}
                    placeholder="Начните вводить, например замена"
                  />
                ) : (
                  <p className="confirm-modal-error">
                    Сначала отметьте услуги в разделе «Услуги».
                  </p>
                )}
              </div>
              <label className="cancel-reason-field">
                Мастер
                <select
                  value={newBooking.staff_id}
                  onChange={(event) => setNewBooking((draft) => ({
                    ...draft,
                    staff_id: event.target.value,
                  }))}
                >
                  {staff.length > 0 ? (
                    staff.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}{item.position ? ` · ${item.position}` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="">Сначала добавьте сотрудников</option>
                  )}
                </select>
              </label>
              <div className="ex-new-form-row">
                <label className="cancel-reason-field">
                  Дата
                  <input
                    type="date"
                    value={newBooking.visit_date}
                    onChange={(event) => setNewBooking((draft) => ({
                      ...draft,
                      visit_date: event.target.value,
                    }))}
                  />
                </label>
                <label className="cancel-reason-field">
                  Время
                  <select
                    value={newBooking.visit_time}
                    onChange={(event) => setNewBooking((draft) => ({
                      ...draft,
                      visit_time: event.target.value,
                    }))}
                  >
                    {HOURS.map((hour) => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </select>
                </label>
              </div>
              {newBookingError ? (
                <p className="confirm-modal-error">{newBookingError}</p>
              ) : null}
              <div className="confirm-modal-actions">
                <button
                  type="button"
                  className="customer-outline-button"
                  onClick={() => setNewBookingOpen(false)}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="customer-primary-button"
                  disabled={newBookingSaving || staff.length === 0 || serviceList.length === 0}
                >
                  {newBookingSaving ? 'Сохраняем…' : 'Создать запись'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {bookingDetail ? (
        <div
          className="confirm-modal-backdrop"
          role="presentation"
          onClick={() => setBookingDetail(null)}
        >
          <div
            className="confirm-modal booking-detail-modal"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="confirm-modal-close"
              onClick={() => setBookingDetail(null)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <p className="confirm-modal-label">
              {isUnackedCancel(bookingDetail) ? 'Оповещение об отмене' : 'Запись'}
            </p>
            <h2>{bookingDetail.customer_name || 'Клиент'}</h2>
            {isUnackedCancel(bookingDetail) ? (
              <p>Клиент отменил запись. Отметьте, что вы оповещены.</p>
            ) : null}
            <dl className="booking-detail-list">
              <div>
                <dt>Услуга</dt>
                <dd>{bookingDetail.title || '—'}</dd>
              </div>
              <div>
                <dt>Дата и время</dt>
                <dd>
                  {bookingDetail.visit_date
                    ? formatWhen(bookingDetail.visit_date, bookingDetail.visit_time)
                    : 'Не указано'}
                </dd>
              </div>
              <div>
                <dt>Мастер</dt>
                <dd>
                  {bookingDetail.staff_name
                    ? `${bookingDetail.staff_name}${bookingDetail.staff_position ? ` · ${bookingDetail.staff_position}` : ''}`
                    : 'Ещё не назначен'}
                </dd>
              </div>
              {bookingDetail.car_label && bookingDetail.car_label !== 'Автомобиль не указан' ? (
                <div>
                  <dt>Автомобиль</dt>
                  <dd>{bookingDetail.car_label}</dd>
                </div>
              ) : null}
              <div>
                <dt>Статус</dt>
                <dd>{statusLabel(bookingDetail.status)}</dd>
              </div>
              {bookingDetail.description ? (
                <div>
                  <dt>Комментарий</dt>
                  <dd>{bookingDetail.description}</dd>
                </div>
              ) : null}
              {bookingDetail.status === 'Отменён' ? (
                <div>
                  <dt>Причина отмены</dt>
                  <dd>{bookingDetail.cancel_reason || 'Не указана'}</dd>
                </div>
              ) : null}
            </dl>
            {bookingDetail.status === 'Отменён' ? (
              <label className="ex-ack-check">
                <input
                  type="checkbox"
                  checked={Boolean(bookingDetail.cancel_ack_at)}
                  disabled={Boolean(bookingDetail.cancel_ack_at) || ackingId === bookingDetail.id}
                  onChange={() => ackCancel(bookingDetail)}
                />
                {bookingDetail.cancel_ack_at
                  ? 'Оповещён об отмене'
                  : ackingId === bookingDetail.id
                    ? 'Сохраняем…'
                    : 'Оповещён об отмене'}
              </label>
            ) : null}
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="customer-outline-button"
                onClick={() => setBookingDetail(null)}
              >
                Закрыть
              </button>
              {bookingDetail.status === 'Ожидает подтверждения' ? (
                <button
                  type="button"
                  className="customer-primary-button"
                  onClick={() => {
                    setBookingDetail(null);
                    askConfirm(bookingDetail);
                  }}
                >
                  Подтвердить
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OverviewBoard({
  boardView,
  setBoardView,
  selectedDay,
  setSelectedDay,
  calendarCursor,
  setCalendarCursor,
  serviceFilter,
  setServiceFilter,
  staffFilter = 'all',
  setStaffFilter,
  serviceList,
  bookings,
  loadBookings,
  upcoming,
  staff = [],
  confirmingId,
  onOpenBooking,
  onOpenRecords,
  onOpenStaff,
  onOpenStaffSchedule,
  onOpenUpcoming,
  onNewBooking,
}) {
  const days = weekDays(selectedDay);
  const weekIsos = new Set(days.map((day) => day.iso));
  const staffLoad = staff.map((person) => {
    const count = (loadBookings || bookings).filter((item) => (
      item.staff_id === person.id
      && weekIsos.has(item.visit_date)
      && item.status !== 'Отменён'
    )).length;
    const max = Math.max(HOURS.length, 1);
    return {
      ...person,
      count,
      max,
      percent: Math.round((count / max) * 100),
    };
  });

  return (
    <>
      <div className="ex-board">
        <section className="ex-tt">
          <div className="ex-tt-toolbar">
            <div className="ex-tt-title">
              <h2>Расписание</h2>
              <div className="ex-tt-date-nav">
                <button type="button" onClick={() => setSelectedDay(addDays(selectedDay, boardView === 'week' ? -7 : -1))}>‹</button>
                <span>
                  {boardView === 'week'
                    ? `${formatDateLabel(days[0].iso)} — ${formatDateLabel(days[6].iso)}`
                    : formatDateLabel(selectedDay, true)}
                </span>
                <button type="button" onClick={() => setSelectedDay(addDays(selectedDay, boardView === 'week' ? 7 : 1))}>›</button>
              </div>
            </div>
            <div className="ex-tt-filters">
              {['day', 'week', 'month'].map((view) => (
                <button
                  key={view}
                  type="button"
                  className={boardView === view ? 'is-active' : ''}
                  onClick={() => setBoardView(view)}
                >
                  {view === 'day' ? 'День' : view === 'week' ? 'Неделя' : 'Месяц'}
                </button>
              ))}
              <select
                value={serviceFilter}
                onChange={(event) => setServiceFilter(event.target.value)}
              >
                <option value="all">Все услуги</option>
                {serviceList.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <select
                value={staffFilter}
                onChange={(event) => setStaffFilter?.(event.target.value)}
              >
                <option value="all">Все мастера</option>
                {staff.map((person) => (
                  <option key={person.id} value={person.id}>{person.name}</option>
                ))}
              </select>
            </div>
          </div>

          {boardView === 'month' ? (
            <MonthBoard
              year={calendarCursor.year}
              month={calendarCursor.month}
              selectedDay={selectedDay}
              bookings={bookings}
              onSelectDay={setSelectedDay}
              onPrev={() => setCalendarCursor((c) => {
                const date = new Date(c.year, c.month - 1, 1);
                return { year: date.getFullYear(), month: date.getMonth() };
              })}
              onNext={() => setCalendarCursor((c) => {
                const date = new Date(c.year, c.month + 1, 1);
                return { year: date.getFullYear(), month: date.getMonth() };
              })}
            />
          ) : (
            <WeekGrid
              days={boardView === 'day' ? days.filter((day) => day.iso === selectedDay) : days}
              bookings={bookings}
              confirmingId={confirmingId}
              onOpenBooking={onOpenBooking}
              onSlotClick={(visit_date, visit_time) => onNewBooking({ visit_date, visit_time })}
            />
          )}

          <div className="ex-legend">
            <span className="ok">Подтверждена</span>
            <span className="wait">Ожидает подтверждения</span>
            <span className="work">В работе</span>
            <span className="cancel">Отменена</span>
          </div>
        </section>

        <aside className="ex-side">
          <div className="ex-next">
            <div className="ex-next-head">
              <h3>Следующие записи</h3>
              <button type="button" onClick={onOpenRecords}>Все записи</button>
            </div>
            {upcoming.length > 0 ? upcoming.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`ex-next-item is-${chipTone(item.status)}`}
                onClick={() => onOpenUpcoming?.(item)}
              >
                <div className="ex-next-avatar" aria-hidden="true">
                  {initials(item.customer_name)}
                </div>
                <div className="ex-next-copy">
                  <div className="ex-next-line">
                    <time>{formatUpcomingWhen(item.visit_date, item.visit_time)}</time>
                    <strong>{shortName(item.customer_name)}</strong>
                    <span className={`ex-next-badge is-${chipTone(item.status)}`}>
                      {statusShort(item.status)}
                    </span>
                  </div>
                  <p>
                    {item.staff_name ? `${item.staff_name} · ` : ''}
                    {item.title}
                  </p>
                </div>
                <div className="ex-next-car" aria-hidden="true">
                  <Icon type="car" />
                </div>
                <span className="ex-next-phone" title="Открыть запись">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M6.5 4.5h3l1.2 3.2-1.6 1.6a12 12 0 0 0 5.6 5.6l1.6-1.6 3.2 1.2v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 6.7a2 2 0 0 1 2-2.2Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            )) : (
              <p className="role-empty-note">Ближайших записей нет</p>
            )}
          </div>

          <div className="ex-load">
            <div className="ex-next-head">
              <h3>Загрузка сотрудников</h3>
              <button type="button" onClick={onOpenStaff}>Подробнее →</button>
            </div>
            {staffLoad.length > 0 ? staffLoad.map((person) => (
              <button
                key={person.id}
                type="button"
                className={`ex-load-row ${String(staffFilter) === String(person.id) ? 'is-active' : ''}`}
                onClick={() => onOpenStaffSchedule?.(person)}
              >
                <div className="ex-load-avatar" aria-hidden="true">{initials(person.name)}</div>
                <div className="ex-load-copy">
                  <strong>{person.name}</strong>
                  <div className="ex-load-bar">
                    <i style={{ width: `${Math.min(100, person.percent)}%` }} />
                  </div>
                </div>
                <span>{person.count} / {person.max} · {person.percent}%</span>
              </button>
            )) : (
              <p className="role-empty-note">Добавьте сотрудников, чтобы видеть загрузку.</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function WeekGrid({ days, bookings, confirmingId, onOpenBooking, onSlotClick }) {
  const scrollerRef = useRef(null);
  const firstHitRef = useRef(null);
  const isDay = days.length === 1;
  const nowHour = currentHourLabel();
  const byCell = useMemo(() => {
    const map = new Map();
    bookings.forEach((item) => {
      const hour = hourOf(item.visit_time);
      if (!item.visit_date || !hour) return;
      const key = `${item.visit_date}|${hour}`;
      const list = map.get(key) || [];
      list.push(item);
      map.set(key, list);
    });
    return map;
  }, [bookings]);

  useEffect(() => {
    firstHitRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [days, bookings, isDay]);

  let pinned = false;

  return (
    <div
      ref={scrollerRef}
      className={`ex-week ${isDay ? 'is-day' : 'is-week'}`}
      style={{ '--cols': days.length }}
    >
      <div className="ex-week-head">
        <span className="ex-week-time-label">Время</span>
        {days.map((day) => (
          <div key={day.iso} className={`ex-week-col-title ${day.iso === todayIso() ? 'is-today' : ''}`}>
            <b>{day.label}</b>
            <span>{isDay ? formatDateLabel(day.iso) : day.date}</span>
          </div>
        ))}
      </div>
      {HOURS.map((hour) => (
        <div key={hour} className={`ex-week-row ${hour === nowHour ? 'is-now' : ''}`}>
          <span>{hour}</span>
          {days.map((day) => {
            const items = byCell.get(`${day.iso}|${hour}`) || [];
            const pin = !pinned && items.length > 0;
            if (pin) pinned = true;
            return (
              <div
                key={`${day.iso}-${hour}`}
                ref={pin ? firstHitRef : undefined}
                className={`ex-week-cell ${items.length ? 'has-item' : ''}`}
              >
                {items.length === 0 ? (
                  <button
                    type="button"
                    className="ex-week-free"
                    onClick={() => onSlotClick?.(day.iso, hour)}
                  >
                    {isDay ? 'Свободно' : ''}
                  </button>
                ) : items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`ex-chip ${isDay ? 'is-card' : ''} is-${chipTone(item.status)} ${isUnackedCancel(item) ? 'is-blink' : ''}`}
                    onClick={() => onOpenBooking?.(item)}
                    disabled={confirmingId === item.id}
                    title={`${item.customer_name} · ${item.title}`}
                  >
                    {isDay ? (
                      <span className="ex-chip-avatar">{initials(item.customer_name)}</span>
                    ) : null}
                    <span className="ex-chip-body">
                      <strong>{shortName(item.customer_name)}</strong>
                      <em>{item.status === 'Отменён' ? 'Отменена' : item.title}</em>
                      {isDay && item.staff_name ? <small>{item.staff_name}</small> : null}
                    </span>
                    {isDay ? <time>{timeRange(item.visit_time)}</time> : null}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function currentHourLabel() {
  const hour = new Date().getHours();
  if (hour < 8 || hour > 20) return null;
  return `${String(hour).padStart(2, '0')}:00`;
}

const PLACEHOLDER_HOURS = 'Уточняется';
const PLACEHOLDER_DESCRIPTION = 'Профиль автосервиса ещё не заполнен.';

function profileToDraft(profile, user) {
  const hours = profile?.hours || '';
  const description = profile?.description || '';
  return {
    name: profile?.name || user?.name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || DEFAULT_CITY,
    hours: !hours || hours === PLACEHOLDER_HOURS ? '' : hours,
    description: !description || description === PLACEHOLDER_DESCRIPTION ? '' : description,
    status: profile?.status || 'Открыто',
  };
}

function formatShopPhone(value) {
  let digits = String(value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (!digits) return '';
  if (digits[0] !== '7') digits = `7${digits}`.slice(0, 11);
  const rest = digits.slice(1);
  let result = '+7';
  if (rest.length) result += ` (${rest.slice(0, 3)}`;
  if (rest.length >= 3) result += ')';
  if (rest.length > 3) result += ` ${rest.slice(3, 6)}`;
  if (rest.length > 6) result += `-${rest.slice(6, 8)}`;
  if (rest.length > 8) result += `-${rest.slice(8, 10)}`;
  return result;
}

function MonthBoard({ year, month, selectedDay, bookings, onSelectDay, onPrev, onNext }) {
  const cells = buildMonthCells(year, month);
  const label = new Date(year, month, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const byDate = useMemo(() => {
    const map = new Map();
    bookings.forEach((item) => {
      if (!item.visit_date) return;
      const list = map.get(item.visit_date) || [];
      list.push(item);
      map.set(item.visit_date, list);
    });
    return map;
  }, [bookings]);

  return (
    <div className="ex-month">
      <div className="ex-mini-head">
        <button type="button" onClick={onPrev}>‹</button>
        <strong>{label}</strong>
        <button type="button" onClick={onNext}>›</button>
      </div>
      <div className="ex-month-week">
        {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="ex-month-grid">
        {cells.map((cell, index) => {
          if (!cell) return <div key={`e-${index}`} className="ex-month-cell is-empty" />;
          const items = byDate.get(cell.iso) || [];
          return (
            <button
              key={cell.iso}
              type="button"
              className={`ex-month-cell ${cell.iso === selectedDay ? 'is-selected' : ''}`}
              onClick={() => onSelectDay(cell.iso)}
            >
              <b>{cell.day}</b>
              {items.slice(0, 3).map((item) => (
                <span key={item.id} className={`ex-chip is-${chipTone(item.status)}`}>
                  {item.visit_time} {shortName(item.customer_name)}
                </span>
              ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, note, action, onAction, active }) {
  const inner = (
    <>
      <div className="ex-kpi-icon"><Icon type={icon} /></div>
      <div className="ex-kpi-copy">
        <span>{label}</span>
        <strong>
          {value}
          {' '}
          <small>{note}</small>
        </strong>
        {action ? <em>{action}</em> : null}
      </div>
    </>
  );

  if (!onAction) {
    return <article className={`ex-kpi-card ${active ? 'is-active' : ''}`}>{inner}</article>;
  }

  return (
    <button
      type="button"
      className={`ex-kpi-card is-clickable ${active ? 'is-active' : ''}`}
      onClick={onAction}
    >
      {inner}
    </button>
  );
}

function SideLink({ active, icon, label, badge, dot, onClick }) {
  return (
    <button
      type="button"
      className={`ex-cab-side-link ${active ? 'is-active' : ''} ${dot ? 'has-dot' : ''}`}
      onClick={onClick}
    >
      <Icon type={icon} />
      <span>{label}</span>
      {dot ? <i className="ex-cab-nav-dot" aria-hidden="true" /> : null}
      {badge ? <b>{badge}</b> : null}
    </button>
  );
}

function ServicesCatalogEditor({ groups, selected, onToggle, onToggleGroup }) {
  const [query, setQuery] = useState('');
  const [openCats, setOpenCats] = useState(() => new Set(
    groups.slice(0, 1).map((group) => group.category),
  ));
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((name) => (
          name.toLowerCase().includes(needle)
        )),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  const searching = query.trim().length > 0;

  return (
    <div className="ex-svc">
      <div className="ex-svc-toolbar">
        <input
          className="ex-svc-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найти услугу в каталоге"
        />
      </div>
      <div className="ex-svc-groups">
        {filtered.map((group) => {
          const isOpen = searching || openCats.has(group.category);
          const selectedCount = group.items.filter((name) => (
            selectedSet.has(name)
          )).length;
          const allOn = selectedCount === group.items.length && group.items.length > 0;

          return (
            <div
              key={group.category}
              className={`ex-svc-group${isOpen ? ' is-open' : ''}`}
            >
              <button
                type="button"
                className="ex-svc-head"
                aria-expanded={isOpen}
                onClick={() => {
                  if (searching) return;
                  setOpenCats((current) => {
                    const next = new Set(current);
                    if (next.has(group.category)) next.delete(group.category);
                    else next.add(group.category);
                    return next;
                  });
                }}
              >
                <b>{group.category}</b>
                {selectedCount > 0 ? (
                  <i className="ex-svc-count">{selectedCount}</i>
                ) : null}
                <span className="ex-svc-arrow">{isOpen ? '▾' : '▸'}</span>
              </button>
              {isOpen ? (
                <div className="ex-svc-body">
                  <div className="ex-svc-group-actions">
                    <button
                      type="button"
                      onClick={() => onToggleGroup(group.items, !allOn)}
                    >
                      {allOn ? 'Снять группу' : 'Выбрать группу'}
                    </button>
                  </div>
                  {group.items.map((name) => (
                    <label key={name} className="ex-svc-item">
                      <input
                        type="checkbox"
                        checked={selectedSet.has(name)}
                        onChange={() => onToggle(name)}
                      />
                      {name}
                    </label>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Panel({ title, label, children, wide }) {
  return (
    <section className={`role-card ${wide ? 'wide' : ''}`}>
      <div className="role-card-heading">
        <div>
          <h2>{title}</h2>
          {label ? <span>{label}</span> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function PendingConfirmRow({ item, onConfirm, onOpen, busy }) {
  return (
    <article className="executor-request-card">
      <button type="button" className="role-request-icon" onClick={onOpen} aria-label="Открыть запись">
        <Icon type="clipboard" />
      </button>
      <div className="executor-request-main">
        <div className="executor-request-title">
          <h3>
            <button type="button" className="ex-record-link" onClick={onOpen}>{item.title}</button>
          </h3>
          <span>{formatWhen(item.visit_date, item.visit_time)}</span>
        </div>
        <p>
          {item.customer_name}
          {item.car_label && item.car_label !== 'Автомобиль не указан' ? ` · ${item.car_label}` : ''}
        </p>
        <strong>Ожидает подтверждения</strong>
      </div>
      <button type="button" className="primary-button small" disabled={busy} onClick={onConfirm}>
        {busy ? 'Подтверждаем…' : 'Подтвердить →'}
      </button>
    </article>
  );
}

function BookingRecordRow({ item, onOpen }) {
  return (
    <article className={`executor-request-card ${item.status === 'Отменён' ? 'is-cancelled' : ''}`}>
      <div className="role-request-icon"><Icon type={item.status === 'Отменён' ? 'clock' : 'clipboard'} /></div>
      <div className="executor-request-main">
        <div className="executor-request-title">
          <h3>{item.title}</h3>
          <span>{formatWhen(item.visit_date, item.visit_time)}</span>
        </div>
        <p>
          {item.customer_name}
          {item.staff_name ? ` · ${item.staff_name}` : ''}
          {item.car_label && item.car_label !== 'Автомобиль не указан' ? ` · ${item.car_label}` : ''}
        </p>
        <strong className={`ex-record-status is-${statusTone(item.status)}`}>
          {statusLabel(item.status)}
        </strong>
        {item.status === 'Отменён' ? (
          <p className="ex-record-reason">
            Причина: {item.cancel_reason || 'не указана'}
            {isUnackedCancel(item) ? ' · нужно подтвердить оповещение' : ''}
          </p>
        ) : null}
      </div>
      <button type="button" className="primary-button small" onClick={onOpen}>
        Открыть
      </button>
    </article>
  );
}

function RequestRow({ item, onAccept }) {
  return (
    <article className="executor-request-card">
      <div className="role-request-icon"><Icon type="car" /></div>
      <div className="executor-request-main">
        <div className="executor-request-title">
          <h3>{item.title}</h3>
          <span>{formatWhen(item.visit_date, item.visit_time)}</span>
        </div>
        <p>
          {item.customer_name}
          {item.car_label ? ` · ${item.car_label}` : ''}
        </p>
      </div>
      <button type="button" className="primary-button small" onClick={onAccept}>Принять →</button>
    </article>
  );
}

function SettingRow({ label, value }) {
  return (
    <div className="role-setting-row">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
