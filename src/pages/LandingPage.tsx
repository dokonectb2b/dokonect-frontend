import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  X,
  Store,
  Truck,
  ChevronRight,
  Clock,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  MessageSquare,
  CreditCard,
  AlertCircle,
  Hexagon,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import api from "../api/api";
import toast from "react-hot-toast";

type Lang = "uz" | "en" | "ru";

const TRANSLATIONS: Record<Lang, any> = {
  uz: {
    nav: {
      features: "Xususiyatlar",
      pricing: "Narxlar",
      comparison: "Taqqoslash",
      contact: "Bog'lanish",
      demoBtn: "Demo Ko'rish",
      startBtn: "Boshlash",
    },
    language: { uz: "UZ", en: "EN", ru: "RU" },
    hero: {
      topBadge: "DISTRIBYUTORLAR UCHUN #1 PLATFORMA",
      headline: ["Agentsiz", "Savdo."],
      secondaryHeadline: ["Avtomatik", "Buyurtma."],
      tertiaryHeadline: ["To'liq", "Nazorat."],
      subheadline:
        "Distribyutor va do'kon egasi o'rtasidagi vositachini yo'q qiling. Buyurtmalar avtomatik, to'lovlar shaffof, yetkazib berish real-time nazoratda.",
      ctaStart: "Bepul Boshlash",
      ctaDemo: "Demo Ko'rish",
      benefits: [
        "1 oylik bepul sinov",
        "Shartnoma talab qilinmaydi",
        "O'zbek texnik qo'llab-quvvatlash",
      ],
    },
    dashboard: {
      title: "Dokonect Dashboard",
      orders: "Buyurtmalar",
      revenue: "Daromad",
      stores: "Do'konlar",
      days: ["Du", "Se", "Ch", "Pa", "Ju"],
      newOrders: "Yangi buyurtmalar",
      newOrdersCount: "3 ta",
      confirmed: "Tasdiqlandi",
      locationTime: "Toshkent · 15:20",
      catalog: "Katalog",
      tea: "Choy",
      water: "Suv",
      price: "Narx",
      priceValue: "99,000 so'm",
      orderBtn: "Buyurtma berish",
    },
    problem: {
      sectionTitle: "MUAMMO",
      heading: "Nima uchun eski tizim ishlamaydi?",
      description: "O'zbekistondagi distribyutorlar har kuni shu muammolarga duch keladi.",
      cards: [
        {
          stat: "500M so'm",
          label: "oylik agent xarajati (50 agent)",
          desc: "Har bir agent uchun 10M so'mgacha sarflanadi. Bu xarajat mahsulot sifatiga emas, vositachiga ketadi.",
        },
        {
          stat: "40%",
          label: "agentlar yil davomida almashadi",
          desc: "Har yangi agent = yo'qolgan mijozlar, tushunmovchiliklar va pasaygan savdo.",
        },
        {
          stat: "Milliardlar",
          label: "nazorat qilinmagan qarzdorliklar",
          desc: "Nasiya savdolar qog'ozda yoki esda yuritiladi. Natijada katta moliyaviy yo'qotishlar.",
        },
      ],
    },
    solution: {
      sectionTitle: "YECHIM",
      heading: "Dokonect qanday ishlaydi?",
      description: "4 ta oddiy qadam — to'liq avtomatlashtirilgan jarayon.",
      steps: [
        {
          title: "Do'kon egasi buyurtma beradi",
          desc: "Mobil ilova orqali katalogdan mahsulot tanlaydi, yetkazib berish vaqtini belgilaydi.",
        },
        {
          title: "Buyurtma avtomatik tushadi",
          desc: "Distributor paneliga real-time bildirishnoma keladi, hech qanday agent kerak emas.",
        },
        {
          title: "Haydovchiga biriktiriladi",
          desc: "Haydovchi mobil ilovasida marshrut va yuklar ko'rinadi, GPS kuzatuv ishlaydi.",
        },
        {
          title: "To'lov qabul qilinadi",
          desc: "Naqd yoki online to'lov, avtomatik hisobot, nasiya holati real-time yangilanadi.",
        },
      ],
      panelTitle: "Dokonect boshqaruv paneli",
      panelHeading: "Barcha jarayonlarni bir joydan kuzating",
      demoBtn: "Demo ko'rish",
      panelStats: [
        { label: "Buyurtmalar", value: "312" },
        { label: "Yetkazildi", value: "98%" },
        { label: "Daromad", value: "$12.2K" },
      ],
    },
    features: {
      sectionTitle: "XUSUSIYATLAR",
      heading: "Hammasi bir platformada",
      cards: [
        {
          title: "Online Buyurtma",
          desc: "Do'kon egalari 24/7 buyurtma beradi. Agent kelishini kutish shart emas.",
        },
        {
          title: "Real-time Dashboard",
          desc: "Barcha buyurtmalar, to'lovlar va yetkazib berishlar bir ko'rinishda.",
        },
        {
          title: "Nasiya Boshqaruvi",
          desc: "Har bir do'konning qarzdorligi avtomatik kuzatiladi, eslatmalar yuboriladi.",
        },
        {
          title: "Haydovchi Ilovasi",
          desc: "Optimallashtirilgan marshrut, yetkazib berish tasdiqlash, to'lov qabul.",
        },
        {
          title: "Savdo Analitikasi",
          desc: "Qaysi mahsulot ko'p sotiladi, qaysi do'kon aktiv — barchasi grafikda.",
        },
        {
          title: "Smart Notification",
          desc: "Do'kon egalariga SMS va push — aksiyalar, yangi mahsulotlar, eslatmalar.",
        },
      ],
    },
    stats: {
      heading: "Agent bilan bog'liq muammolarni yeching, va driver ustidan nazoratni qo'lga oling",
      labels: ["Xarajatlar kamayishi", "Sotuv o'sishi", "Aktiv do'konlar", "Tizim faolligi"],
    },
    pricing: {
      sectionTitle: "NARXLAR",
      heading: "Oddiy va shaffof narxlar",
      description: "Yashirin to'lovlar yo'q. Istalgan vaqt bekor qilish mumkin.",
      monthly: "Oylik",
      yearly: "Yillik (-17%)",
      periodMonth: "oy",
      periodYear: "yil",
      basicLabel: "ODDIY",
      premiumLabel: "PREMIUM",
      basicDescription: "Kichik va o'rta distribyutorlar uchun",
      premiumDescription: "Yirik distribyutorlar uchun to'liq paket",
      basicFeatures: [
        "40 tagacha mahsulot joylash",
        "Driver uchun mobil ilova",
        "Sotuv dinamikasi va grafiklar",
        "Chat tizimi (distribyutor ↔ do'kon)",
        "Sklad (inventar) boshqaruvi",
        "Reklama bannerlari",
        "Rekomendatsiya tizimi",
        "Push notification",
      ],
      premiumFeatures: [
        "Cheksiz mahsulot joylash",
        "Reklama bannerlari (do'kon ilovasida)",
        "Mahsulot rekomendatsiya tizimi (AI)",
        "Driver uchun mobil ilova",
        "Sotuv dinamikasi va chuqur analitika",
        "Chat tizimi",
        "Inventar (ombor) boshqaruvi",
        "Mijozlarga push notification",
      ],
      yearlyInfo: "Yillik to'lasangiz — 2 oy bepul (17% tejaysiz)",
      trialText: "14 kunlik bepul sinov",
      trialFooter: "14 kunlik bepul sinov • Kredit karta shart emas",
      recommendedLabel: "⭐ Tavsiya etiladi",
    },
    comparison: {
      sectionTitle: "TAQQOSLASH",
      heading: "Nima uchun Dokonect?",
      featureHeader: "Xususiyat",
      rows: [
        ["Agent bog'liqligi", "✗ Yo'q", "✓ Bor", "✓ Bor", "✓ Bor"],
        ["Do'kon mobil ilovasi", "✓ Bor", "✗ Yo'q", "✗ Yo'q", "✗ Yo'q"],
        ["Online buyurtma 24/7", "✓ Bor", "✗ Yo'q", "✗ Yo'q", "✗ Yo'q"],
        ["Nasiya boshqaruvi", "✓ Bor", "✓ Bor", "✗ Yo'q", "✗ Yo'q"],
        ["Driver ilovasi", "✓ Bor", "✗ Yo'q", "✓ Bor", "✗ Yo'q"],
        ["Push notification", "✓ Bor", "✗ Yo'q", "✗ Yo'q", "✗ Yo'q"],
        ["Reklama banneri", "✓ Bor", "✗ Yo'q", "✗ Yo'q", "✗ Yo'q"],
        ["Narxi", "$40-80", "$150+", "$100+", "$120+"],
      ],
    },
    cta: {
      sectionTitle: "HOZIROQ BOSHLANG",
      heading: "Birinchi 14 kun — mutlaqo bepul",
      description: "Kredit karta talab qilinmaydi. 1 daqiqada sozlash. Istalgan vaqt bekor qilish.",
      placeholder: "Email manzilingiz",
      button: "Bepul Boshlash →",
      secure: "🔒 Ma'lumotlar xavfsiz",
      setup: "⚡ 1 daqiqada sozlash",
    },
    footer: {
      product: "Mahsulot",
      company: "Kompaniya",
      support: "Qo'llab-quvvatlash",
      description: "O'zbekiston distribyutorlarini raqamli transformatsiyaga olib chiqamiz.",
      links: {
        feature: "Xususiyatlar",
        pricing: "Narxlar",
        news: "Yangiliklar",
        api: "API",
        about: "Biz haqimizda",
        blog: "Blog",
        careers: "Ish o'rinlari",
        partners: "Hamkorlar",
        help: "Yordam markazi",
        connect: "Bog'lanish",
        telegram: "Telegram bot",
      },
      copyright: "© 2025 Dokonect. Barcha huquqlar himoyalangan.",
      privacy: "Maxfiylik siyosati",
      terms: "Foydalanish shartlari",
    },
    demo: {
      modalTitle: "Demo hisobga kirish",
      passwordHint: "Parol barcha uchun: 123456",
      accounts: {
        distributor: {
          role: "Distribyutor",
          tag: "Mahsulot sotish va boshqarish",
        },
        client: {
          role: "Do'kon egasi",
          tag: "Mahsulot buyurtma qilish",
        },
      },
    },
    toasts: {
      success: "Xush kelibsiz!",
      error: "Xatolik yuz berdi",
    },
  },
  en: {
    nav: {
      features: "Features",
      pricing: "Pricing",
      comparison: "Comparison",
      contact: "Contact",
      demoBtn: "Watch Demo",
      startBtn: "Get Started",
    },
    language: { uz: "UZ", en: "EN", ru: "RU" },
    hero: {
      topBadge: "THE #1 PLATFORM FOR DISTRIBUTORS",
      headline: ["Agentless", "Sales."],
      secondaryHeadline: ["Automatic", "Orders."],
      tertiaryHeadline: ["Complete", "Control."],
      subheadline:
        "Remove the middleman between distributors and stores. Orders flow automatically, payments stay transparent, delivery is tracked live.",
      ctaStart: "Start Free",
      ctaDemo: "Watch Demo",
      benefits: [
        "1-month free trial",
        "No contract required",
        "Uzbek support",
      ],
    },
    dashboard: {
      title: "Dokonect Dashboard",
      orders: "Orders",
      revenue: "Revenue",
      stores: "Stores",
      days: ["Mo", "Tu", "We", "Th", "Fr"],
      newOrders: "New orders",
      newOrdersCount: "3 active",
      confirmed: "Confirmed",
      locationTime: "Tashkent · 15:20",
      catalog: "Catalog",
      tea: "Tea",
      water: "Water",
      price: "Price",
      priceValue: "99,000 UZS",
      orderBtn: "Order Now",
    },
    problem: {
      sectionTitle: "PROBLEM",
      heading: "Why old systems fail?",
      description: "Distributors in Uzbekistan face these challenges every day.",
      cards: [
        {
          stat: "500M UZS",
          label: "monthly agent cost (50 agents)",
          desc: "Each agent costs up to 10M UZS. That expense goes to middlemen, not product value.",
        },
        {
          stat: "40%",
          label: "agents churn annually",
          desc: "Every new agent means lost customers, misunderstandings, and declining sales.",
        },
        {
          stat: "Billions",
          label: "unchecked receivables",
          desc: "Credit sales are tracked on paper or memory, causing big financial losses.",
        },
      ],
    },
    solution: {
      sectionTitle: "SOLUTION",
      heading: "How Dokonect works",
      description: "4 simple steps for a fully automated process.",
      steps: [
        {
          title: "Store registers an order",
          desc: "The store selects products in the catalog and schedules delivery.",
        },
        {
          title: "Order lands automatically",
          desc: "The distributor panel receives a real-time notification with no agent needed.",
        },
        {
          title: "Driver is assigned",
          desc: "The driver sees route and load in the mobile app with GPS tracking.",
        },
        {
          title: "Payment is received",
          desc: "Cash or online payment is recorded automatically with real-time credit tracking.",
        },
      ],
      panelTitle: "Dokonect Dashboard",
      panelHeading: "Monitor all processes in one place",
      demoBtn: "Watch demo",
      panelStats: [
        { label: "Orders", value: "312" },
        { label: "Delivered", value: "98%" },
        { label: "Revenue", value: "$12.2K" },
      ],
    },
    features: {
      sectionTitle: "FEATURES",
      heading: "Everything in one platform",
      cards: [
        {
          title: "Online Ordering",
          desc: "Store owners order 24/7 without waiting for an agent.",
        },
        {
          title: "Real-time Dashboard",
          desc: "All orders, payments, and deliveries in one view.",
        },
        {
          title: "Credit Management",
          desc: "Each store's receivables are tracked automatically with reminders.",
        },
        {
          title: "Driver App",
          desc: "Optimized routes, delivery confirmations, and payment acceptance.",
        },
        {
          title: "Sales Analytics",
          desc: "See best-selling products and active stores with charts.",
        },
        {
          title: "Smart Notifications",
          desc: "Send SMS and push alerts for promotions, stock, and reminders.",
        },
      ],
    },
    stats: {
      heading: "Solve agent-related problems and take control over drivers",
      labels: ["Cost reduction", "Sales growth", "Active stores", "System uptime"],
    },
    pricing: {
      sectionTitle: "PRICING",
      heading: "Simple and transparent prices",
      description: "No hidden fees. Cancel anytime.",
      monthly: "Monthly",
      yearly: "Yearly (-17%)",
      periodMonth: "mo",
      periodYear: "yr",
      basicLabel: "BASIC",
      premiumLabel: "PREMIUM",
      basicDescription: "For small and mid-size distributors",
      premiumDescription: "Full package for large distributors",
      basicFeatures: [
        "List up to 40 products",
        "Driver mobile app",
        "Sales and analytics dashboard",
        "Distributor ↔ store chat",
        "Inventory management",
        "Ad banners",
        "Recommendation engine",
        "Push notifications",
      ],
      premiumFeatures: [
        "Unlimited product listings",
        "In-app ad banners",
        "AI product recommendations",
        "Driver mobile app",
        "Advanced sales analytics",
        "Chat system",
        "Warehouse management",
        "Customer push notifications",
      ],
      yearlyInfo: "Pay yearly — get 2 months free (save 17%)",
      trialText: "14-day free trial",
      trialFooter: "14-day free trial • No credit card required",
      recommendedLabel: "⭐ Recommended",
    },
    comparison: {
      sectionTitle: "COMPARISON",
      heading: "Why Dokonect?",
      featureHeader: "Feature",
      rows: [
        ["Agent dependency", "✗ No", "✓ Yes", "✓ Yes", "✓ Yes"],
        ["Store mobile app", "✓ Yes", "✗ No", "✗ No", "✗ No"],
        ["24/7 Online order", "✓ Yes", "✗ No", "✗ No", "✗ No"],
        ["Credit management", "✓ Yes", "✓ Yes", "✗ No", "✗ No"],
        ["Driver app", "✓ Yes", "✗ No", "✓ Yes", "✗ No"],
        ["Push notifications", "✓ Yes", "✗ No", "✗ No", "✗ No"],
        ["Ad banners", "✓ Yes", "✗ No", "✗ No", "✗ No"],
        ["Price", "$40-80", "$150+", "$100+", "$120+"],
      ],
    },
    cta: {
      sectionTitle: "START NOW",
      heading: "First 14 days completely free",
      description: "No credit card required. Set up in 1 minute. Cancel anytime.",
      placeholder: "Your email address",
      button: "Start Free →",
      secure: "🔒 Data secure",
      setup: "⚡ 1-minute setup",
    },
    footer: {
      product: "Product",
      company: "Company",
      support: "Support",
      description: "Empowering distributors in Uzbekistan with digital transformation.",
      links: {
        feature: "Features",
        pricing: "Pricing",
        news: "News",
        api: "API",
        about: "About Us",
        blog: "Blog",
        careers: "Careers",
        partners: "Partners",
        help: "Help Center",
        connect: "Contact Us",
        telegram: "Telegram Bot",
      },
      copyright: "© 2025 Dokonect. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Use",
    },
    demo: {
      modalTitle: "Demo Login",
      passwordHint: "Password for all: 123456",
      accounts: {
        distributor: {
          role: "Distributor",
          tag: "Manage and sell products",
        },
        client: {
          role: "Store Owner",
          tag: "Order products",
        },
      },
    },
    toasts: {
      success: "Welcome!",
      error: "An error occurred",
    },
  },
  ru: {
    nav: {
      features: "Функции",
      pricing: "Цены",
      comparison: "Сравнение",
      contact: "Контакты",
      demoBtn: "Смотреть демо",
      startBtn: "Начать",
    },
    language: { uz: "UZ", en: "EN", ru: "RU" },
    hero: {
      topBadge: "ПЛАТФОРМА №1 ДЛЯ ДИСТРИБЬЮТОРОВ",
      headline: ["Без агентов", "Продажи."],
      secondaryHeadline: ["Автоматические", "Заказы."],
      tertiaryHeadline: ["Полный", "Контроль."],
      subheadline:
        "Устраните посредника между дистрибьюторами и магазинами. Заказы идут автоматически, оплаты прозрачны, доставка отслеживается в реальном времени.",
      ctaStart: "Начать бесплатно",
      ctaDemo: "Смотреть демо",
      benefits: [
        "1 месяц бесплатного теста",
        "Без контракта",
        "Поддержка из Узбекистана",
      ],
    },
    dashboard: {
      title: "Панель Dokonect",
      orders: "Заказы",
      revenue: "Доход",
      stores: "Магазины",
      days: ["Пн", "Вт", "Ср", "Чт", "Пт"],
      newOrders: "Новые заказы",
      newOrdersCount: "3 шт",
      confirmed: "Подтверждено",
      locationTime: "Ташкент · 15:20",
      catalog: "Каталог",
      tea: "Чай",
      water: "Вода",
      price: "Цена",
      priceValue: "99 000 сум",
      orderBtn: "Заказать",
    },
    problem: {
      sectionTitle: "ПРОБЛЕМА",
      heading: "Почему старые системы не работают?",
      description: "Узбекские дистрибьюторы сталкиваются с этими проблемами каждый день.",
      cards: [
        {
          stat: "500M UZS",
          label: "ежемесячные затраты на агентов (50 агентов)",
          desc: "Каждый агент стоит до 10M UZS. Эти расходы идут посредникам, а не продукту.",
        },
        {
          stat: "40%",
          label: "текучесть агентов за год",
          desc: "Каждый новый агент — это потерянные клиенты, недопонимания и падение продаж.",
        },
        {
          stat: "Миллиарды",
          label: "неконтролируемые задолженности",
          desc: "Кредитные продажи ведутся на бумаге или в памяти, что приводит к большим финансовым потерям.",
        },
      ],
    },
    solution: {
      sectionTitle: "РЕШЕНИЕ",
      heading: "Как работает Dokonect",
      description: "4 простых шага к полной автоматизации.",
      steps: [
        {
          title: "Магазин делает заказ",
          desc: "Магазин выбирает товары в каталоге и назначает доставку.",
        },
        {
          title: "Заказ поступает автоматически",
          desc: "Панель дистрибьютора получает уведомление в реальном времени без агента.",
        },
        {
          title: "Водителя назначают",
          desc: "Водитель видит маршрут и груз в мобильном приложении с GPS.",
        },
        {
          title: "Платеж принимается",
          desc: "Наличные или онлайн-платеж записываются автоматически с учетом кредита в реальном времени.",
        },
      ],
      panelTitle: "Панель управления Dokonect",
      panelHeading: "Отслеживайте все процессы в одном месте",
      demoBtn: "Смотреть демо",
      panelStats: [
        { label: "Заказы", value: "312" },
        { label: "Доставлено", value: "98%" },
        { label: "Доход", value: "$12.2K" },
      ],
    },
    features: {
      sectionTitle: "ФУНКЦИИ",
      heading: "Всё на одной платформе",
      cards: [
        {
          title: "Онлайн-заказы",
          desc: "Магазины заказывают 24/7 без ожидания агента.",
        },
        {
          title: "Панель в реальном времени",
          desc: "Все заказы, оплаты и доставки в одном месте.",
        },
        {
          title: "Управление кредитами",
          desc: "Долги каждого магазина отслеживаются автоматически с напоминаниями.",
        },
        {
          title: "Приложение для водителя",
          desc: "Оптимальные маршруты, подтверждения доставки и прием платежей.",
        },
        {
          title: "Аналитика продаж",
          desc: "Смотрите самые продаваемые товары и активные магазины на графиках.",
        },
        {
          title: "Умные уведомления",
          desc: "Отправляйте SMS и push-уведомления о промо, остатках и напоминаниях.",
        },
      ],
    },
    stats: {
      heading: "Решайте проблемы с агентами и берите под контроль драйверов",
      labels: ["Снижение расходов", "Рост продаж", "Активные магазины", "Активность системы"],
    },
    pricing: {
      sectionTitle: "ЦЕНЫ",
      heading: "Простые и прозрачные цены",
      description: "Без скрытых платежей. Отменить можно в любой момент.",
      monthly: "Ежемесячно",
      yearly: "Годовой (-17%)",
      periodMonth: "мес",
      periodYear: "г",
      basicLabel: "BASIC",
      premiumLabel: "PREMIUM",
      basicDescription: "Для небольших и средних дистрибьюторов",
      premiumDescription: "Полный пакет для крупных дистрибьюторов",
      basicFeatures: [
        "Размещение до 40 товаров",
        "Мобильное приложение для водителя",
        "Панель продаж и аналитики",
        "Чат дистрибьютор ↔ магазин",
        "Управление складом",
        "Рекламные баннеры",
        "Рекомендательная система",
        "Push-уведомления",
      ],
      premiumFeatures: [
        "Неограниченное размещение товаров",
        "Рекламные баннеры внутри приложения",
        "AI-рекомендации товаров",
        "Мобильное приложение для водителя",
        "Продвинутая аналитика продаж",
        "Система чата",
        "Управление складом",
        "Push-уведомления клиентам",
      ],
      yearlyInfo: "При годовой оплате — 2 месяца бесплатно (экономия 17%)",
      trialText: "14-дневный бесплатный тест",
      trialFooter: "14-дневный бесплатный тест • Кредитная карта не требуется",
      recommendedLabel: "⭐ Рекомендуется",
    },
    comparison: {
      sectionTitle: "СРАВНЕНИЕ",
      heading: "Почему Dokonect?",
      featureHeader: "Характеристика",
      rows: [
        ["Зависимость от агентов", "✗ Нет", "✓ Есть", "✓ Есть", "✓ Есть"],
        ["Мобильное приложение магазина", "✓ Есть", "✗ Нет", "✗ Нет", "✗ Нет"],
        ["Онлайн-заказ 24/7", "✓ Есть", "✗ Нет", "✗ Нет", "✗ Нет"],
        ["Управление кредитами (насия)", "✓ Есть", "✓ Есть", "✗ Нет", "✗ Нет"],
        ["Приложение для водителя", "✓ Есть", "✗ Нет", "✓ Есть", "✗ Нет"],
        ["Push-уведомления", "✓ Есть", "✗ Нет", "✗ Нет", "✗ Нет"],
        ["Рекламный баннер", "✓ Есть", "✗ Нет", "✗ Нет", "✗ Нет"],
        ["Цена", "$40-80", "$150+", "$100+", "$120+"],
      ],
    },
    cta: {
      sectionTitle: "НАЧНИТЕ СЕЙЧАС",
      heading: "Первые 14 дней — полностью бесплатно",
      description: "Кредитная карта не требуется. Настройка за 1 минуту. Отмена в любое время.",
      placeholder: "Ваш email",
      button: "Начать бесплатно →",
      secure: "🔒 Данные защищены",
      setup: "⚡ Настройка за 1 минуту",
    },
    footer: {
      product: "Продукт",
      company: "Компания",
      support: "Поддержка",
      description: "Помогаем дистрибьюторам Узбекистана проводить цифровую трансформацию.",
      links: {
        feature: "Функции",
        pricing: "Цены",
        news: "Новости",
        api: "API",
        about: "О нас",
        blog: "Блог",
        careers: "Вакансии",
        partners: "Партнёры",
        help: "Центр помощи",
        connect: "Контакты",
        telegram: "Telegram bot",
      },
      copyright: "© 2025 Dokonect. Все права защищены.",
      privacy: "Политика конфиденциальности",
      terms: "Условия использования",
    },
    demo: {
      modalTitle: "Demo login",
      passwordHint: "Пароль для всех: 123456",
      accounts: {
        distributor: {
          role: "Дистрибьютор",
          tag: "Продажа товаров и управление",
        },
        client: {
          role: "Владелец магазина",
          tag: "Заказ товаров",
        },
      },
    },
    toasts: {
      success: "Добро пожаловать!",
      error: "Произошла ошибка",
    },
  },
};

const ALL_TEST_ACCOUNTS = [
  {
    role: "Distribyutor",
    nav: "DISTRIBUTOR",
    phone: "+998901234567",
    password: "123456",
    icon: Truck,
    tag: "Mahsulot sotish va boshqarish",
  },
  {
    role: "Do'kon egasi",
    nav: "CLIENT",
    phone: "+998901234500",
    password: "123456",
    icon: Store,
    tag: "Mahsulot buyurtma qilish",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showDemo, setShowDemo] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [lang, setLang] = useState<Lang>("uz");
  const [statsVisible, setStatsVisible] = useState(false);
  const [countValues, setCountValues] = useState<number[]>([0, 0, 0, 0]);
  const statsRef = useRef<HTMLDivElement | null>(null);

  const t = TRANSLATIONS[lang];

  const PROBLEM_ICONS = ["💸", "📉", "🔗"];
  const HOW_ICONS = ["🏪", "⚡", "🚗", "💳"];
  const FEATURE_ICONS = ["🛒", "📊", "💰", "🚗", "📈", "🔔"];
  const STATS_NUMBER_ITEMS = [
    { icon: "↓", target: 50 },
    { icon: "⚡", target: 3 },
    { icon: "🏪", target: 88 },
    { icon: "🟢", target: 24 },
  ];
  const COMPETITORS = ["Dokonect", "SmartUp", "CDAgent", "DoctorSales"];

  const problemCards = PROBLEM_ICONS.map((icon, index) => ({
    icon,
    stat: t.problem.cards[index].stat,
    label: t.problem.cards[index].label,
    desc: t.problem.cards[index].desc,
  }));

  const howSteps = HOW_ICONS.map((icon, index) => ({
    icon,
    title: t.solution.steps[index].title,
    desc: t.solution.steps[index].desc,
  }));

  const featureCards = FEATURE_ICONS.map((icon, index) => ({
    icon,
    title: t.features.cards[index].title,
    desc: t.features.cards[index].desc,
  }));

  const statsItems = STATS_NUMBER_ITEMS;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const node = statsRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const duration = 1200;
    const startTime = performance.now();
    const targets = statsItems.map((item) => item.target);
    let animationFrame = 0;

    const animate = (timestamp: number) => {
      const elapsed = Math.min(timestamp - startTime, duration);
      const progress = elapsed / duration;
      setCountValues(
        targets.map((target) => Math.floor(target * progress)),
      );
      if (elapsed < duration) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [statsVisible]);

  const pricingLabel = isYearly ? t.pricing.periodYear : t.pricing.periodMonth;
  const basicPrice = isYearly ? "$400" : "$40";
  const premiumPrice = isYearly ? "$800" : "$80";

  const handleDemo = async (acc: any) => {
    setLoadingId(acc.role);
    try {
      const res = await api.post("/api/auth/login", {
        phone: acc.phone,
        password: acc.password,
      });
      const payload = res.data?.data ?? res.data;
      const user = payload?.user ?? payload;
      const token = payload?.token ?? payload?.accessToken ?? "";
      setAuth(
        {
          id: user.id,
          name: user.name,
          email: user.email ?? "",
          phone: user.phone ?? "",
          role: user.role,
          distributorId: user.distributorId,
          clientId: user.clientId,
          driverId: user.driverId,
        },
        token,
        payload?.refreshToken ?? "",
      );
      toast.success(t.toasts.success);
      setShowDemo(false);
      const routes: any = {
        DISTRIBUTOR: "/distributor/dashboard",
        CLIENT: "/store/dashboard",
        STORE: "/store/dashboard",
        ADMIN: "/admin/dashboard",
        DRIVER: "/driver/dashboard",
      };
      navigate(routes[user.role] || "/", { replace: true });
    } catch (e: any) {
      toast.error(t.toasts.error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="landing-page min-h-screen bg-[#0A0F1E] font-sans text-[#F1F5F9] selection:bg-[#22C55E]/10 selection:text-[#22C55E]">
      <nav
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-[rgba(10,15,30,0.88)] backdrop-blur-[12px] border-b border-[rgba(255,255,255,0.06)] shadow-[0_20px_80px_rgba(0,0,0,0.18)]" : "bg-transparent"}`}
      >
        <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-[rgba(255,255,255,0.04)] px-3 py-2">
              <img src="/logo-icon.jpg" alt="Dokonect" className="h-10 w-10 rounded-2xl object-cover" />
              <div className="text-lg font-semibold tracking-[-0.02em]">
                <span className="text-[#F1F5F9]">Doko</span>
                <span className="text-[#22C55E]">nect</span>
              </div>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-10 text-sm font-medium text-[#94A3B8]">
            {[
              { label: t.nav.features, href: "#features" },
              { label: t.nav.pricing, href: "#pricing" },
              { label: t.nav.comparison, href: "#comparison" },
              { label: t.nav.contact, href: "#contact" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="transition-colors duration-200 hover:text-[#F1F5F9]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="hidden sm:flex items-center gap-2 text-[13px] text-[#64748B]">
              {(["uz", "en", "ru"] as Lang[]).map((code) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`font-semibold transition-colors ${lang === code ? "text-[#22C55E]" : "hover:text-[#F1F5F9] text-[#94A3B8]"}`}
                >
                  {t.language[code]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDemo(true)}
              className="rounded-[10px] border border-[#1E2A3A] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-[#94A3B8] transition-all duration-200 hover:border-[#1A7F5A] hover:text-[#F1F5F9]"
            >
              {t.nav.demoBtn}
            </button>
            <button
              onClick={() => navigate("/register")}
              className="rounded-[10px] bg-[#1A7F5A] px-8 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#22C55E] hover:scale-[1.04]"
            >
              {t.nav.startBtn}
            </button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden py-[120px] px-8">
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="absolute left-0 top-0 h-[260px] w-[260px] rounded-full bg-[#1A7F5A]/15 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[320px] w-[320px] rounded-full bg-[#22C55E]/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[280px] w-[280px] rounded-full bg-[#1A7F5A]/12 blur-3xl" />
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <div className="mb-6 inline-flex items-center gap-3 text-[12px] font-bold uppercase tracking-[3px] text-[#22C55E]">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#22C55E] animate-pulse-dot" />
                {t.hero.topBadge}
              </div>
              <div className="space-y-5 text-[3.5rem] font-bold leading-[1.05] tracking-[-0.04em] text-[#F1F5F9] sm:text-[4.5rem] md:text-[5rem] lg:text-[5.75rem]">
                <motion.div className="overflow-hidden">
                  {t.hero.headline.map((word, index) => (
                    <motion.span
                      key={word}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.4 }}
                      className="inline-flex"
                    >
                      {word} 
                    </motion.span>
                  ))}
                </motion.div>
                <motion.div className="overflow-hidden">
                  {t.hero.secondaryHeadline.map((word, index) => (
                    <motion.span
                      key={word}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 + index * 0.06, duration: 0.4 }}
                      className="inline-flex"
                    >
                      {word} 
                    </motion.span>
                  ))}
                </motion.div>
                <motion.div className="overflow-hidden">
                  {t.hero.tertiaryHeadline.map((word, index) => (
                    <motion.span
                      key={word}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.32 + index * 0.06, duration: 0.4 }}
                      className={index === 1 ? 'inline-flex bg-gradient-to-r from-[#22C55E] to-[#60A5FA] bg-clip-text text-transparent' : 'inline-flex'}
                    >
                      {word} 
                    </motion.span>
                  ))}
                </motion.div>
              </div>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#94A3B8]">
                {t.hero.subheadline}
              </p>
              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center justify-center rounded-[10px] bg-[#1A7F5A] px-10 py-4 text-base font-semibold text-white shadow-[0_20px_60px_rgba(34,197,94,0.2)] transition duration-200 hover:scale-[1.04] hover:bg-[#22C55E]"
                >
                  {t.hero.ctaStart}
                </button>
                <button
                  onClick={() => setShowDemo(true)}
                  className="inline-flex items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] px-10 py-4 text-base font-semibold text-[#F1F5F9] transition duration-200 hover:bg-[rgba(255,255,255,0.12)]"
                >
                  {t.hero.ctaDemo}
                </button>
              </div>
              <div className="mt-10 flex flex-wrap gap-6 text-sm text-[#94A3B8]">
                {t.hero.benefits.map((benefit) => (
                  <span key={benefit} className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22C55E]" /> {benefit}
                  </span>
                ))}
                
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative z-10"
            >
              <div className="relative overflow-hidden rounded-[2rem] border border-[#1E2A3A] bg-[#111827] shadow-[0_40px_120px_rgba(26,127,90,0.25)] animate-float">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.2),transparent_25%)]" />
                <div className="relative p-8">
                  <div className="flex items-center justify-between rounded-[1.5rem] bg-[#0F172A] p-4 border border-[#1E2A3A] mb-6">
                    <div className="flex items-center gap-3 text-sm text-[#94A3B8]">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#22C55E] animate-pulse-dot" />
                      {t.dashboard.title}
                    </div>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[#0F172A] text-[#22C55E] font-semibold">
                  
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3 mb-6">
                    <div className="rounded-[1.5rem] bg-[#0F172A] p-5 border border-[#1E2A3A]">
                      <p className="text-[11px] uppercase tracking-[2px] text-[#64748B]">{t.dashboard.orders}</p>
                      <p className="mt-3 text-3xl font-semibold text-white">142</p>
                    </div>
                    <div className="rounded-[1.5rem] bg-[#0F172A] p-5 border border-[#1E2A3A]">
                      <p className="text-[11px] uppercase tracking-[2px] text-[#64748B]">{t.dashboard.revenue}</p>
                      <p className="mt-3 text-3xl font-semibold text-[#22C55E]">$8,420</p>
                    </div>
                    <div className="rounded-[1.5rem] bg-[#0F172A] p-5 border border-[#1E2A3A]">
                      <p className="text-[11px] uppercase tracking-[2px] text-[#64748B]">{t.dashboard.stores}</p>
                      <p className="mt-3 text-3xl font-semibold text-white">89</p>
                    </div>
                  </div>
                  <div className="rounded-[2rem] bg-[#0F172A] p-6 border border-[#1E2A3A] mb-6">
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
                      <div className="h-full w-[68%] bg-gradient-to-r from-[#22C55E] to-[#60A5FA]" />
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-[10px] uppercase tracking-[2px] text-[#64748B]">
                      {t.dashboard.days.map((day: string) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[2rem] bg-[#111827] p-5 border border-[#1E2A3A]">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[2px] text-[#64748B] mb-4">
                      <span>{t.dashboard.newOrders}</span>
                      <span className="text-[#22C55E]">{t.dashboard.newOrdersCount}</span>
                    </div>
                    <div className="space-y-3">
                      {['BRN 912', 'IOS 342', 'UMS 404'].map((id) => (
                        <div key={id} className="flex items-center justify-between text-sm text-[#F1F5F9]">
                          <div>
                            <p className="font-semibold">{id}</p>
                            <p className="text-[11px] text-[#64748B]">{t.dashboard.locationTime}</p>
                          </div>
                          <span className="rounded-full bg-[#0F172A] px-3 py-1 text-[11px] text-[#22C55E]">
                            {t.dashboard.confirmed}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
                <div className="absolute -bottom-8 -right-10 w-44 sm:w-52 lg:w-56 rounded-[2rem] border-8 border-[#0A0F1E] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.18)] animate-float-slow rotate-[-8deg]">
                  <div className="h-full bg-slate-50 p-4 rounded-[1.75rem]">
                    <div className="h-12 rounded-[1.5rem] bg-[#111827] mb-4" />
                    <div className="grid gap-3">
                      <div className="rounded-[1.5rem] bg-[#111827] border border-[#1E2A3A] p-3 text-white">
                        <div className="text-[11px] uppercase tracking-[2px] text-[#64748B] mb-2">{t.dashboard.catalog}</div>
                        <div className="grid grid-cols-2 gap-2 text-[12px]">
                          <span className="rounded-2xl bg-[#0A0F1E] px-2 py-1">{t.dashboard.tea}</span>
                          <span className="rounded-2xl bg-[#0A0F1E] px-2 py-1">{t.dashboard.water}</span>
                        </div>
                      </div>
                      <div className="rounded-[1.5rem] bg-[#111827] border border-[#1E2A3A] p-3 text-white">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[2px] text-[#64748B] mb-3">
                          <span>{t.dashboard.price}</span>
                          <span className="text-[#22C55E]">{t.dashboard.priceValue}</span>
                        </div>
                        <button className="w-full rounded-2xl bg-[#22C55E] py-2 text-[12px] font-semibold text-[#0A0F1E]">
                          {t.dashboard.orderBtn}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center mb-16">
            <span className="text-[12px] font-bold uppercase tracking-[3px] text-[#22C55E]">
              {t.problem.sectionTitle}
            </span>
            <h2 className="mt-4 text-4xl font-semibold text-[#F1F5F9] leading-tight">
              {t.problem.heading}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-base leading-7 text-[#94A3B8]">
              {t.problem.description}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {problemCards.map((card, index) => (
              <motion.div
                key={card.stat}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[#1E2A3A] bg-[#111827] p-10 shadow-[0_30px_80px_rgba(0,0,0,0.16)] hover:-translate-y-1 hover:border-[#22C55E] transition-all"
              >
                <div className="absolute left-0 top-0 h-1.5 w-14 rounded-br-full" style={{ backgroundColor: card.accent }} />
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[rgba(255,255,255,0.04)] text-3xl">
                  {card.icon}
                </div>
                <p className="text-4xl font-extrabold text-[#F1F5F9] mb-2">{card.stat}</p>
                <p className="text-sm uppercase tracking-[2px] text-[#64748B] mb-4">{card.label}</p>
                <p className="text-sm leading-7 text-[#94A3B8]">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-8 bg-gradient-to-b from-[#0A0F1E] to-[#0D1F12]">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center mb-16">
            <span className="text-[12px] font-bold uppercase tracking-[3px] text-[#22C55E]">
              {t.solution.sectionTitle}
            </span>
            <h2 className="mt-4 text-4xl font-semibold text-[#F1F5F9] leading-tight">
              {t.solution.heading}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-base leading-7 text-[#94A3B8]">
              {t.solution.description}
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-4">
            {howSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[#1E2A3A] bg-[#111827] p-8 hover:border-[#22C55E] hover:shadow-[0_0_30px_rgba(34,197,94,0.12)] transition-all"
              >
                <span className="text-5xl font-extrabold text-[#22C55E]/15">0{index + 1}</span>
                <div className="mt-6 mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[#0F172A] text-2xl">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#F1F5F9] mb-3">{step.title}</h3>
                <p className="text-sm leading-7 text-[#94A3B8]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-16 overflow-hidden rounded-[2rem] border border-[#1E2A3A] bg-[#111827] shadow-[0_40px_100px_rgba(0,0,0,0.18)]">
            <div className="bg-[#0F172A] p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[2px] text-[#94A3B8] mb-2">{t.solution.panelTitle}</p>
                  <h3 className="text-3xl font-semibold text-[#F1F5F9]">{t.solution.panelHeading}</h3>
                </div>
                <button 
                  onClick={() => setShowDemo(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#22C55E] px-5 py-3 text-sm font-semibold text-[#22C55E] hover:bg-[#22C55E]/10 transition-all"
                >
                  {t.solution.demoBtn}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="rounded-[1.5rem] bg-[#0A0F1E] p-8 border border-[#1E2A3A] mb-8">
                <div className="grid gap-4 sm:grid-cols-3">
                  {t.solution.panelStats.map((item: any) => (
                    <div key={item.label} className="rounded-[1.5rem] bg-[#111827] p-6">
                      <p className="text-[10px] uppercase tracking-[2px] text-[#64748B] mb-3">{item.label}</p>
                      <p className="text-3xl font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-[1.5rem] bg-[#111827] p-6 border border-[#1E2A3A]">
                  <div className="h-2 rounded-full bg-slate-800 overflow-hidden mb-4">
                    <div className="h-full w-[70%] bg-gradient-to-r from-[#22C55E] to-[#60A5FA]" />
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-[10px] uppercase tracking-[2px] text-[#64748B]">
                    {t.dashboard.days.map((day: string) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center mb-16">
            <span className="text-[12px] font-bold uppercase tracking-[3px] text-[#22C55E]">{t.features.sectionTitle}</span>
            <h2 className="mt-4 text-4xl font-semibold text-[#F1F5F9] leading-tight">{t.features.heading}</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {featureCards.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="group relative overflow-hidden rounded-[1.75rem] border border-[#1E2A3A] bg-[#111827] p-8 hover:border-[#22C55E] hover:shadow-[0_0_30px_rgba(34,197,94,0.12)] transition-all"
              >
                <span className="absolute left-0 top-0 h-full w-1 bg-[#22C55E] scale-y-0 origin-top transition-transform duration-300 group-hover:scale-y-100" />
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[#0F172A] text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#F1F5F9] mb-3">{feature.title}</h3>
                <p className="text-sm leading-7 text-[#94A3B8]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={statsRef} className="py-24 px-8 bg-gradient-to-br from-[#064E3B] to-[#0A0F1E] border-y border-[rgba(34,197,94,0.2)]">
        <div className="mx-auto max-w-[1440px] text-center mb-12">
          <h2 className="text-4xl font-semibold text-[#F1F5F9] leading-tight">
            {t.stats.heading}
          </h2>
        </div>
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-6 lg:grid-cols-4">
            {statsItems.map((item, index) => (
              <div key={index} className="rounded-[1.5rem] border border-[rgba(255,255,255,0.08)] bg-[#111827] p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-3xl bg-[#0F172A] text-xl">
                  {item.icon}
                </div>
                <p className="text-5xl font-extrabold bg-gradient-to-r from-[#22C55E] to-[#60A5FA] bg-clip-text text-transparent">
                  {item.target}
                  {index === 2 ? 'K+' : index === 3 ? '/7' : ''}
                </p>
                <p className="mt-3 text-sm text-[#94A3B8]">{t.stats.labels[index]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center mb-12">
            <span className="text-[12px] font-bold uppercase tracking-[3px] text-[#22C55E]">{t.pricing.sectionTitle}</span>
            <h2 className="mt-4 text-4xl font-semibold text-[#F1F5F9] leading-tight">{t.pricing.heading}</h2>
            <p className="mt-4 max-w-2xl mx-auto text-base leading-7 text-[#94A3B8]">
              {t.pricing.description}
            </p>
          </div>
          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {[
              { label: t.pricing.monthly, value: false },
              { label: t.pricing.yearly, value: true },
            ].map((option) => (
              <button
                key={option.label}
                onClick={() => setIsYearly(option.value)}
                className={`rounded-full border px-6 py-3 text-sm font-semibold transition-all ${isYearly === option.value ? "border-[#22C55E] bg-[#112917] text-[#F1F5F9]" : "border-[#1E2A3A] bg-transparent text-[#94A3B8] hover:border-[#22C55E] hover:text-[#F1F5F9]"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-[#1E2A3A] bg-[#111827] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.16)]">
              <span className="text-[11px] uppercase tracking-[3px] text-[#64748B]">{t.pricing.basicLabel}</span>
              <div className="mt-6 flex items-end gap-3">
                <p className="text-5xl font-bold text-[#F1F5F9]">{basicPrice}</p>
                <span className="pb-1 text-sm text-[#64748B]">/{pricingLabel}</span>
              </div>
              <p className="mt-4 text-sm text-[#94A3B8]">{t.pricing.basicDescription}</p>
              <div className="my-8 h-px bg-[#1E2A3A]" />
              <div className="space-y-4 text-sm">
                {t.pricing.basicFeatures.map((text: string) => (
                  <div key={text} className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E]/10 text-[#22C55E]">✓</span>
                    <span className="text-[#F1F5F9]">{text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/register')}
                className="mt-10 w-full rounded-2xl border border-[#22C55E] px-6 py-4 text-sm font-semibold text-[#22C55E] transition-all hover:bg-[#22C55E]/10"
              >
                {t.hero.ctaStart}
              </button>
              <p className="mt-4 text-xs text-[#64748B]">{t.pricing.trialText}</p>
            </div>
            <div className="relative rounded-[2rem] border-2 border-[#22C55E] bg-gradient-to-br from-[#0D2818] to-[#111827] p-10 shadow-[0_40px_120px_rgba(34,197,94,0.18)] animate-pulse-card">
              <div className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-[#22C55E] to-[#064E3B] px-4 py-2 text-[10px] uppercase tracking-[2px] text-white shadow-lg">
                {t.pricing.recommendedLabel}
              </div>
              <span className="text-[11px] uppercase tracking-[3px] text-[#22C55E]">{t.pricing.premiumLabel}</span>
              <div className="mt-6 flex items-end gap-3">
                <p className="text-5xl font-bold text-[#F1F5F9]">{premiumPrice}</p>
                <span className="pb-1 text-sm text-[#64748B]">/{pricingLabel}</span>
              </div>
              <p className="mt-4 text-sm text-[#94A3B8]">{t.pricing.premiumDescription}</p>
              <div className="my-8 h-px bg-[rgba(34,197,94,0.2)]" />
              <div className="space-y-4 text-sm text-[#F1F5F9]">
                {t.pricing.premiumFeatures.map((text: string) => (
                  <div key={text} className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E]/10 text-[#22C55E]">✓</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/register')}
                className="mt-10 w-full rounded-2xl bg-gradient-to-r from-[#22C55E] to-[#1A7F5A] px-6 py-4 text-sm font-semibold text-[#0A0F1E] shadow-lg shadow-[#22C55E]/25 transition-all hover:brightness-110"
              >
                {t.hero.ctaStart}
              </button>
              <p className="mt-4 text-xs text-[#94A3B8]">{t.pricing.trialText}</p>
            </div>
          </div>
          <div className="mx-auto mt-6 inline-flex rounded-2xl border border-dashed border-[#1E2A3A] bg-[#111827] px-6 py-4 text-sm text-[#94A3B8]">
            🎁 {t.pricing.yearlyInfo}
          </div>
        </div>
      </section>

      <section id="comparison" className="py-24 px-8 bg-[#0F172A]">
        <div className="mx-auto max-w-[1440px]">
          <div className="text-center mb-16">
            <span className="text-[12px] font-bold uppercase tracking-[3px] text-[#22C55E]">{t.comparison.sectionTitle}</span>
            <h2 className="mt-4 text-4xl font-semibold text-[#F1F5F9] leading-tight">{t.comparison.heading}</h2>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-[#1E2A3A] bg-[#111827] shadow-[0_40px_100px_rgba(0,0,0,0.18)]">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#0F172A] text-[#94A3B8]">
                  <th className="p-6 text-left">{t.comparison.featureHeader}</th>
                  {['Dokonect', 'SmartUp', 'CDAgent', 'DoctorSales'].map((name) => (
                    <th key={name} className={`p-6 text-center ${name === 'Dokonect' ? 'text-[#22C55E]' : ''}`}>
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.comparison.rows.map((row: string[], index: number) => (
                  <tr key={row[0]} className={index % 2 === 0 ? 'bg-[#111827]' : 'bg-[#0F1724]' }>
                    <td className="px-6 py-5 text-[#94A3B8] font-medium">{row[0]}</td>
                    {row.slice(1).map((value, idx) => (
                      <td
                        key={`${row[0]}-${idx}`}
                        className={`px-6 py-5 text-center ${idx === 0 ? 'text-[#22C55E] font-semibold border-l border-[#22C55E]/20' : 'text-[#F1F5F9]'}`}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-24 px-8">
        <div className="mx-auto max-w-[1440px] rounded-[2rem] border border-[rgba(34,197,94,0.2)] bg-gradient-to-br from-[#064E3B] to-[#0A0F1E] p-12 shadow-[0_40px_120px_rgba(0,0,0,0.2)]">
          <div className="text-center">
            <span className="text-[12px] font-bold uppercase tracking-[3px] text-[#22C55E]">{t.cta.sectionTitle}</span>
            <h2 className="mt-4 text-4xl font-semibold text-[#F1F5F9] leading-tight">{t.cta.heading}</h2>
            <p className="mt-4 max-w-2xl mx-auto text-base leading-7 text-[#94A3B8]">
              {t.cta.description}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <input
                type="email"
                placeholder={t.cta.placeholder}
                className="w-full max-w-[380px] rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] px-5 py-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
              />
              <button
                onClick={() => navigate('/register')}
                className="rounded-2xl bg-[#22C55E] px-8 py-4 text-sm font-semibold text-[#0A0F1E] shadow-lg shadow-[#22C55E]/25 transition-all hover:scale-[1.02]"
              >
                {t.cta.button}
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-sm text-[#94A3B8]">
              <span className="inline-flex items-center gap-2">{t.cta.secure}</span>
              <span className="inline-flex items-center gap-2">{t.cta.setup}</span>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="bg-[#060B14] px-8 py-20 border-t border-[#1E2A3A] text-[#94A3B8]">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-4">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <img src="/logo-full.png" alt="Dokonect" className="h-10 w-auto object-contain" />
              <div className="text-xl font-semibold text-[#F1F5F9]">
                <span>Doko</span>
                <span className="text-[#22C55E]">nect</span>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-7 text-[#94A3B8]">
              {t.footer.description}
            </p>
            <div className="mt-8 flex items-center gap-3">
              {['T', 'I', 'L'].map((item) => (
                <button key={item} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#1E2A3A] bg-[#111827] text-[#94A3B8] transition-all hover:border-[#22C55E] hover:text-[#22C55E]">
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-6 text-sm uppercase tracking-[2px] text-[#64748B]">{t.footer.product}</h4>
            <div className="space-y-4 text-sm">
              {[
                { label: t.footer.links.feature, href: "#features" },
                { label: t.footer.links.pricing, href: "#pricing" },
                { label: t.footer.links.news, href: "#" },
                { label: t.footer.links.api, href: "#" },
              ].map((item) => (
                <a key={item.label} href={item.href} className="block hover:text-[#22C55E]">{item.label}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-6 text-sm uppercase tracking-[2px] text-[#64748B]">{t.footer.company}</h4>
            <div className="space-y-4 text-sm">
              {[
                { label: t.footer.links.about, href: "#" },
                { label: t.footer.links.blog, href: "#" },
                { label: t.footer.links.careers, href: "#" },
                { label: t.footer.links.partners, href: "#" },
              ].map((item) => (
                <a key={item.label} href={item.href} className="block hover:text-[#22C55E]">{item.label}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-6 text-sm uppercase tracking-[2px] text-[#64748B]">{t.footer.support}</h4>
            <div className="space-y-4 text-sm">
              {[
                { label: t.footer.links.help, href: "#" },
                { label: t.footer.links.connect, href: "#" },
                { label: t.footer.links.telegram, href: "https://t.me/dokonect_bot" },
              ].map((item) => (
                <a key={item.label} href={item.href} className="block hover:text-[#22C55E]">{item.label}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-[#1E2A3A] pt-8 text-sm text-[#64748B] flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <p>{t.footer.copyright}</p>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="hover:text-[#22C55E]">{t.footer.privacy}</a>
            <a href="#" className="hover:text-[#22C55E]">{t.footer.terms}</a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-[#020617]/90 p-4 backdrop-blur-md"
            onClick={(e) => e.target === e.currentTarget && setShowDemo(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-[2rem] border border-[#1E2A3A] bg-[#0A0F1E] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-semibold text-[#F1F5F9]">{t.demo.modalTitle}</h3>
                <button
                  onClick={() => setShowDemo(false)}
                  className="rounded-full p-2 text-[#94A3B8] transition-colors hover:text-[#F1F5F9]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                {ALL_TEST_ACCOUNTS.map((acc) => {
                  const roleName = acc.nav === "DISTRIBUTOR" ? t.demo.accounts.distributor.role : t.demo.accounts.client.role;
                  const tagDesc = acc.nav === "DISTRIBUTOR" ? t.demo.accounts.distributor.tag : t.demo.accounts.client.tag;
                  return (
                    <button
                      key={acc.role}
                      onClick={() => handleDemo(acc)}
                      disabled={loadingId !== null}
                      className="w-full rounded-[1.75rem] border border-[#1E2A3A] bg-[#111827] px-5 py-4 text-left transition-all hover:border-[#22C55E] hover:bg-[#22C55E]/10"
                    >
                      <div className="flex w-full items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F172A] text-[#22C55E]">
                          {loadingId === acc.role ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#22C55E] border-t-transparent" />
                          ) : (
                            <acc.icon className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#F1F5F9]">{roleName}</p>
                          <p className="text-xs text-[#94A3B8]">{tagDesc}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-[#94A3B8]" />
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#111827] p-4 text-sm text-[#94A3B8]">
                <Clock className="h-4 w-4 text-[#94A3B8]" />
                <p>
                  {t.demo.passwordHint}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
