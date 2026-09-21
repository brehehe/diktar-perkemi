import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, Globe2, GraduationCap, LogIn, Users } from 'lucide-react';

const splashSessionKey = 'diktar-entry-splash-seen';

const assetPath = (filename) => `/images/setup/${encodeURIComponent(filename)}`;

const artwork = {
    background: assetPath('portal-home-background.webp'),
    wsko: assetPath('portal-home-wsko.webp'),
    perkemi: assetPath('portal-home-perkemi.webp'),
    welcome: assetPath('portal-home-welcome.webp'),
    leftPrinciple: assetPath('portal-home-left-principle.webp'),
    citizens: assetPath('portal-home-citizens.webp'),
    rightPrinciple: assetPath('portal-home-right-principle.webp'),
    sharedPurpose: assetPath('portal-home-shared-purpose.webp'),
    indonesia: assetPath('portal-home-indonesia.webp'),
    motto: assetPath('portal-home-motto.webp'),
};

const learningAreas = [
    { title: 'Pendidikan', description: 'Membangun dasar', icon: BookOpen },
    { title: 'Penataran', description: 'Memperdalam kualitas', icon: GraduationCap },
    { title: 'Pembinaan', description: 'Menguatkan karakter', icon: Users },
    { title: 'Pengabdian', description: 'Untuk masyarakat', icon: Globe2 },
];

function hasSeenSplash() {
    if (typeof window === 'undefined') {
        return true;
    }

    try {
        return window.sessionStorage.getItem(splashSessionKey) === 'true';
    } catch {
        return false;
    }
}

function rememberSplash() {
    try {
        window.sessionStorage.setItem(splashSessionKey, 'true');
    } catch {
        // The splash can still close when browser storage is unavailable.
    }
}

export default function PortalEntrySplash() {
    const [phase, setPhase] = useState(() => hasSeenSplash() ? 'hidden' : 'visible');
    const closeTimerRef = useRef(null);
    const splashRef = useRef(null);

    const closeSplash = useCallback(() => {
        rememberSplash();
        setPhase((currentPhase) => currentPhase === 'hidden' ? currentPhase : 'leaving');
    }, []);

    useEffect(() => {
        if (phase !== 'visible') {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';
        splashRef.current?.focus({ preventScroll: true });

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [phase]);

    useEffect(() => {
        if (phase !== 'leaving') {
            return undefined;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        closeTimerRef.current = window.setTimeout(
            () => setPhase('hidden'),
            prefersReducedMotion ? 0 : 500,
        );

        return () => window.clearTimeout(closeTimerRef.current);
    }, [phase]);

    if (phase === 'hidden') {
        return null;
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
            event.preventDefault();
            closeSplash();
            return;
        }

        if (event.key === 'Tab') {
            event.preventDefault();
            splashRef.current?.focus();
        }
    };

    return (
        <div
            ref={splashRef}
            role="button"
            tabIndex={0}
            onClick={closeSplash}
            onKeyDown={handleKeyDown}
            className={`group fixed inset-0 z-[100] cursor-pointer overflow-y-auto overflow-x-hidden bg-[#07090b] text-white outline-none transition-opacity duration-500 ease-out focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0B63CE] motion-reduce:transition-none xl:overflow-hidden ${phase === 'leaving' ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
            aria-labelledby="portal-entry-splash-title"
            aria-describedby="portal-entry-splash-status"
        >
            <img
                src={artwork.background}
                alt=""
                width="1672"
                height="941"
                fetchPriority="high"
                className="fixed inset-0 size-full select-none object-cover object-[52%_center] xl:object-center"
                draggable="false"
            />
            <div className="fixed inset-0 bg-[linear-gradient(180deg,rgba(3,5,7,0.68)_0%,rgba(3,5,7,0.12)_38%,rgba(3,5,7,0.88)_100%)]" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_24%,rgba(2,4,6,0.62)_100%)]" />

            <div className="pointer-events-none fixed inset-0 z-10 hidden xl:block" aria-hidden="true">
                <img
                    src={artwork.leftPrinciple}
                    alt=""
                    width="738"
                    height="1330"
                    className="absolute left-[2.4%] top-[24%] h-[43%] w-auto select-none object-contain opacity-85"
                    draggable="false"
                />
                <img
                    src={artwork.citizens}
                    alt=""
                    width="1370"
                    height="480"
                    className="absolute bottom-[7.5%] left-[2.7%] w-[15vw] max-w-[265px] select-none object-contain opacity-75"
                    draggable="false"
                />
                <img
                    src={artwork.rightPrinciple}
                    alt=""
                    width="777"
                    height="1397"
                    className="absolute right-[1.8%] top-[55%] h-[34%] w-auto select-none object-contain opacity-85"
                    draggable="false"
                />
                <div className="absolute right-[3.2%] top-[13%] flex w-[14vw] max-w-[230px] flex-col items-center">
                    <img
                        src={artwork.perkemi}
                        alt=""
                        width="1099"
                        height="982"
                        className="w-full select-none object-contain drop-shadow-lg"
                        draggable="false"
                    />
                    {/* <img
                        src={artwork.indonesia}
                        alt=""
                        width="1083"
                        height="324"
                        className="mt-1 w-[105%] select-none object-contain opacity-85"
                        draggable="false"
                    /> */}
                </div>
            </div>

            <div className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-[1800px] flex-col">
                <header className="flex min-h-20 items-start justify-center px-4 pt-4 sm:min-h-24 sm:px-6 sm:pt-5 xl:absolute xl:inset-x-0 xl:top-0 xl:min-h-0 xl:p-0">
                    <div className="flex items-start justify-center gap-3 sm:gap-5 xl:absolute xl:left-[3%] xl:top-[2.2vh]">
                        <img
                            src={artwork.wsko}
                            alt="World Shorinji Kempo Organization"
                            width="878"
                            height="972"
                            className="h-14 w-auto select-none object-contain drop-shadow-lg sm:h-20 xl:h-[clamp(82px,8vw,124px)]"
                            draggable="false"
                        />
                        <img
                            src={artwork.perkemi}
                            alt="Persaudaraan Shorinji Kempo Indonesia"
                            width="1099"
                            height="982"
                            className="h-14 w-auto select-none object-contain drop-shadow-lg sm:h-20 xl:h-[clamp(82px,8vw,124px)]"
                            draggable="false"
                        />
                    </div>

                </header>

                <main className="flex flex-1 flex-col items-center justify-center gap-3 px-4 pb-5 pt-2 text-center sm:gap-4 sm:px-6 md:pb-6 xl:block xl:min-h-[100svh] xl:p-0">
                    <img
                        src={artwork.sharedPurpose}
                        alt="Belajar bersama, hidup bersama, membangun masyarakat yang lebih baik"
                        width="1542"
                        height="600"
                        className="hidden w-[min(50vw,500px)] select-none object-contain drop-shadow-lg md:block [@media(max-height:720px)]:hidden xl:absolute xl:left-1/2 xl:top-[9%] xl:w-[min(32vw,500px)] xl:-translate-x-1/2 xl:[@media(max-height:720px)]:block"
                        draggable="false"
                    />

                    <div className="w-[min(94vw,820px)] xl:absolute xl:left-1/2 xl:top-[40%] xl:w-[min(59vw,960px)] xl:-translate-x-1/2">
                        <h1 id="portal-entry-splash-title" className="sr-only">
                            Selamat datang di Portal Digital DIKTAR PB PERKEMI
                        </h1>
                        <img
                            src={artwork.welcome}
                            alt=""
                            width="1968"
                            height="427"
                            fetchPriority="high"
                            className="w-full select-none object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.8)]"
                            draggable="false"
                        />
                    </div>

                    {/* <div className="grid w-full max-w-[760px] grid-cols-2 gap-2 [@media(max-height:610px)]:hidden xl:absolute xl:left-1/2 xl:top-[75%] xl:max-w-[780px] xl:-translate-x-1/2 xl:grid-cols-4">
                        {learningAreas.map((area) => {
                            const Icon = area.icon;

                            return (
                                <div
                                    key={area.title}
                                    className="flex min-h-[76px] flex-col items-center justify-center rounded-md border border-[#e5bf70]/30 bg-black/58 px-2 py-2 text-center shadow-[0_8px_24px_rgba(0,0,0,0.25)] sm:min-h-[86px] xl:min-h-[92px]"
                                >
                                    <Icon className="size-5 text-[#efd18e] sm:size-6" strokeWidth={1.7} aria-hidden="true" />
                                    <span className="mt-1 text-[10px] font-bold tracking-[0.1em] text-white sm:text-[11px]">
                                        {area.title}
                                    </span>
                                    <span className="mt-0.5 text-[9px] text-white/58 sm:text-[10px]">
                                        {area.description}
                                    </span>
                                </div>
                            );
                        })}
                    </div> */}

                    <img
                        src={artwork.motto}
                        alt="Satu Kenshi, satu ilmu, satu pengabdian"
                        width="1987"
                        height="81"
                        className="w-[min(82vw,680px)] select-none object-contain [@media(max-height:610px)]:hidden xl:absolute xl:left-1/2 xl:top-[89%] xl:w-[min(42vw,680px)] xl:-translate-x-1/2"
                        draggable="false"
                    />
                </main>

                <footer className="relative z-20 flex min-h-10 items-center justify-center border-t border-white/12 px-4 text-center text-[10px] font-medium tracking-wide text-white/55 sm:justify-between sm:px-6 xl:absolute xl:inset-x-0 xl:bottom-0 xl:px-[3.2%]">
                    <span>© 2026 PB PERKEMI · Portal Digital DIKTAR</span>
                    <span className="hidden sm:block">Klik layar untuk melanjutkan</span>
                </footer>
            </div>
        </div>
    );
}
