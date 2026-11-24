import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, Show, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { koKR } from '@clerk/localizations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  useCreateBooking, useCreatePartnerRoom, useCreatePartnerStay, useGetBooking,
  useGetPartnerProfile, useGetStay, useHealthCheck, useListPartnerBookings, useListPartnerStays,
  useListStays, useRegisterPartner, useUpdatePartnerBooking, useUpdatePartnerRoom,
  useUpdatePartnerStay, getGetBookingQueryKey, getGetPartnerProfileQueryKey,
  getGetStayQueryKey, getListPartnerBookingsQueryKey, getListPartnerStaysQueryKey,
  getListStaysQueryKey,
} from '@workspace/api-client-react';
import type { BookingInput, PartnerStay, RoomType, StaySummary } from '@workspace/api-client-react';
import { Link, Redirect, Route, Router as WouterRouter, Switch, useLocation, useParams } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, ArrowRight, BedDouble, CalendarDays, Check, ChevronDown, CircleHelp,
  Clock3, Heart, LoaderCircle, MapPin, Menu, Minus, Plus, Search, ShieldCheck,
  SlidersHorizontal, Sparkles, Star, UserRound, Users, X,
} from 'lucide-react';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
function stripBase(path: string) { return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path; }
const clerkAppearance = {
  theme: shadcn, cssLayerName: 'clerk',
  options: { logoPlacement: 'inside' as const, logoLinkUrl: basePath || '/', logoImageUrl: `${window.location.origin}${basePath}/logo.svg` },
  variables: {
    colorPrimary: '#315f55', colorForeground: '#25322f', colorMutedForeground: '#718079', colorDanger: '#bb5148',
    colorBackground: '#fffdf8', colorInput: '#f7f4ed', colorInputForeground: '#25322f', colorNeutral: '#25322f',
    fontFamily: "'DM Sans', sans-serif", borderRadius: '1rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center', cardBox: 'bg-[#fffdf8] rounded-2xl w-full max-w-[440px]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none', footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#25322f] font-bold', headerSubtitle: 'text-[#718079]', socialButtonsBlockButtonText: 'text-[#25322f]',
    formFieldLabel: 'text-[#25322f]', footerActionLink: 'text-[#315f55]', footerActionText: 'text-[#718079]',
    dividerText: 'text-[#718079]', identityPreviewEditButton: 'text-[#315f55]', formFieldSuccessText: 'text-[#315f55]',
    alertText: 'text-[#25322f]', logoBox: 'mb-2', logoImage: 'max-h-10', socialButtonsBlockButton: 'border-[#e8e2d8] bg-[#fffdf8]',
    formButtonPrimary: 'bg-[#315f55] hover:bg-[#264c44]', formFieldInput: 'bg-[#f7f4ed] border-[#e7dfd2] text-[#25322f]',
    footerAction: 'text-[#718079]', dividerLine: 'bg-[#e7dfd2]', alert: 'bg-[#fff4ef]', otpCodeFieldInput: 'bg-[#f7f4ed]',
    formFieldRow: 'mb-4', main: 'gap-5',
  },
};

const money = (value: number) => `${new Intl.NumberFormat('ko-KR').format(value)}원`;
const dates = (s: string) => s ? new Date(`${s}T00:00:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }) : '';
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const plusDate = (days: number) => { const d = new Date(); d.setDate(d.getDate() + days); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

function Brand({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/" className={`brand inline-flex items-center gap-2.5 ${inverse ? 'text-[#f4f0e6]' : 'text-[#28463f]'}`} data-testid="link-home">
    <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-[#315f55] text-[#f8f3e8]"><span className="serif text-[22px] font-extrabold leading-none">ㅅ</span></span>
    <span className="serif text-[23px] font-extrabold tracking-[-.07em]">스테이온</span>
  </Link>;
}

function Header({ partner = false }: { partner?: boolean }) {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-40 border-b border-[#e9e3d9] bg-[#fbf9f4]/95 backdrop-blur-md">
    <div className="container-shell flex h-[76px] items-center justify-between">
      <Brand />
      <nav className="hidden items-center gap-8 text-[14px] font-semibold text-[#53615b] md:flex">
        <Link href="/" className="transition hover:text-[#315f55]">숙소 찾기</Link>
        <Link href="/booking/lookup" className="transition hover:text-[#315f55]">예약 확인</Link>
        <Link href="/partner" className="transition hover:text-[#315f55]">{partner ? '파트너 센터' : '숙소 등록하기'}</Link>
      </nav>
      <div className="hidden items-center gap-3 md:flex">
        <Link href="/booking/lookup" className="rounded-full px-4 py-2.5 text-sm font-semibold text-[#46564f] hover:bg-[#f0ece3]">예약 조회</Link>
        <Link href="/partner" className="rounded-full border border-[#d9e2dc] bg-[#f4f7f3] px-5 py-2.5 text-sm font-bold text-[#315f55] transition hover:bg-[#eaf1eb]">파트너 센터</Link>
      </div>
      <button className="grid h-10 w-10 place-items-center rounded-full border border-[#e7dfd2] md:hidden" onClick={() => setOpen(!open)} aria-label="메뉴" data-testid="button-menu">{open ? <X size={19}/> : <Menu size={19}/>}</button>
    </div>
    {open && <div className="container-shell flex flex-col gap-1 pb-4 md:hidden">
      {[['/', '숙소 찾기'], ['/booking/lookup', '예약 확인'], ['/partner', '파트너 센터']].map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-[#f0ece3]">{label}</Link>)}
    </div>}
  </header>;
}

function Footer({ healthy = false }: { healthy?: boolean }) {
  return <footer className="mt-20 border-t border-[#e7dfd2] bg-[#f2efe7]">
    <div className="container-shell grid gap-10 py-12 md:grid-cols-[1fr_auto] md:items-end">
      <div><Brand/><p className="mt-4 max-w-md text-sm leading-7 text-[#68756f]">오늘의 여행이 더 편안해지도록.<br/>머물고 싶은 순간을 스테이온에서 찾아보세요.</p></div>
      <div className="flex gap-6 text-sm font-semibold text-[#53615b]"><Link href="/booking/lookup" className="hover:text-[#315f55]">예약 확인</Link><Link href="/partner" className="hover:text-[#315f55]">숙소 등록</Link><a href="mailto:hello@stay-on.kr" className="hover:text-[#315f55]">고객센터</a></div>
      <p className="text-xs text-[#87918b] md:col-span-2">© {new Date().getFullYear()} 스테이온. 편안한 하루를 연결합니다. {healthy && <span className="ml-2 text-[#52766d]">서비스 정상 운영 중</span>}</p>
    </div>
  </footer>;
}

function SkeletonGrid() { return <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(n => <div key={n}><div className="skeleton aspect-[1.35] rounded-[22px]"/><div className="skeleton mt-4 h-4 w-2/3 rounded"/><div className="skeleton mt-3 h-3 w-1/2 rounded"/></div>)}</div>; }

function StayCard({ stay }: { stay: StaySummary }) {
  const [saved, setSaved] = useState(false);
  return <Link href={`/stay/${stay.id}`} className="stay-card group block rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-[#315f55]" data-testid={`card-stay-${stay.id}`}>
    <div className="relative aspect-[1.35] overflow-hidden rounded-[22px] bg-[#d9e1d7]">
      {stay.imageUrl ? <img src={stay.imageUrl} alt={stay.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"/> : <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_70%_30%,#f5d9b9,#b9cec2_65%,#6f9182)]"><BedDouble className="text-white/75" size={43}/></div>}
      <span className="absolute left-3 top-3 rounded-full bg-[#fbf9f4]/90 px-3 py-1.5 text-[11px] font-bold text-[#465950]">{stay.category === 'hotel' ? '호텔' : stay.category === 'motel' ? '모텔' : '펜션'}</span>
      <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); setSaved(!saved); }} aria-label={saved ? '찜 해제' : '찜하기'} data-testid={`button-save-${stay.id}`} className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[#fbf9f4]/90 transition ${saved ? 'text-[#d16b59]' : 'text-[#42544d] hover:text-[#d16b59]'}`}><Heart size={17} fill={saved ? 'currentColor' : 'none'}/></button>
    </div>
    <div className="px-1 pt-3">
      <div className="flex items-start justify-between gap-3"><h3 className="line-clamp-1 text-[16px] font-bold tracking-[-.02em]">{stay.name}</h3><span className="flex shrink-0 items-center gap-1 text-sm font-semibold"><Star size={14} fill="#c98e4f" stroke="#c98e4f"/>{Number(stay.rating || 0).toFixed(1)}</span></div>
      <p className="mt-1 text-sm text-[#78837d]">{stay.city} · {stay.reviewCount ?? 0}개 후기</p>
      <p className="mt-2.5 text-sm"><strong className="text-[16px]">{money(stay.rooms?.[0]?.pricePerNight || 0)}</strong><span className="text-[#78837d]"> / 1박부터</span></p>
    </div>
  </Link>;
}

function HomePage() {
  const health = useHealthCheck();
  const [city, setCity] = useState('');
  const [appliedCity, setAppliedCity] = useState('');
  const [category, setCategory] = useState('');
  const [guests, setGuests] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const params = useMemo(() => ({ ...(appliedCity ? { city: appliedCity } : {}), ...(category ? { category: category as 'hotel'|'motel'|'pension' } : {}), ...(guests ? { guests: Number(guests) } : {}) }), [appliedCity, category, guests]);
  const { data: stays, isLoading, isError, refetch } = useListStays(params);
  const popularCities = ['서울', '부산', '제주', '강릉', '전주'];
  return <><Header/><main>
    <section className="relative overflow-x-clip bg-[#e9eee6]">
      <div className="container-shell relative grid min-h-[540px] items-center gap-8 py-14 md:grid-cols-[1fr_.9fr] md:py-20">
        <div className="fade-up relative z-10">
          <p className="eyebrow mb-5 flex items-center gap-2"><Sparkles size={14}/> 머무는 순간의 발견</p>
          <h1 className="serif max-w-[600px] text-[46px] font-extrabold leading-[1.13] text-[#263d36] sm:text-[58px] lg:text-[68px]">이번 여행,<br/><span className="text-[#477b6d]">좋은 잠자리</span>부터.</h1>
          <p className="mt-5 max-w-md text-[16px] leading-7 text-[#62726b]">취향에 맞는 숙소를 찾고, 편안한 여행을 시작해요.<br className="hidden sm:block"/> 머물 곳을 고르는 일이 조금 더 쉬워지도록.</p>
          <div className="mt-8 flex flex-wrap gap-2.5">{popularCities.map((c, i) => <button key={c} onClick={() => {setCity(c);setAppliedCity(c);}} data-testid={`button-city-${i}`} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${appliedCity === c ? 'border-[#315f55] bg-[#315f55] text-white' : 'border-[#cdd9d0] bg-[#f8faf6]/75 text-[#4b6258] hover:border-[#789789]'}`}>{c}</button>)}</div>
        </div>
        <div className="relative mx-auto h-[330px] w-full max-w-[470px] md:h-[400px]">
          <div className="absolute inset-[8%_2%_0_6%] rotate-[-3deg] rounded-[46%_46%_18%_18%] bg-[#d5b38c]"/>
          <div className="absolute inset-[12%_5%_5%_10%] overflow-hidden rounded-[46%_46%_18%_18%] border-[10px] border-[#f5eee1] bg-[#b4c9bc] shadow-[0_25px_60px_rgba(44,70,59,.2)]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#d9e7d9_0%,#a5c2b2_56%,#657f70_100%)]"/>
            <div className="absolute left-[12%] top-[19%] h-[49%] w-[34%] rounded-t-full bg-[#eee3d0]"/>
            <div className="absolute left-[17%] top-[26%] h-[39%] w-[24%] rounded-t-full bg-[#9ab9ad]"/>
            <div className="absolute right-[13%] top-[34%] h-[40%] w-[33%] rounded-t-[48%] bg-[#f3e8d7]"/>
            <div className="absolute right-[18%] top-[41%] h-[32%] w-[23%] rounded-t-[50%] bg-[#adc5b7]"/>
            <div className="absolute bottom-0 h-[28%] w-full bg-[#61796c]"/>
            <div className="absolute bottom-[13%] left-[34%] h-[40%] w-[29%] rounded-t-full bg-[#f8f2e8] shadow-[0_8px_0_#9b7659]"/>
            <div className="absolute bottom-[13%] left-[38%] h-[28%] w-[21%] rounded-t-full bg-[#d1b293]"/>
            <div className="absolute bottom-0 h-[10%] w-full bg-[#d7b794]"/>
          </div>
          <div className="absolute bottom-[3%] left-[0%] rounded-2xl bg-[#fffdf8] p-4 shadow-lg"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f0e8] text-[#477b6d]"><ShieldCheck size={20}/></span><div><p className="text-sm font-bold text-[#344a42]">믿을 수 있는 숙소</p><p className="mt-0.5 text-xs text-[#7b8781]">편안한 예약, 꼼꼼한 정보</p></div></div></div>
          <div className="absolute right-[-2%] top-[15%] rounded-full bg-[#fbf4e8] px-4 py-3 text-xs font-bold text-[#896844] shadow-md">가벼운 여행의 시작</div>
        </div>
      </div>
      <div className="container-shell relative z-10 -mb-10">
        <form onSubmit={e=>{e.preventDefault();setAppliedCity(city.trim());}} className="grid gap-2 rounded-[22px] border border-[#e7e1d7] bg-[#fffdf8] p-3 shadow-[0_16px_40px_rgba(47,67,57,.12)] md:grid-cols-[1.3fr_1fr_1fr_auto] md:gap-0 md:p-2">
          <label className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-[#f7f5ef]"><MapPin className="shrink-0 text-[#477b6d]" size={19}/><span className="min-w-0 flex-1"><span className="block text-[11px] font-bold text-[#728079]">어디로 떠나세요?</span><input value={city} onChange={e=>setCity(e.target.value)} placeholder="도시 또는 숙소명" className="mt-1 w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#a0a8a1]" data-testid="input-city"/></span></label>
          <label className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-[#f7f5ef] md:border-l md:border-[#eee8de]"><CalendarDays className="shrink-0 text-[#477b6d]" size={19}/><span><span className="block text-[11px] font-bold text-[#728079]">체크인 · 체크아웃</span><span className="mt-1 block text-sm font-semibold">날짜 선택은 숙소에서</span></span></label>
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 hover:bg-[#f7f5ef] md:border-l md:border-[#eee8de]"><Users className="shrink-0 text-[#477b6d]" size={19}/><span className="flex-1"><span className="block text-[11px] font-bold text-[#728079]">인원</span><select value={guests} onChange={e=>setGuests(e.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold outline-none" data-testid="select-guests"><option value="">인원 무관</option>{[1,2,3,4,5,6].map(n=><option value={n} key={n}>{n}명</option>)}</select></span><button type="button" className="text-[#829087]" onClick={()=>setFilterOpen(!filterOpen)} aria-label="필터" data-testid="button-filter"><SlidersHorizontal size={17}/></button></div>
          <button className="flex items-center justify-center gap-2 rounded-[16px] bg-[#315f55] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#264d44] md:px-8" data-testid="button-search"><Search size={17}/> 숙소 찾기</button>
        </form>
        {filterOpen && <div className="mt-2 flex flex-wrap items-center gap-2 rounded-2xl border border-[#e7e1d7] bg-[#fffdf8] p-4 shadow-lg"><span className="mr-2 text-sm font-bold">숙소 유형</span>{[['','전체'],['hotel','호텔'],['motel','모텔'],['pension','펜션']].map(([v,l])=><button type="button" key={v} onClick={()=>setCategory(v)} className={`rounded-full px-4 py-2 text-sm font-semibold ${category===v?'bg-[#315f55] text-white':'bg-[#f2efe8] text-[#5c6963]'}`} data-testid={`filter-${v||'all'}`}>{l}</button>)}<button type="button" onClick={()=>{setCategory('');setGuests('');setAppliedCity('');setCity('');}} className="ml-auto text-sm font-semibold text-[#718079] underline">초기화</button></div>}
      </div>
    </section>
    <section className="container-shell pt-24">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">머물고 싶은 곳</p><h2 className="serif mt-2 text-3xl font-extrabold tracking-tight">{appliedCity ? `${appliedCity}의 숙소` : '지금 많이 찾는 숙소'}</h2><p className="mt-2 text-sm text-[#78837d]">좋은 하루를 만들어 줄 공간을 골라보세요.</p></div>
        <button onClick={()=>setFilterOpen(!filterOpen)} className="flex items-center gap-2 rounded-full border border-[#e3ddd2] bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold text-[#53615b] hover:bg-[#f4f0e8]" data-testid="button-open-filter"><SlidersHorizontal size={15}/> 필터 <ChevronDown size={14}/></button>
      </div>
      {isLoading ? <SkeletonGrid/> : isError ? <div className="rounded-3xl border border-[#e8e0d5] bg-[#fffdf8] px-6 py-14 text-center"><CircleHelp className="mx-auto text-[#789789]" size={30}/><p className="mt-4 font-bold">숙소를 불러오지 못했어요</p><p className="mt-2 text-sm text-[#78837d]">잠시 후 다시 시도해 주세요.</p><Button onClick={()=>refetch()} className="mt-5 bg-[#315f55]">다시 불러오기</Button></div>
      : stays?.length ? <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">{stays.map(stay=><StayCard key={stay.id} stay={stay}/>)}</div>
      : <div className="rounded-[26px] bg-[#f0eee6] px-6 py-16 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fffdf8] text-[#6e8b7c]"><MapPin/></div><h3 className="mt-5 text-lg font-bold">아직 등록된 숙소가 없어요</h3><p className="mt-2 text-sm text-[#78837d]">다른 지역을 검색하거나, 조금 뒤에 다시 찾아주세요.</p><button onClick={()=>{setAppliedCity('');setCity('');setCategory('');}} className="mt-5 text-sm font-bold text-[#315f55] underline">전체 숙소 보기</button></div>}
    </section>
    <section className="container-shell mt-20"><div className="relative overflow-hidden rounded-[28px] bg-[#315f55] px-7 py-10 text-[#f9f5e9] md:flex md:items-center md:justify-between md:px-12 md:py-11"><div><p className="eyebrow !text-[#c8d9c9]">파트너와 함께</p><h2 className="serif mt-3 text-3xl font-extrabold">좋은 공간을 알리고 싶으신가요?</h2><p className="mt-2 text-sm text-[#d2ded4]">스테이온에서 새로운 손님을 만나보세요.</p></div><Link href="/partner" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f5f0e5] px-6 py-3 text-sm font-bold text-[#315f55] transition hover:bg-white md:mt-0">파트너 등록하기 <ArrowRight size={16}/></Link><div className="pointer-events-none absolute -right-4 -top-20 h-52 w-52 rounded-full border border-white/10"/><div className="pointer-events-none absolute -right-[-66px] -top-10 h-64 w-64 rounded-full border border-white/10"/></div></section>
  </main><Footer healthy={!!health.data?.status}/></>;
}

function BookingLookupPage() {
  const params = useParams<{code?:string}>();
  const [code, setCode] = useState(params.code === 'lookup' ? '' : params.code || '');
  const [submitted, setSubmitted] = useState(params.code && params.code !== 'lookup' ? params.code : '');
  const { data, isLoading, isError, refetch } = useGetBooking(submitted, { query: { enabled: !!submitted, queryKey: getGetBookingQueryKey(submitted), retry: false } });
  return <><Header/><main className="container-shell min-h-[70vh] py-12 md:py-20">
    <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#64736b] hover:text-[#315f55]"><ArrowLeft size={16}/> 숙소 둘러보기</Link>
    <div className="mx-auto max-w-[850px] overflow-hidden rounded-[28px] border border-[#e7dfd2] bg-[#fffdf8] md:grid md:grid-cols-[.9fr_1.1fr]">
      <div className="flex flex-col justify-between bg-[#315f55] p-8 text-[#f7f2e8] md:p-10"><div><p className="eyebrow !text-[#c5d8c9]">예약을 확인해요</p><h1 className="serif mt-4 text-4xl font-extrabold leading-tight">여행의 다음 장면을<br/>준비해 볼까요?</h1><p className="mt-4 text-sm leading-7 text-[#d6e0d6]">예약 신청 후 받은 예약 코드를 입력하면<br className="hidden md:block"/> 진행 상황을 확인할 수 있어요.</p></div><div className="mt-10 flex items-center gap-3 rounded-2xl bg-white/10 p-4"><ShieldCheck size={20}/><p className="text-xs leading-5 text-[#e0e9df]">예약 코드는 신청 완료 화면에서 확인할 수 있습니다.</p></div></div>
      <div className="p-7 md:p-10"><h2 className="text-xl font-bold">예약 조회</h2><p className="mt-2 text-sm text-[#78837d]">예약 코드로 간편하게 확인하세요.</p>
        <form onSubmit={e=>{e.preventDefault();setSubmitted(code.trim());}} className="mt-7 space-y-4"><label className="block text-sm font-semibold">예약 코드<input value={code} onChange={e=>setCode(e.target.value)} placeholder="예: STY-ABC123" required className="mt-2 h-12 w-full rounded-xl border border-[#e5ded2] bg-[#faf8f2] px-4 outline-none focus:border-[#6f9585] focus:ring-2 focus:ring-[#d8e5dc]" data-testid="input-booking-code"/></label><Button className="h-12 w-full bg-[#315f55] hover:bg-[#264d44]" disabled={!code.trim()} data-testid="button-lookup-booking"><Search size={16} className="mr-2"/> 예약 조회</Button></form>
        {isLoading && <div className="mt-6 space-y-3"><div className="skeleton h-5 w-2/3 rounded"/><div className="skeleton h-16 rounded-xl"/></div>}
        {isError && submitted && <div role="alert" className="mt-5 rounded-xl bg-[#fbefeb] p-4 text-sm text-[#9d5147]">예약 정보를 찾지 못했어요. 코드를 다시 확인해 주세요.<button onClick={()=>refetch()} className="ml-2 font-bold underline">다시 시도</button></div>}
        {data && <div className="mt-6 rounded-2xl border border-[#dfe8de] bg-[#f4f7f0] p-5" data-testid="booking-result"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-[#718079]">예약 코드 · {data.code}</p><h3 className="mt-2 font-bold">{data.stayName}</h3><p className="mt-1 text-sm text-[#6e7b74]">{data.roomName}</p></div><StatusBadge status={data.status}/></div><div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#dce5db] pt-4 text-sm"><div><span className="text-xs text-[#7c8981]">체크인</span><p className="mt-1 font-semibold">{dates(data.checkIn)}</p></div><div><span className="text-xs text-[#7c8981]">체크아웃</span><p className="mt-1 font-semibold">{dates(data.checkOut)}</p></div><div><span className="text-xs text-[#7c8981]">인원</span><p className="mt-1 font-semibold">{data.guests}명</p></div><div><span className="text-xs text-[#7c8981]">총 금액</span><p className="mt-1 font-semibold">{money(data.totalPrice)}</p></div></div></div>}
      </div>
    </div>
  </main><Footer/></>;
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string,string> = { requested: '확인 중', confirmed: '예약 확정', cancelled: '취소됨' };
  const styles: Record<string,string> = { requested: 'bg-[#fff0d8] text-[#9b6b27]', confirmed: 'bg-[#e0efe5] text-[#376b50]', cancelled: 'bg-[#f9e7e3] text-[#a14d43]' };
  return <span className={`inline-flex h-fit items-center rounded-full px-3 py-1.5 text-xs font-bold ${styles[status] || 'bg-[#eee] text-[#666]'}`} data-testid={`status-${status}`}>{labels[status] || status}</span>;
}

function StayDetailPage() {
  const params = useParams<{id:string}>();
  const id = Number(params.id);
  const { data: stay, isLoading, isError, refetch } = useGetStay(id, { query: { queryKey: getGetStayQueryKey(id), enabled: Number.isFinite(id) && id > 0 } });
  const queryClient = useQueryClient();
  const [room, setRoom] = useState<RoomType | null>(null);
  const [confirmation, setConfirmation] = useState<{code:string}|null>(null);
  const createBooking = useCreateBooking();
  const [checkIn, setCheckIn] = useState(plusDate(7));
  const [checkOut, setCheckOut] = useState(plusDate(8));
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const nights = Math.max(1, Math.round((new Date(checkOut).getTime()-new Date(checkIn).getTime())/86400000));
  const submitBooking = (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (!room) {setError('먼저 객실을 선택해 주세요.');return;}
    if (checkOut <= checkIn) {setError('체크아웃 날짜는 체크인 이후여야 해요.');return;}
    const input: BookingInput = { roomId: room.id, checkIn, checkOut, guests, guestName: name.trim(), guestEmail: email.trim(), guestPhone: phone.trim() };
    createBooking.mutate({data:input}, { onSuccess: result => { queryClient.setQueryData(getGetBookingQueryKey(result.code), result); setConfirmation({code:result.code}); }, onError: () => setError('예약 신청을 완료하지 못했어요. 입력 내용을 확인하고 다시 시도해 주세요.') });
  };
  if (isLoading) return <><Header/><main className="container-shell py-10"><div className="skeleton h-[380px] rounded-[28px]"/><div className="skeleton mt-8 h-10 w-2/3 rounded"/></main></>;
  if (isError || !stay) return <><Header/><main className="container-shell py-24 text-center"><CircleHelp className="mx-auto text-[#789789]" size={32}/><h1 className="mt-4 text-xl font-bold">숙소 정보를 불러오지 못했어요</h1><Button onClick={()=>refetch()} className="mt-5 bg-[#315f55]">다시 시도</Button><Link href="/" className="ml-4 text-sm font-semibold text-[#315f55] underline">숙소 목록으로</Link></main><Footer/></>;
  return <><Header/><main className="container-shell pb-14 pt-8">
    <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#64736b]"><ArrowLeft size={16}/> 숙소 목록</Link>
    <div className="relative h-[280px] overflow-hidden rounded-[28px] bg-[#d9e1d7] md:h-[430px]">{stay.imageUrl?<img src={stay.imageUrl} alt={stay.name} className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center bg-[radial-gradient(circle_at_75%_30%,#f1d8b6,#b9cec2_65%,#688878)]"><BedDouble size={56} className="text-white/80"/></div>}<span className="absolute bottom-5 left-5 rounded-full bg-[#fbf9f4]/90 px-4 py-2 text-xs font-bold">{stay.category==='hotel'?'호텔':stay.category==='motel'?'모텔':'펜션'}</span></div>
    <div className="grid gap-10 pt-8 lg:grid-cols-[1fr_370px]">
      <div><div className="border-b border-[#e7dfd2] pb-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">{stay.city} · {stay.address}</p><h1 className="serif mt-2 text-3xl font-extrabold md:text-4xl">{stay.name}</h1></div><span className="flex items-center gap-1 rounded-full bg-[#f3efe6] px-3 py-2 text-sm font-bold"><Star size={15} fill="#c98e4f" stroke="#c98e4f"/>{Number(stay.rating||0).toFixed(1)} <span className="font-normal text-[#78837d]">({stay.reviewCount})</span></span></div><p className="mt-4 flex items-center gap-2 text-sm text-[#718079]"><MapPin size={15}/>{stay.address}</p></div>
        <div className="border-b border-[#e7dfd2] py-7"><p className="eyebrow">숙소 이야기</p><p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[#596760]">{stay.description}</p><div className="mt-5 flex flex-wrap gap-3 text-sm text-[#66736c]"><span className="rounded-full bg-[#f0eee7] px-4 py-2">체크인 {stay.checkInTime}</span><span className="rounded-full bg-[#f0eee7] px-4 py-2">체크아웃 {stay.checkOutTime}</span><span className="rounded-full bg-[#f0eee7] px-4 py-2">호스트 {stay.ownerName}</span></div></div>
        <div className="py-7"><div className="flex items-end justify-between"><div><p className="eyebrow">객실을 선택해 주세요</p><h2 className="serif mt-2 text-2xl font-extrabold">머무를 공간</h2></div><span className="text-xs text-[#78837d]">{stay.rooms?.length || 0}개 객실</span></div>
          <div className="mt-5 space-y-3">{stay.rooms?.map(r=><button key={r.id} onClick={()=>setRoom(r)} className={`w-full rounded-2xl border p-5 text-left transition ${room?.id===r.id?'border-[#477b6d] bg-[#eef4ed] ring-1 ring-[#477b6d]':'border-[#e7dfd2] bg-[#fffdf8] hover:border-[#b9c9bb]'}`} data-testid={`button-room-${r.id}`}><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold">{r.name}</h3><p className="mt-2 flex items-center gap-1.5 text-sm text-[#78837d]"><Users size={14}/> 최대 {r.capacity}명 <span className="mx-1">·</span> 잔여 {r.inventory}실</p><div className="mt-3 flex flex-wrap gap-2">{r.amenities?.map(a=><span key={a} className="rounded-full bg-[#f1efe9] px-2.5 py-1 text-xs text-[#68756e]">{a}</span>)}</div></div><div className="shrink-0 text-right"><p className="text-lg font-bold">{money(r.pricePerNight)}</p><p className="text-xs text-[#78837d]">1박 기준</p><span className={`mt-3 inline-grid h-5 w-5 place-items-center rounded-full border ${room?.id===r.id?'border-[#315f55] bg-[#315f55] text-white':'border-[#d7d9d1]'}`}>{room?.id===r.id&&<Check size={13}/>}</span></div></div></button>)}</div>
        </div>
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <form onSubmit={submitBooking} className="rounded-[24px] border border-[#e7dfd2] bg-[#fffdf8] p-6 shadow-[0_12px_35px_rgba(47,67,57,.07)]">
          <div className="flex items-start justify-between"><div><p className="text-sm text-[#78837d]">1박 요금</p><p className="mt-1 text-2xl font-extrabold">{money(room?.pricePerNight || stay.rooms?.[0]?.pricePerNight || 0)} <span className="text-sm font-normal text-[#78837d]">/ 박</span></p></div><div className="flex items-center gap-1 text-xs text-[#728079]"><ShieldCheck size={15}/> 안전한 예약 신청</div></div>
          <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-xl border border-[#e5ded2]"><label className="p-3"><span className="block text-[10px] font-bold tracking-wider text-[#758078]">체크인</span><input type="date" min={today()} value={checkIn} onChange={e=>setCheckIn(e.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold outline-none" data-testid="input-check-in"/></label><label className="border-l border-[#e5ded2] p-3"><span className="block text-[10px] font-bold tracking-wider text-[#758078]">체크아웃</span><input type="date" min={checkIn} value={checkOut} onChange={e=>setCheckOut(e.target.value)} className="mt-1 w-full bg-transparent text-sm font-semibold outline-none" data-testid="input-check-out"/></label></div>
          <label className="mt-3 block rounded-xl border border-[#e5ded2] p-3"><span className="block text-[10px] font-bold tracking-wider text-[#758078]">인원</span><select value={guests} onChange={e=>setGuests(Number(e.target.value))} className="mt-1 w-full bg-transparent text-sm font-semibold outline-none" data-testid="select-booking-guests">{Array.from({length:Math.max(1,room?.capacity||4)},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}명</option>)}</select></label>
          <div className="mt-4 space-y-3"><label className="block text-xs font-bold text-[#64736b]">예약자 이름<input required value={name} onChange={e=>setName(e.target.value)} placeholder="이름을 입력해 주세요" className="mt-1.5 h-11 w-full rounded-xl border border-[#e5ded2] bg-[#faf8f2] px-3 text-sm font-normal outline-none focus:border-[#6f9585]" data-testid="input-guest-name"/></label><label className="block text-xs font-bold text-[#64736b]">이메일<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="안내받을 이메일" className="mt-1.5 h-11 w-full rounded-xl border border-[#e5ded2] bg-[#faf8f2] px-3 text-sm font-normal outline-none focus:border-[#6f9585]" data-testid="input-guest-email"/></label><label className="block text-xs font-bold text-[#64736b]">연락처<input required minLength={7} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="010-0000-0000" className="mt-1.5 h-11 w-full rounded-xl border border-[#e5ded2] bg-[#faf8f2] px-3 text-sm font-normal outline-none focus:border-[#6f9585]" data-testid="input-guest-phone"/></label></div>
          {room && <div className="mt-4 border-t border-dashed border-[#e0d9ce] pt-4 text-sm"><div className="flex justify-between text-[#68756e]"><span>{money(room.pricePerNight)} × {nights}박</span><span>{money(room.pricePerNight*nights)}</span></div><div className="mt-3 flex justify-between font-bold"><span>예상 합계</span><span>{money(room.pricePerNight*nights)}</span></div></div>}
          {error && <p role="alert" className="mt-3 text-xs text-[#aa5148]">{error}</p>}
          <button disabled={createBooking.isPending} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#315f55] text-sm font-bold text-white transition hover:bg-[#264d44] disabled:opacity-60" data-testid="button-request-booking">{createBooking.isPending?<LoaderCircle size={17} className="animate-spin"/>:'예약 신청하기'}</button>
          <p className="mt-3 text-center text-xs text-[#89938d]">결제 없이 예약 요청만 전달돼요.</p>
        </form>
      </aside>
    </div>
  </main><Footer/>
  {confirmation && <div className="fixed inset-0 z-50 grid place-items-center bg-[#1c2925]/55 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-[460px] rounded-[28px] bg-[#fffdf8] p-7 text-center shadow-2xl"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e4efe5] text-[#315f55]"><Check size={26}/></div><p className="eyebrow mt-5">예약 요청 완료</p><h2 className="serif mt-2 text-3xl font-extrabold">여행 준비가 시작됐어요</h2><p className="mt-3 text-sm leading-6 text-[#718079]">숙소에서 예약을 확인한 뒤 안내해 드릴게요.</p><div className="mt-6 rounded-2xl bg-[#f3f1e9] p-4"><p className="text-xs text-[#78837d]">예약 코드</p><p className="mt-1 font-mono text-xl font-bold tracking-wider text-[#315f55]">{confirmation.code}</p></div><div className="mt-6 flex gap-2"><Link href={`/booking/${confirmation.code}`} className="flex-1 rounded-xl bg-[#315f55] px-4 py-3 text-sm font-bold text-white">예약 확인</Link><button onClick={()=>setConfirmation(null)} className="rounded-xl border border-[#e3ddd2] px-5 py-3 text-sm font-bold">닫기</button></div></div></div>}
  </>;
}

const partnerSchema = z.object({ businessName: z.string().min(2,'사업자명을 2자 이상 입력해 주세요.'), ownerName: z.string().min(2,'대표자명을 입력해 주세요.'), phone: z.string().min(7,'연락처를 확인해 주세요.'), businessNumber: z.string().optional() });
type PartnerFormValues = z.infer<typeof partnerSchema>;
function PartnerRegistration({ onDone }: { onDone: () => void }) {
  const mutation = useRegisterPartner();
  const form = useForm<PartnerFormValues>({ resolver: zodResolver(partnerSchema), defaultValues: { businessName:'', ownerName:'', phone:'', businessNumber:'' } });
  const client = useQueryClient();
  return <div className="mx-auto max-w-[620px] rounded-[28px] border border-[#e7dfd2] bg-[#fffdf8] p-7 shadow-sm md:p-10">
    <p className="eyebrow">스테이온 파트너</p><h2 className="serif mt-2 text-3xl font-extrabold">좋은 공간을 소개해 주세요</h2><p className="mt-3 text-sm leading-6 text-[#78837d]">파트너 정보를 등록하면 숙소를 올리고 예약 요청을 관리할 수 있어요.</p>
    <Form {...form}><form onSubmit={form.handleSubmit(values=>mutation.mutate({data:{...values,businessNumber:values.businessNumber||undefined}}, { onSuccess:()=>{client.invalidateQueries({queryKey:getGetPartnerProfileQueryKey()});onDone();}, onError:()=>form.setError('root',{message:'등록을 완료하지 못했어요. 입력 정보를 확인해 주세요.'}) }))} className="mt-7 space-y-5">
      {([['businessName','사업자명','사업자 등록증에 기재된 이름'],['ownerName','대표자명','대표자 성함'],['phone','연락처','010-0000-0000'],['businessNumber','사업자등록번호','선택 입력']] as const).map(([name,label,placeholder])=><FormField key={name} control={form.control} name={name} render={({field})=><FormItem><FormLabel>{label}{name!=='businessNumber'&&<span className="text-[#c6755f]"> *</span>}</FormLabel><FormControl><input {...field} placeholder={placeholder} data-testid={`input-partner-${name}`} className="h-12 w-full rounded-xl border border-[#e5ded2] bg-[#faf8f2] px-4 outline-none focus:border-[#6f9585] focus:ring-2 focus:ring-[#d8e5dc]"/></FormControl><FormMessage/></FormItem>}/>)}
      {form.formState.errors.root&&<p role="alert" className="text-sm text-[#aa5148]">{form.formState.errors.root.message}</p>}
      <button disabled={mutation.isPending} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#315f55] text-sm font-bold text-white hover:bg-[#264d44] disabled:opacity-60" data-testid="button-register-partner">{mutation.isPending?<LoaderCircle size={17} className="animate-spin"/>:'파트너 등록하기'}</button>
      <p className="text-center text-xs leading-5 text-[#849088]">등록 정보는 숙소 운영과 예약 안내를 위해서만 사용됩니다.</p>
    </form></Form>
  </div>;
}

const listingSchema = z.object({
  name: z.string().min(2,'숙소명을 입력해 주세요.'), city: z.string().min(1,'도시를 입력해 주세요.'), address: z.string().min(2,'주소를 입력해 주세요.'),
  category: z.enum(['hotel','motel','pension']), description: z.string().min(8,'숙소 소개를 8자 이상 입력해 주세요.'), imageUrl: z.string().url('올바른 이미지 주소를 입력해 주세요.'),
  roomName: z.string().min(2,'객실명을 입력해 주세요.'), pricePerNight: z.coerce.number().min(1000,'1,000원 이상 입력해 주세요.'),
  capacity: z.coerce.number().min(1), inventory: z.coerce.number().min(1), amenities: z.string(),
});
type ListingValues = z.infer<typeof listingSchema>;
function CreateStayForm({ onCancel, onCreated }: { onCancel:()=>void; onCreated:()=>void }) {
  const client=useQueryClient(); const mutation=useCreatePartnerStay();
  const form=useForm<ListingValues>({resolver:zodResolver(listingSchema),defaultValues:{name:'',city:'',address:'',category:'hotel',description:'',imageUrl:'',roomName:'스탠다드 더블',pricePerNight:89000,capacity:2,inventory:1,amenities:'와이파이, 에어컨'}});
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1c2925]/50 p-4"><div className="mx-auto my-6 max-w-[780px] rounded-[28px] bg-[#fffdf8] p-6 shadow-2xl md:p-9"><div className="flex items-start justify-between"><div><p className="eyebrow">새로운 공간</p><h2 className="serif mt-2 text-3xl font-extrabold">숙소 등록하기</h2></div><button onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-full bg-[#f2efe8]" aria-label="닫기"><X size={18}/></button></div>
    <Form {...form}><form onSubmit={form.handleSubmit(v=>mutation.mutate({data:{...v,amenities:v.amenities.split(',').map(a=>a.trim()).filter(Boolean)}},{onSuccess:()=>{client.invalidateQueries({queryKey:getListPartnerStaysQueryKey()});onCreated();},onError:()=>form.setError('root',{message:'숙소 등록 중 문제가 생겼습니다. 입력 내용을 확인해 주세요.'})}))} className="mt-7 grid gap-x-5 gap-y-4 md:grid-cols-2">
      {([['name','숙소명'],['city','도시'],['address','주소'],['imageUrl','대표 이미지 URL'],['description','숙소 소개']] as const).map(([key,label])=><FormField key={key} control={form.control} name={key} render={({field})=><FormItem className={key==='description'?'md:col-span-2':''}><FormLabel>{label}</FormLabel><FormControl>{key==='description'?<textarea {...field} rows={3} placeholder="공간의 매력을 소개해 주세요." className="w-full rounded-xl border border-[#e5ded2] bg-[#faf8f2] px-4 py-3 outline-none focus:border-[#6f9585]"/>:<input {...field} placeholder={label} className="h-11 w-full rounded-xl border border-[#e5ded2] bg-[#faf8f2] px-4 outline-none focus:border-[#6f9585]"/>}</FormControl><FormMessage/></FormItem>}/>)}
      <FormField control={form.control} name="category" render={({field})=><FormItem><FormLabel>숙소 유형</FormLabel><FormControl><select {...field} className="h-11 w-full rounded-xl border border-[#e5ded2] bg-[#faf8f2] px-3"><option value="hotel">호텔</option><option value="motel">모텔</option><option value="pension">펜션</option></select></FormControl><FormMessage/></FormItem>}/>
      <div className="md:col-span-2"><p className="mb-3 border-t border-[#eee8de] pt-5 text-sm font-bold">첫 번째 객실</p></div>
      {([['roomName','객실명'],['pricePerNight','1박 요금'],['capacity','기준 인원'],['inventory','객실 수'],['amenities','편의시설']] as const).map(([key,label])=><FormField key={key} control={form.control} name={key} render={({field})=><FormItem><FormLabel>{label}</FormLabel><FormControl><input {...field} type={key==='roomName'||key==='amenities'?'text':'number'} placeholder={key==='amenities'?'와이파이, 주차':''} className="h-11 w-full rounded-xl border border-[#e5ded2] bg-[#faf8f2] px-4 outline-none focus:border-[#6f9585]"/></FormControl><FormMessage/></FormItem>}/>)}
      {form.formState.errors.root&&<p className="text-sm text-[#aa5148] md:col-span-2">{form.formState.errors.root.message}</p>}
      <div className="mt-2 flex justify-end gap-2 md:col-span-2"><button type="button" onClick={onCancel} className="rounded-xl border border-[#e5ded2] px-5 py-3 text-sm font-bold">취소</button><button disabled={mutation.isPending} className="rounded-xl bg-[#315f55] px-6 py-3 text-sm font-bold text-white disabled:opacity-50" data-testid="button-create-stay">{mutation.isPending?'등록 중…':'숙소 등록'}</button></div>
    </form></Form>
  </div></div>;
}

function EditStayForm({ stay, onClose }: { stay:PartnerStay; onClose:()=>void }) {
  const client=useQueryClient(); const mutation=useUpdatePartnerStay();
  const form=useForm({defaultValues:{name:stay.name,city:stay.city,address:stay.address,category:stay.category,description:stay.description,imageUrl:stay.imageUrl}});
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1c2925]/50 p-4"><div className="mx-auto my-10 max-w-xl rounded-[26px] bg-[#fffdf8] p-7"><div className="flex justify-between"><h2 className="serif text-2xl font-extrabold">숙소 정보 수정</h2><button onClick={onClose} aria-label="닫기"><X/></button></div><form onSubmit={form.handleSubmit(v=>mutation.mutate({id:stay.id,data:v},{onSuccess:()=>{client.invalidateQueries({queryKey:getListPartnerStaysQueryKey()});onClose();}}))} className="mt-5 space-y-3">{Object.entries({name:'숙소명',city:'도시',address:'주소',imageUrl:'이미지 URL',description:'숙소 소개'}).map(([k,l])=><label key={k} className="block text-xs font-bold text-[#64736b]">{l}<input {...form.register(k as 'name'|'city'|'address'|'imageUrl'|'description')} className="mt-1 h-11 w-full rounded-xl border border-[#e5ded2] bg-[#faf8f2] px-3 text-sm font-normal"/></label>)}<label className="block text-xs font-bold text-[#64736b]">숙소 유형<select {...form.register('category')} className="mt-1 h-11 w-full rounded-xl border border-[#e5ded2] bg-[#faf8f2] px-3 text-sm font-normal"><option value="hotel">호텔</option><option value="motel">모텔</option><option value="pension">펜션</option></select></label><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="rounded-xl border px-4 py-2.5 text-sm">취소</button><button className="rounded-xl bg-[#315f55] px-5 py-2.5 text-sm font-bold text-white" disabled={mutation.isPending}>변경 저장</button></div></form></div></div>;
}

function PartnerDashboard() {
  const profile=useGetPartnerProfile({query:{queryKey:getGetPartnerProfileQueryKey(),retry:false}});
  const stays=useListPartnerStays({query:{queryKey:getListPartnerStaysQueryKey(),enabled:!profile.isLoading&&!profile.isError}});
  const bookings=useListPartnerBookings({query:{queryKey:getListPartnerBookingsQueryKey(),enabled:!profile.isLoading&&!profile.isError}});
  const client=useQueryClient(); const updateBooking=useUpdatePartnerBooking(); const createRoom=useCreatePartnerRoom(); const updateRoom=useUpdatePartnerRoom();
  const [tab,setTab]=useState<'bookings'|'stays'>('bookings'); const [createOpen,setCreateOpen]=useState(false); const [editStay,setEditStay]=useState<PartnerStay|null>(null); const [roomForm,setRoomForm]=useState<number|null>(null);
  const [roomValues,setRoomValues]=useState({name:'디럭스 룸',pricePerNight:'120000',capacity:'2',inventory:'1',amenities:'와이파이, 에어컨'});
  const [roomEdit,setRoomEdit]=useState<RoomType|null>(null);
  const invalidatePartner=()=>{client.invalidateQueries({queryKey:getListPartnerStaysQueryKey()});client.invalidateQueries({queryKey:getListPartnerBookingsQueryKey()});};
  const {signOut}=useClerk();
  if(profile.isLoading) return <><Header partner/><main className="container-shell py-12"><div className="skeleton h-28 rounded-3xl"/><div className="skeleton mt-6 h-72 rounded-3xl"/></main></>;
  if(profile.isError || !profile.data) return <><Header partner/><main className="container-shell py-14"><div className="mx-auto max-w-3xl text-center"><p className="eyebrow">파트너 등록</p><h1 className="serif mt-3 text-4xl font-extrabold">스테이온과 함께해요</h1><p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#78837d]">운영 중인 숙소를 등록하고 예약을 한 곳에서 관리해 보세요.</p></div><div className="mt-9"><PartnerRegistration onDone={()=>{profile.refetch();}}/></div></main><Footer/></>;
  const allBookings=bookings.data||[];
  return <><Header partner/><main className="container-shell min-h-[70vh] py-9 md:py-12">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">파트너 데스크</p><h1 className="serif mt-2 text-3xl font-extrabold md:text-4xl">안녕하세요, {profile.data.ownerName}님</h1><p className="mt-2 text-sm text-[#78837d]">{profile.data.businessName} · 오늘도 편안한 운영을 응원해요.</p></div><div className="flex gap-2"><button onClick={()=>setCreateOpen(true)} className="rounded-full bg-[#315f55] px-5 py-3 text-sm font-bold text-white hover:bg-[#264d44]" data-testid="button-add-stay"><Plus size={16} className="mr-1 inline"/>숙소 등록</button><button onClick={()=>signOut({redirectUrl:basePath||'/'})} className="rounded-full border border-[#e3ddd2] px-4 py-3 text-sm font-semibold text-[#53615b]">로그아웃</button></div></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><Metric label="등록 숙소" value={String(stays.data?.length??0)} hint="운영 중인 공간"/><Metric label="예약 요청" value={String(allBookings.filter(b=>b.status==='requested').length)} hint="확인이 필요해요"/><Metric label="이번 달 확정" value={String(allBookings.filter(b=>b.status==='confirmed').length)} hint="확정된 예약"/></div>
    <div className="mt-9 flex items-center gap-2 border-b border-[#e7dfd2]"><button onClick={()=>setTab('bookings')} className={`border-b-2 px-4 py-3 text-sm font-bold ${tab==='bookings'?'border-[#315f55] text-[#315f55]':'border-transparent text-[#78837d]'}`} data-testid="tab-bookings">예약 요청 <span className="ml-1 rounded-full bg-[#f1eee6] px-2 py-0.5 text-xs">{allBookings.filter(b=>b.status==='requested').length}</span></button><button onClick={()=>setTab('stays')} className={`border-b-2 px-4 py-3 text-sm font-bold ${tab==='stays'?'border-[#315f55] text-[#315f55]':'border-transparent text-[#78837d]'}`} data-testid="tab-stays">내 숙소</button></div>
    {tab==='bookings' && <section className="pt-6"><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-bold">예약 요청</h2><p className="mt-1 text-sm text-[#78837d]">요청을 확인하고 예약 상태를 알려주세요.</p></div></div>
      {bookings.isLoading?<div className="space-y-3">{[1,2].map(i=><div key={i} className="skeleton h-32 rounded-2xl"/> )}</div>:bookings.isError?<InlineError retry={()=>bookings.refetch()}/>:allBookings.length?<div className="space-y-3">{allBookings.map(b=><article key={b.id} className="rounded-2xl border border-[#e7dfd2] bg-[#fffdf8] p-5 md:flex md:items-center md:justify-between md:gap-5" data-testid={`booking-row-${b.id}`}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{b.stayName}</h3><StatusBadge status={b.status}/></div><p className="mt-1 text-sm text-[#78837d]">{b.roomName} · 예약 코드 {b.code}</p><p className="mt-3 text-sm font-semibold">{dates(b.checkIn)} — {dates(b.checkOut)} <span className="mx-1 text-[#a0a9a2]">·</span>{b.guests}명 <span className="mx-1 text-[#a0a9a2]">·</span>{money(b.totalPrice)}</p><p className="mt-2 text-xs text-[#78837d]">{b.guestName} · {b.guestPhone} · {b.guestEmail}</p></div>{b.status==='requested'&&<div className="mt-4 flex shrink-0 gap-2 md:mt-0"><button onClick={()=>updateBooking.mutate({id:b.id,data:{status:'cancelled'}},{onSuccess:invalidatePartner})} className="rounded-xl border border-[#e8d6d2] px-4 py-2.5 text-sm font-bold text-[#a65a4e] hover:bg-[#fcf1ee]" data-testid={`button-cancel-${b.id}`}>취소</button><button onClick={()=>updateBooking.mutate({id:b.id,data:{status:'confirmed'}},{onSuccess:invalidatePartner})} disabled={updateBooking.isPending} className="rounded-xl bg-[#315f55] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#264d44]" data-testid={`button-confirm-${b.id}`}><Check size={15} className="mr-1 inline"/>예약 확정</button></div>}</article>)}</div>:<EmptyPanel icon={<CalendarDays/>} title="새 예약 요청이 아직 없어요" detail="예약 요청이 들어오면 이곳에서 확인할 수 있습니다."/>}
    </section>}
    {tab==='stays'&&<section className="pt-6"><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-bold">내 숙소</h2><p className="mt-1 text-sm text-[#78837d]">숙소 정보와 객실 구성을 관리해요.</p></div><button onClick={()=>setCreateOpen(true)} className="rounded-xl border border-[#cbd9cf] px-4 py-2.5 text-sm font-bold text-[#315f55]">+ 숙소 등록</button></div>
      {stays.isLoading?<SkeletonGrid/>:stays.isError?<InlineError retry={()=>stays.refetch()}/>:stays.data?.length?<div className="space-y-4">{stays.data.map(s=><article key={s.id} className="overflow-hidden rounded-[22px] border border-[#e7dfd2] bg-[#fffdf8]" data-testid={`partner-stay-${s.id}`}><div className="grid md:grid-cols-[220px_1fr]"><div className="h-48 bg-[#d9e1d7] md:h-full">{s.imageUrl?<img src={s.imageUrl} alt={s.name} className="h-full w-full object-cover"/>:<div className="grid h-full place-items-center text-[#6d897c]"><BedDouble size={36}/></div>}</div><div className="p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><span className="eyebrow">{s.city} · {s.category==='hotel'?'호텔':s.category==='motel'?'모텔':'펜션'}</span><h3 className="serif mt-1 text-2xl font-extrabold">{s.name}</h3><p className="mt-1 text-sm text-[#78837d]">{s.address}</p></div><button onClick={()=>setEditStay(s)} className="rounded-full border border-[#e5ded2] px-4 py-2 text-xs font-bold text-[#53615b] hover:bg-[#f7f4ed]" data-testid={`button-edit-stay-${s.id}`}>숙소 정보 수정</button></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-[#68756e]">{s.description}</p>
         <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee8de] pt-4"><span className="text-xs font-bold text-[#718079]">객실 {s.rooms?.length||0}개</span><button onClick={()=>{setRoomForm(s.id);setRoomValues({name:'',pricePerNight:'89000',capacity:'2',inventory:'1',amenities:''});}} className="text-xs font-bold text-[#315f55] underline" data-testid={`button-add-room-${s.id}`}>객실 유형 추가</button></div>
         <div className="mt-3 grid gap-2 sm:grid-cols-2">{s.rooms?.map(r=><div key={r.id} className="flex items-center justify-between rounded-xl bg-[#f6f3ec] px-3 py-3"><div><p className="text-sm font-bold">{r.name}</p><p className="mt-1 text-xs text-[#78837d]">{money(r.pricePerNight)} · 최대 {r.capacity}명 · {r.inventory}실</p></div><button onClick={()=>setRoomEdit(r)} className="rounded-lg px-3 py-2 text-xs font-bold text-[#315f55] hover:bg-[#e7eee7]" data-testid={`button-edit-room-${r.id}`}>수정</button></div>)}</div>
        </div></div></article>)}</div>:<EmptyPanel icon={<BedDouble/>} title="첫 숙소를 등록해 보세요" detail="숙소와 객실 정보를 등록하면 고객에게 소개할 수 있어요." action={<button onClick={()=>setCreateOpen(true)} className="mt-4 rounded-full bg-[#315f55] px-5 py-2.5 text-sm font-bold text-white">숙소 등록하기</button>}/>}
    </section>}
  </main><Footer/>
  {createOpen&&<CreateStayForm onCancel={()=>setCreateOpen(false)} onCreated={()=>setCreateOpen(false)}/>}
  {editStay&&<EditStayForm stay={editStay} onClose={()=>setEditStay(null)}/>}
  {roomForm!==null&&<RoomDialog title="객실 유형 추가" values={roomValues} setValues={setRoomValues} busy={createRoom.isPending} onClose={()=>setRoomForm(null)} onSave={()=>createRoom.mutate({id:roomForm,data:{...roomValues,pricePerNight:Number(roomValues.pricePerNight),capacity:Number(roomValues.capacity),inventory:Number(roomValues.inventory),amenities:roomValues.amenities.split(',').map(x=>x.trim()).filter(Boolean)}},{onSuccess:()=>{client.invalidateQueries({queryKey:getListPartnerStaysQueryKey()});setRoomForm(null);}})}/>}
  {roomEdit&&<RoomDialog title={`${roomEdit.name} 수정`} values={{name:roomEdit.name,pricePerNight:String(roomEdit.pricePerNight),capacity:String(roomEdit.capacity),inventory:String(roomEdit.inventory),amenities:roomEdit.amenities.join(', ')}} setValues={setRoomValues} busy={updateRoom.isPending} onClose={()=>setRoomEdit(null)} onSave={()=>updateRoom.mutate({id:roomEdit.id,data:{pricePerNight:Number(roomValues.pricePerNight),capacity:Number(roomValues.capacity),inventory:Number(roomValues.inventory),amenities:roomValues.amenities.split(',').map(x=>x.trim()).filter(Boolean)}},{onSuccess:()=>{client.invalidateQueries({queryKey:getListPartnerStaysQueryKey()});setRoomEdit(null);}})}/>}
  </>;
}

function Metric({label,value,hint}:{label:string;value:string;hint:string}) { return <div className="rounded-2xl border border-[#e7dfd2] bg-[#fffdf8] p-5"><p className="text-xs font-bold text-[#78837d]">{label}</p><p className="serif mt-2 text-3xl font-extrabold text-[#315f55]">{value}</p><p className="mt-1 text-xs text-[#88938c]">{hint}</p></div>; }
function EmptyPanel({icon,title,detail,action}:{icon:ReactNode;title:string;detail:string;action?:ReactNode}) { return <div className="rounded-[24px] border border-dashed border-[#dcd8cc] bg-[#f7f5ef] px-5 py-12 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#fffdf8] text-[#6e8b7c]">{icon}</div><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm text-[#78837d]">{detail}</p>{action}</div>; }
function InlineError({retry}:{retry:()=>void}) { return <div className="rounded-2xl bg-[#fbefeb] p-5 text-sm text-[#9d5147]">정보를 불러오지 못했습니다. <button onClick={retry} className="font-bold underline">다시 시도</button></div>; }
function RoomDialog({title,values,setValues,busy,onClose,onSave}:{title:string;values:{name:string;pricePerNight:string;capacity:string;inventory:string;amenities:string};setValues:(v:{name:string;pricePerNight:string;capacity:string;inventory:string;amenities:string})=>void;busy:boolean;onClose:()=>void;onSave:()=>void}) {
  const change=(key:keyof typeof values,value:string)=>setValues({...values,[key]:value});
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-[#1c2925]/50 p-4"><div className="w-full max-w-md rounded-[26px] bg-[#fffdf8] p-7"><div className="flex items-center justify-between"><h2 className="serif text-2xl font-extrabold">{title}</h2><button onClick={onClose} aria-label="닫기"><X size={19}/></button></div><div className="mt-5 space-y-3">{([['name','객실명','text'],['pricePerNight','1박 요금','number'],['capacity','최대 인원','number'],['inventory','객실 수','number'],['amenities','편의시설 (쉼표로 구분)','text']] as const).map(([k,l,t])=><label key={k} className="block text-xs font-bold text-[#64736b]">{l}<input type={t} value={values[k]} onChange={e=>change(k,e.target.value)} disabled={k==='name'&&title.includes('수정')} className="mt-1.5 h-11 w-full rounded-xl border border-[#e5ded2] bg-[#faf8f2] px-3 text-sm font-normal disabled:opacity-60"/></label>)}</div><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-xl border px-4 py-2.5 text-sm font-bold">취소</button><button onClick={onSave} disabled={busy} className="rounded-xl bg-[#315f55] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy?'저장 중…':'저장'}</button></div></div></div>;
}

function HomeRedirect() {
  return <><Show when="signed-in"><Redirect to="/partner"/></Show><Show when="signed-out"><HomePage/></Show></>;
}
function PartnerRoute() {
  return <><Show when="signed-in"><PartnerDashboard/></Show><Show when="signed-out"><Redirect to="/sign-in"/></Show></>;
}
function SignInPage() {
  return <main className="grid min-h-[100dvh] place-items-center bg-[#eef1e9] px-4 py-10"><div className="absolute left-6 top-6"><Brand/></div><div className="w-full max-w-[440px]"><SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`}/></div></main>;
}
function SignUpPage() {
  return <main className="grid min-h-[100dvh] place-items-center bg-[#eef1e9] px-4 py-10"><div className="absolute left-6 top-6"><Brand/></div><div className="w-full max-w-[440px]"><SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`}/></div></main>;
}
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) client.clear();
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, client]);
  return null;
}
function RoutedErrorBoundary({children}:{children:ReactNode}) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}
function ClerkRoutes() {
  const [,setLocation] = useLocation();
  if (!clerkPubKey) throw new Error('VITE_CLERK_PUBLISHABLE_KEY 설정이 필요합니다.');
  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={clerkProxyUrl}
    appearance={clerkAppearance}
    signInUrl={`${basePath}/sign-in`}
    signUpUrl={`${basePath}/sign-up`}
    localization={{
      ...koKR,
      signIn: { ...(koKR.signIn ?? {}), start: { ...(koKR.signIn?.start ?? {}), title: '다시 만나 반가워요', subtitle: '파트너 계정으로 로그인해 주세요.' } },
      signUp: { ...(koKR.signUp ?? {}), start: { ...(koKR.signUp?.start ?? {}), title: '파트너 계정 만들기', subtitle: '스테이온과 함께 좋은 공간을 소개해 주세요.' } },
    }}
    routerPush={(to: string)=>setLocation(stripBase(to))}
    routerReplace={(to: string)=>setLocation(stripBase(to),{replace:true})}
  >
    <ClerkQueryClientCacheInvalidator/>
    <RoutedErrorBoundary><Switch>
      <Route path="/" component={HomeRedirect}/>
      <Route path="/stay/:id" component={StayDetailPage}/>
      <Route path="/booking/lookup" component={BookingLookupPage}/>
      <Route path="/booking/:code" component={BookingLookupPage}/>
      <Route path="/partner" component={PartnerRoute}/>
      <Route path="/sign-in/*?" component={SignInPage}/>
      <Route path="/sign-up/*?" component={SignUpPage}/>
      <Route component={NotFound}/>
    </Switch></RoutedErrorBoundary>
  </ClerkProvider>;
}
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={basePath}><ClerkRoutes/></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>;
}

export default App;
